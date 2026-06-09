import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";

// Admin client with service role - bypasses RLS
export function createAdminClient() {
  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export async function ensureBucketExists(bucketName: string, isPublic: boolean = false) {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient.storage.getBucket(bucketName);
  
  if (error) {
    const isNotFound = 
      error.message.toLowerCase().includes("not found") || 
      (error as any).status === 404 || 
      (error as any).statusCode === '404' ||
      (error as any).status === 400; // Some storage APIs throw 400 Bad Request for bucket not found
      
    if (isNotFound) {
      console.log(`Bucket '${bucketName}' not found. Creating it...`);
      const { error: createError } = await adminClient.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 52428800, // 50MB
      });
      if (createError) {
        console.error(`Failed to create bucket '${bucketName}':`, createError);
        throw createError;
      }
      console.log(`Bucket '${bucketName}' created successfully.`);
      return;
    }
    console.error(`Error checking bucket '${bucketName}':`, error);
    throw error;
  }
}


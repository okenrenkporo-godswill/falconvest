import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables! Check your .env file.");
  process.exit(1);
}

// Basic check for duplicate keys
if (supabaseServiceKey === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error("❌ ERROR: Your SUPABASE_SERVICE_ROLE_KEY is identical to your ANON key.");
  console.error("   You MUST use the 'service_role' key from your Supabase Dashboard to seed users.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function seedUsers() {
  const users = [
    {
      email: "admin@synctrade.com",
      password: "Admin123!",
      role: "admin",
      firstName: "System",
      lastName: "Admin",
      username: "admin",
    },
    {
      email: "user@synctrade.com",
      password: "User123!",
      role: "user",
      firstName: "Test",
      lastName: "User",
      username: "testuser",
    },
  ];

  console.log("🚀 Starting TypeScript user seeding...");

  for (const userData of users) {
    console.log(`\nCreating user: ${userData.email}`);

    // Create user in auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: userData.username,
      },
    });

    if (authError) {
      if (authError.message.includes("already exists")) {
        console.log(`User ${userData.email} already exists in Auth. Updating profile...`);
      } else {
        console.error(`Error creating auth user ${userData.email}:`, authError.message);
        continue;
      }
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .update({ role: userData.role })
      .eq("email", userData.email);

    if (profileError) {
      console.error(`Error updating profile role for ${userData.email}:`, profileError.message);
    } else {
      console.log(`✅ Successfully seeded ${userData.role}: ${userData.email}`);
    }
  }

  console.log("\n✨ Seeding complete.");
}

seedUsers();

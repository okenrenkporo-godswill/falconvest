import { createAdminClient } from "@/lib/supabase/admin";

export default async function KycDebugPage() {
  const adminClient = createAdminClient();
  
  // Get all submissions
  const { data: allSubmissions, error } = await adminClient
    .from("kyc_submissions")
    .select("id, user_id, status, created_at");

  // Get status counts
  const stats = {
    total: allSubmissions?.length || 0,
    pending: allSubmissions?.filter(s => s.status === "pending").length || 0,
    approved: allSubmissions?.filter(s => s.status === "manually_verified" || s.status === "auto_verified").length || 0,
    rejected: allSubmissions?.filter(s => s.status === "rejected").length || 0,
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">KYC Debug Page</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Stats</h2>
        <pre className="text-sm">{JSON.stringify(stats, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="font-bold mb-2">Error</h2>
        <pre className="text-sm">{error ? JSON.stringify(error, null, 2) : "No error"}</pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <h2 className="font-bold mb-2">All Submissions ({allSubmissions?.length || 0})</h2>
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">ID</th>
                <th className="text-left p-2">User ID</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {allSubmissions?.map((sub) => (
                <tr key={sub.id} className="border-b">
                  <td className="p-2 font-mono text-xs">{sub.id.slice(0, 8)}...</td>
                  <td className="p-2 font-mono text-xs">{sub.user_id.slice(0, 8)}...</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      sub.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      sub.status === 'manually_verified' || sub.status === 'auto_verified' ? 'bg-green-200 text-green-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-2 text-xs">{new Date(sub.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

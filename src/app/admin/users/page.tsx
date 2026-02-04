import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button } from "@heroui/react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAllUsers, deleteUserAction } from "@/actions/admin";

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const allUsers = await getAllUsers();

  const statusColors: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    auto_verified: "success",
    manually_verified: "success",
    rejected: "danger",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <Table aria-label="Users table">
        <TableHeader>
          <TableColumn>Name</TableColumn>
          <TableColumn>Email</TableColumn>
          <TableColumn>Username</TableColumn>
          <TableColumn>Country</TableColumn>
          <TableColumn>KYC Status</TableColumn>
          <TableColumn>Joined</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody>
          {allUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.full_name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.country}</TableCell>
              <TableCell>
                <Chip color={statusColors[user.kyc_status]} variant="flat" size="sm">
                  {user.kyc_status}
                </Chip>
              </TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <form action={async () => {
                  "use server";
                  await deleteUserAction(user.id);
                }}>
                  <Button type="submit" color="danger" size="sm" variant="light">
                    Delete
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

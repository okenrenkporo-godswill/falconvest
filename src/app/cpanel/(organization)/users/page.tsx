import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
} from "@heroui/react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getAllUsers, deleteUserAction } from "@/actions/admin";

export default async function UsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cpanel");
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

  return console.log("allUsers", allUsers);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <Table aria-label="Users table">
        <TableHeader>
          <TableColumn key="name">Name</TableColumn>
          <TableColumn key="email">Email</TableColumn>
          <TableColumn key="username">Username</TableColumn>
          <TableColumn key="country">Country</TableColumn>
          <TableColumn key="kyc_status">KYC Status</TableColumn>
          <TableColumn key="joined">Joined</TableColumn>
          <TableColumn key="actions">Actions</TableColumn>
        </TableHeader>
        <TableBody items={allUsers || []} emptyContent="No users found">
          {(user) => (
            <TableRow key={user.id}>
              <TableCell>
                {user.first_name} {user.last_name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.country}</TableCell>
              <TableCell>
                <Chip
                  color={statusColors[user.kyc_status] || "default"}
                  variant="flat"
                  size="sm"
                >
                  {user.kyc_status || "N/A"}
                </Chip>
              </TableCell>
              <TableCell>
                {new Date(user.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <form
                  action={async () => {
                    "use server";
                    await deleteUserAction(user.id);
                  }}
                >
                  <Button
                    type="submit"
                    color="danger"
                    size="sm"
                    variant="light"
                  >
                    Delete
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

"use client";

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
import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/actions/admin";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  country: string;
  kyc_status: string;
  created_at: string;
}

export function UsersTable({ users }: { users: User[] | null }) {
  const statusColors: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    auto_verified: "success",
    manually_verified: "success",
    rejected: "danger",
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    await deleteUserAction(userId);
  };

  return (
    <Table aria-label="Users table">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>USERNAME</TableColumn>
        <TableColumn>COUNTRY</TableColumn>
        <TableColumn>KYC STATUS</TableColumn>
        <TableColumn>JOINED</TableColumn>
        <TableColumn>ACTIONS</TableColumn>
      </TableHeader>
      <TableBody emptyContent="No users found">
        {(users || []).map((user) => (
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
              <Button
                size="sm"
                color="danger"
                variant="light"
                startContent={<Trash2 size={16} />}
                onPress={() => handleDelete(user.id)}
              >
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

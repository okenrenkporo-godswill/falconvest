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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
} from "@heroui/react";
import { Trash2, MoreVertical, Ban, CheckCircle } from "lucide-react";
import { deleteUserAction, suspendUserAccount, reactivateUserAccount } from "@/actions/admin";
import { useState } from "react";

interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  country: string;
  kyc_status: string;
  account_status?: string;
  created_at: string;
}

export function UsersTable({ users, onUpdate }: { users: User[] | null; onUpdate: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);

  const statusColors: Record<string, "warning" | "success" | "danger"> = {
    pending: "warning",
    auto_verified: "success",
    manually_verified: "success",
    rejected: "danger",
  };

  const accountStatusColors: Record<string, "success" | "warning" | "danger"> = {
    active: "success",
    suspended: "danger",
    deactivated: "warning",
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    setLoading(userId);
    const result = await deleteUserAction(userId);
    setLoading(null);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: "User deleted", color: "success" });
      onUpdate();
    }
  };

  const handleSuspend = async (userId: string, email: string) => {
    const reason = prompt("Enter suspension reason:");
    if (!reason) return;
    
    setLoading(userId);
    const result = await suspendUserAccount(userId, reason);
    setLoading(null);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: `${email} has been suspended`, color: "success" });
      onUpdate();
    }
  };

  const handleReactivate = async (userId: string, email: string) => {
    if (!confirm(`Reactivate account for ${email}?`)) return;
    
    setLoading(userId);
    const result = await reactivateUserAccount(userId);
    setLoading(null);
    
    if (result.error) {
      addToast({ title: "Error", description: result.error, color: "danger" });
    } else {
      addToast({ title: "Success", description: `${email} has been reactivated`, color: "success" });
      onUpdate();
    }
  };

  return (
    <Table aria-label="Users table">
      <TableHeader>
        <TableColumn>NAME</TableColumn>
        <TableColumn>EMAIL</TableColumn>
        <TableColumn>USERNAME</TableColumn>
        <TableColumn>COUNTRY</TableColumn>
        <TableColumn>ACCOUNT STATUS</TableColumn>
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
                color={accountStatusColors[user.account_status || "active"] || "success"}
                variant="flat"
                size="sm"
              >
                {user.account_status || "active"}
              </Chip>
            </TableCell>
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
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    size="sm"
                    variant="light"
                    isIconOnly
                    isLoading={loading === user.id}
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User actions">
                  {user.account_status === "suspended" ? (
                    <DropdownItem
                      key="reactivate"
                      startContent={<CheckCircle size={16} />}
                      onPress={() => handleReactivate(user.id, user.email)}
                    >
                      Reactivate Account
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key="suspend"
                      startContent={<Ban size={16} />}
                      onPress={() => handleSuspend(user.id, user.email)}
                    >
                      Suspend Account
                    </DropdownItem>
                  )}
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    startContent={<Trash2 size={16} />}
                    onPress={() => handleDelete(user.id)}
                  >
                    Delete User
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

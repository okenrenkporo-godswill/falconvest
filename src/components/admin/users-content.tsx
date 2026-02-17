"use client";

import { Card, CardBody, Skeleton, Chip, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { getAllUsers } from "@/actions/admin";
import { Search } from "lucide-react";
import Link from "next/link";
import { Pagination } from "@/components/shared/pagination";

export function UsersContent() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ verified: 0, pending: 0, unverified: 0 });

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

  const loadUsers = async (page: number) => {
    setIsLoading(true);
    const result = await getAllUsers(page, 20);
    setUsers(result.data);
    setFilteredUsers(result.data);
    setTotalPages(result.totalPages);
    setTotalCount(result.totalCount);
    setStats(result.stats);
    setIsLoading(false);
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 rounded-lg mb-2" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-none shadow-sm dark:bg-zinc-900">
              <CardBody className="p-4">
                <Skeleton className="h-4 w-24 rounded-lg mb-2" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 rounded-lg" />
                  <Skeleton className="h-3 w-32 rounded-lg" />
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-sm text-default-500 mt-1">
          View and manage all registered users
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-md dark:bg-zinc-900 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
          <CardBody className="p-4">
            <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">Total Users</p>
            <p className="text-3xl font-bold text-primary-900 dark:text-primary-100 mt-1">{totalCount}</p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/20">
          <CardBody className="p-4">
            <p className="text-sm text-success-700 dark:text-success-300 font-medium">Verified</p>
            <p className="text-3xl font-bold text-success-900 dark:text-success-100 mt-1">
              {stats.verified}
            </p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/20">
          <CardBody className="p-4">
            <p className="text-sm text-warning-700 dark:text-warning-300 font-medium">Pending KYC</p>
            <p className="text-3xl font-bold text-warning-900 dark:text-warning-100 mt-1">
              {stats.pending}
            </p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/20">
          <CardBody className="p-4">
            <p className="text-sm text-danger-700 dark:text-danger-300 font-medium">Unverified</p>
            <p className="text-3xl font-bold text-danger-900 dark:text-danger-100 mt-1">
              {stats.unverified}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">All Users</h2>
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search size={16} />}
              className="max-w-xs"
              size="sm"
            />
          </div>

          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <p className="text-sm text-default-500 text-center py-8">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <Link key={user.id} href={`/cpanel/users/${user.id}`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-default-50 dark:bg-default-50/5 gap-3 hover:bg-default-100 dark:hover:bg-default-50/10 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <p className="font-semibold">{user.full_name || "No name"}</p>
                      <p className="text-sm text-default-500">{user.email}</p>
                      <p className="text-xs text-default-400 mt-1">
                        Joined: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Chip
                        size="sm"
                        color={
                          user.kyc_status === "manually_verified" || user.kyc_status === "auto_verified"
                            ? "success"
                            : user.kyc_status === "pending"
                            ? "warning"
                            : "danger"
                        }
                      >
                        {user.kyc_status || "unverified"}
                      </Chip>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardBody>
      </Card>
    </div>
  );
}

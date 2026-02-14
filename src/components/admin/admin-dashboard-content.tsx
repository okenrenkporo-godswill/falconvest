"use client";

import { Card, CardBody, Skeleton, Chip } from "@heroui/react";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/actions/admin-dashboard";
import { Users, ShieldAlert, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import Link from "next/link";

export function AdminDashboardContent() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAdminStats().then((data) => {
      setStats(data);
      setIsLoading(false);
    });
  }, []);

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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-default-500 mt-1">
          Overview of platform activity and pending actions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cpanel/users">
          <Card className="border-none shadow-sm dark:bg-zinc-900 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-default-500">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/kyc-pending">
          <Card className="border-none shadow-sm bg-warning-50 dark:bg-warning-900/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <ShieldAlert size={20} className="text-warning" />
                </div>
                <div>
                  <p className="text-sm text-warning-700 dark:text-warning-300">Pending KYC</p>
                  <p className="text-3xl font-bold text-warning-900 dark:text-warning-100 mt-1">
                    {stats.pendingKyc}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/deposits">
          <Card className="border-none shadow-sm bg-success-50 dark:bg-success-900/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <ArrowDownCircle size={20} className="text-success" />
                </div>
                <div>
                  <p className="text-sm text-success-700 dark:text-success-300">Pending Deposits</p>
                  <p className="text-3xl font-bold text-success-900 dark:text-success-100 mt-1">
                    {stats.pendingDeposits}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>

        <Link href="/cpanel/withdrawals">
          <Card className="border-none shadow-sm bg-danger-50 dark:bg-danger-900/20 hover:shadow-md transition-shadow cursor-pointer">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger/10 rounded-lg">
                  <ArrowUpCircle size={20} className="text-danger" />
                </div>
                <div>
                  <p className="text-sm text-danger-700 dark:text-danger-300">Pending Withdrawals</p>
                  <p className="text-3xl font-bold text-danger-900 dark:text-danger-100 mt-1">
                    {stats.pendingWithdrawals}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>

      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-6">
          <h2 className="text-lg font-bold mb-4">Recent Users</h2>
          <div className="space-y-3">
            {stats.recentUsers.length === 0 ? (
              <p className="text-sm text-default-500 text-center py-8">No users yet</p>
            ) : (
              stats.recentUsers.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-50/5"
                >
                  <div>
                    <p className="font-semibold">{user.full_name || "No name"}</p>
                    <p className="text-sm text-default-500">{user.email}</p>
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
                      {user.kyc_status}
                    </Chip>
                    <p className="text-xs text-default-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

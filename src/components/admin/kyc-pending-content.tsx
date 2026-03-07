"use client";

import { Card, CardBody, Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";
import { getPendingKycSubmissions } from "@/actions/admin";
import { KycReviewTable } from "./kyc-review-table";
import { Pagination } from "@/components/shared/pagination";

export function KycPendingContent() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    loadSubmissions(currentPage);
  }, [currentPage]);

  const loadSubmissions = async (page: number) => {
    setIsLoading(true);
    console.log("Loading KYC submissions for page:", page);
    const result = await getPendingKycSubmissions(page, 15);
    console.log("Received result:", {
      dataCount: result.data.length,
      totalPages: result.totalPages,
      stats: result.stats
    });
    setSubmissions(result.data);
    setTotalPages(result.totalPages);
    setStats(result.stats);
    setIsLoading(false);
  };

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
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-sm text-default-500 mt-1">
          Review and verify user identity submissions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-zinc-900">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Submissions</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-warning-50 dark:bg-warning-900/20">
          <CardBody className="p-4">
            <p className="text-sm text-warning-700 dark:text-warning-300">Pending Review</p>
            <p className="text-3xl font-bold text-warning-900 dark:text-warning-100 mt-1">
              {stats.pending}
            </p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-success-50 dark:bg-success-900/20">
          <CardBody className="p-4">
            <p className="text-sm text-success-700 dark:text-success-300">Approved</p>
            <p className="text-3xl font-bold text-success-900 dark:text-success-100 mt-1">
              {stats.approved}
            </p>
          </CardBody>
        </Card>

        <Card className="border-none shadow-sm bg-danger-50 dark:bg-danger-900/20">
          <CardBody className="p-4">
            <p className="text-sm text-danger-700 dark:text-danger-300">Rejected</p>
            <p className="text-3xl font-bold text-danger-900 dark:text-danger-100 mt-1">
              {stats.rejected}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="border-none shadow-sm dark:bg-zinc-900">
        <CardBody className="p-0">
          <KycReviewTable submissions={submissions} onUpdate={() => loadSubmissions(currentPage)} />
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

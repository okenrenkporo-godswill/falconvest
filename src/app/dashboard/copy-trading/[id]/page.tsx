"use client";

import { use, useState, useEffect } from "react";
import { Button, Card, CardBody, Avatar, Chip, Tabs, Tab, Skeleton } from "@heroui/react";
import { ArrowLeft, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CopySettingsModal } from "@/components/copy-trading/copy-settings-modal";
import { getTraderById } from "@/actions/traders";
import { notFound } from "next/navigation";

function VerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="0 0 22 22" width={size} height={size} aria-label="Verified account" className="flex-shrink-0">
      <path
        d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.855-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.69-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.636.433 1.221.878 1.69.47.446 1.055.752 1.69.883.635.13 1.294.083 1.902-.143.271.586.702 1.084 1.24 1.438.54.354 1.167.551 1.813.569.646-.018 1.273-.215 1.813-.569.54-.354.969-.853 1.24-1.438.608.226 1.267.276 1.902.143.635-.13 1.22-.437 1.69-.883.445-.469.749-1.054.878-1.69.13-.633.08-1.29-.144-1.896.587-.274 1.084-.705 1.438-1.245.354-.54.551-1.17.569-1.817z"
        fill="#1D9BF0"
      />
      <path
        d="M9.585 14.929l-3.28-3.28 1.168-1.168 2.112 2.112 5.036-5.036 1.168 1.168z"
        fill="white"
      />
    </svg>
  );
}

type Trader = {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  total_followers: number;
  total_profit: number;
  win_rate: number;
  total_trades: number;
  risk_score: number | null;
  min_copy_amount: number;
  commission_rate: number;
};

export default function TraderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trader, setTrader] = useState<Trader | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadTrader();
  }, [id]);

  const loadTrader = async () => {
    const data = await getTraderById(id);
    if (!data) {
      notFound();
    }
    setTrader(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 p-4">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-48 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!trader) return null;

  const riskScore = trader.risk_score || 5;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      <Link href="/dashboard/copy-trading" className="inline-flex items-center text-sm text-default-500 hover:text-primary transition-colors">
        <ArrowLeft size={16} className="mr-1" /> Back to Traders
      </Link>

      <Card className="border-none shadow-md bg-gradient-to-br from-default-50 to-default-100 dark:from-default-100/10 dark:to-default-50/5">
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <Avatar
                src={trader.avatar_url || undefined}
                name={trader.display_name}
                className="w-20 h-20 text-3xl font-bold bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold break-words">{trader.display_name}</h1>
                  <VerifiedBadge size={24} />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {riskScore <= 3 ? (
                    <Chip size="sm" variant="flat" color="success">Low Risk</Chip>
                  ) : riskScore <= 7 ? (
                    <Chip size="sm" variant="flat" color="warning">Moderate Risk</Chip>
                  ) : (
                    <Chip size="sm" variant="flat" color="danger">High Risk</Chip>
                  )}
                </div>
              </div>
            </div>

            <Button
              className="w-full sm:w-auto font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black shadow-lg"
              size="lg"
              onPress={() => setIsModalOpen(true)}
            >
              Copy Now
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8 pt-6 border-t border-default-200/50">
            <div>
              <p className="text-default-500 text-xs uppercase font-bold mb-1">Total Profit</p>
              <p className={`text-2xl font-bold ${trader.total_profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                ${trader.total_profit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-default-500 text-xs uppercase font-bold mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-default-900">{trader.win_rate}%</p>
            </div>
            <div>
              <p className="text-default-500 text-xs uppercase font-bold mb-1">Total Trades</p>
              <p className="text-2xl font-bold text-default-900">{trader.total_trades}</p>
            </div>
            <div>
              <p className="text-default-500 text-xs uppercase font-bold mb-1">Followers</p>
              <p className="text-2xl font-bold text-default-900">{trader.total_followers}</p>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="p-0">
              <Tabs fullWidth size="lg" aria-label="Trader Data" variant="underlined">
                <Tab key="about" title="About">
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Biography</h3>
                      <p className="text-default-600">{trader.bio || "No biography provided."}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Minimum Copy Amount</h3>
                      <p className="text-2xl font-bold text-primary">${trader.min_copy_amount.toLocaleString()}</p>
                    </div>
                  </div>
                </Tab>
                <Tab key="copiers" title="Copiers">
                  <div className="p-8 text-center text-default-400 text-sm">
                    <Users size={24} className="mx-auto mb-2 opacity-50" />
                    {trader.total_followers} active copiers
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>
        </div>

        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-5 space-y-6">
            <h3 className="font-semibold text-lg">Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-orange-500" />
                  <span className="text-default-500">Risk Score</span>
                </div>
                <span className="font-medium">{riskScore}/10</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-default-500">Total Trades</span>
                <span className="font-medium">{trader.total_trades}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-default-500">Win Rate</span>
                <span className="font-medium">{trader.win_rate}%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-default-500">Commission Rate</span>
                <span className="font-medium">{trader.commission_rate}%</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <CopySettingsModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        trader={trader}
      />
    </div>
  );
}

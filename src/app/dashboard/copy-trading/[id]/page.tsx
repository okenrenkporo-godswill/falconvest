"use client";

import { use, useState, useEffect } from "react";
import { Button, Card, CardBody, Avatar, Chip, Tabs, Tab, Skeleton } from "@heroui/react";
import { ArrowLeft, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { CopySettingsModal } from "@/components/copy-trading/copy-settings-modal";
import { getTraderById } from "@/actions/traders";
import { notFound } from "next/navigation";

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

      <Card className="border-none shadow-md bg-gradient-to-br from-default-50 to-default-100 dark:from-default-900/50 dark:to-default-900">
        <CardBody className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            <div className="flex gap-4 items-center">
              <Avatar
                src={trader.avatar_url || undefined}
                name={trader.display_name}
                className="w-20 h-20 text-3xl font-bold bg-gradient-to-br from-primary-500 to-secondary-500 text-white shadow-lg"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">{trader.display_name}</h1>
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

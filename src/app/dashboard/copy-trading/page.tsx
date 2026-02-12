"use client";

import { useState, useMemo, useEffect } from "react";
import { Button, Input, Select, SelectItem, Skeleton } from "@heroui/react";
import { Search } from "lucide-react";
import { TraderCard } from "@/components/copy-trading/trader-card";
import { CopySettingsModal } from "@/components/copy-trading/copy-settings-modal";
import { getActiveTraders } from "@/actions/traders";
import { Pagination } from "@/components/shared/pagination";

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

export default function CopyTradingPage() {
  const [traders, setTraders] = useState<Trader[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("followers");
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadTraders(currentPage);
  }, [currentPage]);

  const loadTraders = async (page: number) => {
    setLoading(true);
    const result = await getActiveTraders(page, 12);
    setTraders(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  const handleCopyClick = (trader: Trader) => {
    setSelectedTrader(trader);
    setIsModalOpen(true);
  };

  const filteredTraders = useMemo(() => {
    let result = [...traders];

    if (searchQuery) {
      result = result.filter(t =>
        t.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    result.sort((a, b) => {
      if (sortBy === "followers") return b.total_followers - a.total_followers;
      if (sortBy === "profit") return b.total_profit - a.total_profit;
      if (sortBy === "winRate") return b.win_rate - a.win_rate;
      return 0;
    });

    return result;
  }, [searchQuery, sortBy, traders]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4">

      {/* Hero Section */}
      <div className="relative rounded-xl bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-6 sm:p-8 overflow-hidden shadow-md">
        <div className="relative z-10 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Master Copy Trading</h1>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl">
            Automatically copy the trades of top-performing investors. Browse the list below, analyze their performance history, and select a trader that matches your risk appetite to start earning.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/20 rounded-full translate-y-1/2 blur-2xl"></div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold self-start sm:self-center">Top Traders</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search traders..."
            startContent={<Search size={18} className="text-default-400" />}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="w-full sm:w-64"
          />
          <Select
            className="w-40"
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <SelectItem key="followers">Most Followers</SelectItem>
            <SelectItem key="profit">Highest Profit</SelectItem>
            <SelectItem key="winRate">Win Rate</SelectItem>
          </Select>
        </div>
      </div>

      {/* Trader Grid */}
      {filteredTraders.length === 0 ? (
        <div className="text-center py-12 text-default-500">
          No traders found
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTraders.map((trader) => (
              <TraderCard key={trader.id} trader={trader} onCopy={handleCopyClick} />
            ))}
          </div>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* Modal */}
      <CopySettingsModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        trader={selectedTrader}
      />

    </div>
  );
}

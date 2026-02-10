"use client";

import { useState, useMemo } from "react";
import { Button, Input, Select, SelectItem, Pagination } from "@heroui/react";
import { Search, Filter, ArrowUpRight } from "lucide-react";
import { MOCK_TRADERS, Trader } from "@/data/mock-traders";
import { TraderCard } from "@/components/copy-trading/trader-card";
import { CopySettingsModal } from "@/components/copy-trading/copy-settings-modal";

export default function CopyTradingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("roi"); // roi, aum, winRate
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyClick = (trader: Trader) => {
    setSelectedTrader(trader);
    setIsModalOpen(true);
  };

  // Filter and Sort Logic
  const filteredTraders = useMemo(() => {
    let result = [...MOCK_TRADERS];

    if (searchQuery) {
      result = result.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      if (sortBy === "roi") return b.roi - a.roi;
      if (sortBy === "aum") return b.aum - a.aum;
      if (sortBy === "winRate") return b.winRate - a.winRate;
      return 0;
    });

    return result;
  }, [searchQuery, sortBy]);

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
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-pink-500/20 rounded-full translate-y-1/2 blur-2xl"></div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Copiers", value: "125,000+" },
          { label: "Total AUM", value: "$450M+" },
          { label: "Traders", value: "850+" },
          { label: "Avg. ROI", value: "124%" }
        ].map((stat, i) => (
          <div key={i} className="bg-default-50 dark:bg-content1/50 p-4 rounded-xl border border-default-100 dark:border-default-50/10">
            <p className="text-default-500 text-sm">{stat.label}</p>
            <p className="text-2xl font-bold text-default-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Controls: Search & Filter */}
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
            defaultSelectedKeys={["roi"]}
            className="w-40"
            startContent={<Filter size={16} className="text-default-500" />}
            selectedKeys={[sortBy]}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <SelectItem key="roi" textValue="Highest ROI">Highest ROI</SelectItem>
            <SelectItem key="aum" textValue="Highest AUM">Highest AUM</SelectItem>
            <SelectItem key="winRate" textValue="Win Rate">Win Rate</SelectItem>
          </Select>
        </div>
      </div>

      {/* Trader Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTraders.map((trader) => (
          <TraderCard key={trader.id} trader={trader} onCopy={handleCopyClick} />
        ))}
      </div>

      {/* Modal */}
      <CopySettingsModal
        isOpen={isModalOpen}
        onOpenChange={() => setIsModalOpen(false)}
        trader={selectedTrader}
      />

    </div>
  );
}

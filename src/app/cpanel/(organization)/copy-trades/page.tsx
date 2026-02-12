"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Button, Chip, Skeleton, Avatar, addToast, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select, SelectItem } from "@heroui/react";
import { getAllCopyTrades, adminStopCopyTrade } from "@/actions/admin-copy-trading";
import { adminCreateCopyPosition } from "@/actions/admin-copy-positions";
import { Users, X, Plus, TrendingUp } from "lucide-react";
import { Pagination } from "@/components/shared/pagination";

type CopyTrade = {
  id: string;
  user_id: string;
  trader_id: string;
  copy_amount: number;
  status: string;
  total_profit: number;
  total_trades: number;
  started_at: string;
  trader?: {
    display_name: string;
    avatar_url: string | null;
  };
};

type CoinData = {
  symbol: string;
  name: string;
  image: string;
  current_price: number;
};

export default function AdminCopyTradesPage() {
  const [copyTrades, setCopyTrades] = useState<CopyTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [selectedCopyTrade, setSelectedCopyTrade] = useState<CopyTrade | null>(null);
  const [positionData, setPositionData] = useState({
    pair: "BTC/USDT",
    side: "buy",
    amount: "",
    entryPrice: "",
    profitLoss: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loadingPairs, setLoadingPairs] = useState(false);
  const [showPairSelect, setShowPairSelect] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCopyTrades(currentPage);
  }, [currentPage]);

  const loadCopyTrades = async (page: number) => {
    setLoading(true);
    const result = await getAllCopyTrades(page, 20);
    setCopyTrades(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (isPositionModalOpen && coins.length === 0) {
      fetchTradingPairs();
    }
  }, [isPositionModalOpen]);

  const fetchTradingPairs = async () => {
    setLoadingPairs(true);
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1'
      );
      const data = await response.json();
      const coinData = data.map((coin: any) => ({
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        current_price: coin.current_price,
      }));
      setCoins(coinData);
      if (coinData.length > 0) {
        setPositionData(prev => ({ 
          ...prev, 
          pair: `${coinData[0].symbol}/USDT`,
          entryPrice: coinData[0].current_price.toString()
        }));
      }
    } catch (error) {
      console.error("Failed to fetch trading pairs:", error);
      setCoins([
        { symbol: 'BTC', name: 'Bitcoin', image: '', current_price: 0 },
        { symbol: 'ETH', name: 'Ethereum', image: '', current_price: 0 },
      ]);
    } finally {
      setLoadingPairs(false);
    }
  };

  const handleStop = async (copyTradeId: string) => {
    const result = await adminStopCopyTrade(copyTradeId);
    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Copy trade stopped",
        color: "success",
      });
      loadCopyTrades(currentPage);
    }
  };

  const handleOpenPositionModal = (copyTrade: CopyTrade) => {
    setSelectedCopyTrade(copyTrade);
    setShowPairSelect(false);
    setIsPositionModalOpen(true);
  };

  const handleCreatePosition = async () => {
    if (!selectedCopyTrade) return;

    setIsSubmitting(true);
    const result = await adminCreateCopyPosition({
      copyTradeId: selectedCopyTrade.id,
      pair: positionData.pair,
      side: positionData.side as "buy" | "sell",
      amount: parseFloat(positionData.amount),
      entryPrice: parseFloat(positionData.entryPrice),
      profitLoss: parseFloat(positionData.profitLoss),
    });
    setIsSubmitting(false);

    if (result.error) {
      addToast({
        title: "Error",
        description: result.error,
        color: "danger",
      });
    } else {
      addToast({
        title: "Success",
        description: "Position created and closed with P&L",
        color: "success",
      });
      setIsPositionModalOpen(false);
      setPositionData({ pair: "BTC/USDT", side: "buy", amount: "", entryPrice: "", profitLoss: "" });
      loadCopyTrades(currentPage);
    }
  };

  const filteredTrades = copyTrades.filter((ct) => {
    if (filter === "all") return true;
    return ct.status === filter;
  });

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Copy Trades Monitoring</h1>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "solid" : "flat"}
            onPress={() => setFilter("all")}
          >
            All ({copyTrades.length})
          </Button>
          <Button
            size="sm"
            variant={filter === "active" ? "solid" : "flat"}
            onPress={() => setFilter("active")}
          >
            Active ({copyTrades.filter((t) => t.status === "active").length})
          </Button>
          <Button
            size="sm"
            variant={filter === "stopped" ? "solid" : "flat"}
            onPress={() => setFilter("stopped")}
          >
            Stopped ({copyTrades.filter((t) => t.status === "stopped").length})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Copy Trades</p>
            <p className="text-2xl font-bold">{copyTrades.length}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Active</p>
            <p className="text-2xl font-bold text-success">{copyTrades.filter(t => t.status === "active").length}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Volume</p>
            <p className="text-2xl font-bold">${copyTrades.reduce((sum, t) => sum + t.copy_amount, 0).toLocaleString()}</p>
          </CardBody>
        </Card>
        <Card className="border-none shadow-sm dark:bg-content1/50">
          <CardBody className="p-4">
            <p className="text-sm text-default-500">Total Profit</p>
            <p className="text-2xl font-bold text-success">${copyTrades.reduce((sum, t) => sum + t.total_profit, 0).toLocaleString()}</p>
          </CardBody>
        </Card>
      </div>

      {/* Copy Trades List */}
      <div className="grid gap-4">
        {filteredTrades.map((ct) => (
          <Card key={ct.id} className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar
                    src={ct.trader?.avatar_url || undefined}
                    name={ct.trader?.display_name}
                    className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 text-white"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{ct.trader?.display_name}</h3>
                      <Chip
                        color={ct.status === "active" ? "success" : "default"}
                        variant="flat"
                        size="sm"
                      >
                        {ct.status}
                      </Chip>
                    </div>
                    <p className="text-sm text-default-500">User: {ct.user_id.slice(0, 8)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-default-500 mb-1">Copy Amount</p>
                    <p className="text-lg font-bold">${ct.copy_amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-default-500 mb-1">Profit</p>
                    <p className={`text-lg font-bold ${ct.total_profit >= 0 ? "text-success" : "text-danger"}`}>
                      {ct.total_profit >= 0 ? "+" : ""}${ct.total_profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-default-500 mb-1">Trades</p>
                    <p className="text-lg font-bold">{ct.total_trades}</p>
                  </div>
                  {ct.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={() => handleOpenPositionModal(ct)}
                        startContent={<Plus size={16} />}
                      >
                        Add Trade
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleStop(ct.id)}
                        startContent={<X size={16} />}
                      >
                        Stop
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}

        {filteredTrades.length === 0 && (
          <Card className="border-none shadow-sm dark:bg-content1/50">
            <CardBody className="text-center py-12 text-default-500">
              No copy trades found
            </CardBody>
          </Card>
        )}
      </div>

      {/* Create Position Modal */}
      <Modal isOpen={isPositionModalOpen} onOpenChange={setIsPositionModalOpen} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                <div>
                  <h3 className="text-lg font-bold">Create Trade Position</h3>
                  <p className="text-sm text-default-500">For {selectedCopyTrade?.trader?.display_name}</p>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  {!showPairSelect ? (
                    <div className="border border-default-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-default-500">Trading Pair</span>
                        <Button
                          size="sm"
                          variant="flat"
                          onPress={() => setShowPairSelect(true)}
                        >
                          Change
                        </Button>
                      </div>
                      {(() => {
                        const selectedCoin = coins.find(c => `${c.symbol}/USDT` === positionData.pair);
                        return selectedCoin ? (
                          <div className="flex items-center gap-3">
                            {selectedCoin.image && (
                              <img src={selectedCoin.image} alt={selectedCoin.name} className="w-10 h-10 rounded-full" />
                            )}
                            <div className="flex-1">
                              <div className="font-bold text-lg">{selectedCoin.symbol}/USDT</div>
                              <div className="text-sm text-default-500">{selectedCoin.name}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-default-500">Current Price</div>
                              <div className="font-bold">${selectedCoin.current_price.toLocaleString()}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-default-500">Loading...</div>
                        );
                      })()}
                    </div>
                  ) : (
                    <Select
                      label="Trading Pair"
                      selectedKeys={[positionData.pair]}
                      onChange={(e) => {
                        const selectedCoin = coins.find(c => `${c.symbol}/USDT` === e.target.value);
                        setPositionData({ 
                          ...positionData, 
                          pair: e.target.value,
                          entryPrice: selectedCoin?.current_price.toString() || positionData.entryPrice
                        });
                        setShowPairSelect(false);
                      }}
                      isLoading={loadingPairs}
                      placeholder={loadingPairs ? "Loading pairs..." : "Select trading pair"}
                    >
                      {coins.map((coin) => (
                        <SelectItem 
                          key={`${coin.symbol}/USDT`} 
                          textValue={`${coin.symbol}/USDT - ${coin.name}`}
                          startContent={
                            coin.image ? (
                              <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                            ) : null
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{coin.symbol}/USDT</span>
                              <span className="text-xs text-default-500">{coin.name}</span>
                            </div>
                            <span className="text-sm">${coin.current_price.toLocaleString()}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                  <Select
                    label="Side"
                    selectedKeys={[positionData.side]}
                    onChange={(e) => setPositionData({ ...positionData, side: e.target.value })}
                  >
                    <SelectItem key="buy">Buy</SelectItem>
                    <SelectItem key="sell">Sell</SelectItem>
                  </Select>
                  <Input
                    label="Amount"
                    type="number"
                    value={positionData.amount}
                    onValueChange={(value) => setPositionData({ ...positionData, amount: value })}
                    placeholder="0.5"
                  />
                  <Input
                    label="Entry Price"
                    type="number"
                    value={positionData.entryPrice}
                    onValueChange={(value) => setPositionData({ ...positionData, entryPrice: value })}
                    placeholder="43500"
                  />
                  <Input
                    label="Profit/Loss (USDT)"
                    type="number"
                    value={positionData.profitLoss}
                    onValueChange={(value) => setPositionData({ ...positionData, profitLoss: value })}
                    placeholder="150 or -50"
                    description="Positive for profit, negative for loss"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCreatePosition}
                  isLoading={isSubmitting}
                  startContent={<TrendingUp size={16} />}
                >
                  Create & Close Trade
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

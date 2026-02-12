import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
  id: string;
  pair: string;
  side: "long" | "short";
  entry_price: number;
  amount: number;
  leverage: number;
  unrealized_pnl: number;
  opened_at: string;
  status: "open" | "closed";
}

export interface Trade {
  id: string;
  pair: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  amount: number;
  price: number;
  total: number;
  fee: number;
  status: string;
  created_at: string;
}

interface TradingState {
  positions: Position[];
  trades: Trade[];
  balance: number;
  
  // Actions
  setPositions: (positions: Position[]) => void;
  addPosition: (position: Position) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  removePosition: (id: string) => void;
  
  setTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  
  setBalance: (balance: number) => void;
  updateBalance: (amount: number) => void;
}

export const useTradingStore = create<TradingState>()(
  persist(
    (set) => ({
      positions: [],
      trades: [],
      balance: 0,
      
      setPositions: (positions) => set({ positions }),
      
      addPosition: (position) => set((state) => ({
        positions: [position, ...state.positions]
      })),
      
      updatePosition: (id, updates) => set((state) => ({
        positions: state.positions.map((p) => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      removePosition: (id) => set((state) => ({
        positions: state.positions.filter((p) => p.id !== id)
      })),
      
      setTrades: (trades) => set({ trades }),
      
      addTrade: (trade) => set((state) => ({
        trades: [trade, ...state.trades]
      })),
      
      setBalance: (balance) => set({ balance }),
      
      updateBalance: (amount) => set((state) => ({
        balance: state.balance + amount
      })),
    }),
    {
      name: 'trading-storage',
    }
  )
);

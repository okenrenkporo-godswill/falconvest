import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Position {
    id: string;
    symbol: string;
    side: "buy" | "sell";
    type: "market" | "limit";
    price: string;
    amount: string;
    total: string;
    time: string;
    pnl?: number;
}

interface TradingState {
    positions: Position[];
    addPosition: (position: Position) => void;
    closePosition: (id: string) => void;
    setPositions: (positions: Position[]) => void;
}

export const useTradingStore = create<TradingState>()(
    persist(
        (set) => ({
            positions: [],
            addPosition: (position) => set((state) => ({
                positions: [position, ...state.positions]
            })),
            closePosition: (id) => set((state) => ({
                positions: state.positions.filter((p) => p.id !== id)
            })),
            setPositions: (positions) => set({ positions }),
        }),
        {
            name: 'trading-storage', // unique name
        }
    )
);

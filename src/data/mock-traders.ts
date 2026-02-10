export interface Trader {
    id: string;
    name: string;
    avatar: string;
    roi: number; // Return on Investment (Percentage)
    pnl: number; // Profit and Loss (USD)
    winRate: number; // Percentage
    aum: number; // Assets Under Management (USD)
    copiers: number;
    maxDrawdown: number; // Percentage
    riskScore: number; // 1-10
    description: string;
    tags: string[];
    chartData: number[]; // Simple array for sparkline
}

export const MOCK_TRADERS: Trader[] = [
    {
        id: "trader-001",
        name: "CryptoKing_99",
        avatar: "CK",
        roi: 1245.50,
        pnl: 452000.00,
        winRate: 88.5,
        aum: 2500000,
        copiers: 1250,
        maxDrawdown: 12.5,
        riskScore: 6,
        description: "High-frequency Bitcoin scalper. strict risk management.",
        tags: ["BTC", "Scalping", "High Risk"],
        chartData: [10, 15, 12, 18, 25, 30, 45, 40, 55, 60, 80, 95]
    },
    {
        id: "trader-002",
        name: "SafeGrowth_LTD",
        avatar: "SG",
        roi: 85.20,
        pnl: 125000.00,
        winRate: 98.2,
        aum: 5400000,
        copiers: 3200,
        maxDrawdown: 3.2,
        riskScore: 2,
        description: "Long-term ETH and SOL accumulation strategy. Low leverage.",
        tags: ["ETH", "Swing", "Safe"],
        chartData: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21]
    },
    {
        id: "trader-003",
        name: "Altcoin_Hunter",
        avatar: "AH",
        roi: 340.10,
        pnl: 89000.50,
        winRate: 65.4,
        aum: 890000,
        copiers: 850,
        maxDrawdown: 25.0,
        riskScore: 8,
        description: "Hunting the next 100x gem. High volatility, high reward.",
        tags: ["Alts", "Degen", "Aggressive"],
        chartData: [10, 5, 20, 15, 40, 10, 60, 30, 80, 50, 100, 120]
    },
    {
        id: "trader-004",
        name: "Technical_Master",
        avatar: "TM",
        roi: 210.00,
        pnl: 320000.00,
        winRate: 72.0,
        aum: 1800000,
        copiers: 1500,
        maxDrawdown: 15.5,
        riskScore: 5,
        description: "Pure price action trading. No indicators, just market structure.",
        tags: ["Price Action", "Day Trading"],
        chartData: [20, 25, 22, 28, 35, 32, 40, 45, 42, 50, 55, 60]
    },
    {
        id: "trader-005",
        name: "Quantum_AI_Bot",
        avatar: "QB",
        roi: 55.50,
        pnl: 65000.00,
        winRate: 92.5,
        aum: 3200000,
        copiers: 2100,
        maxDrawdown: 5.0,
        riskScore: 3,
        description: "Algorithmic trading bot powered by machine learning.",
        tags: ["Bot", "Algo", "Automated"],
        chartData: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32]
    },
    {
        id: "trader-006",
        name: "Macro_Trends",
        avatar: "MT",
        roi: 150.25,
        pnl: 180000.00,
        winRate: 68.5,
        aum: 1200000,
        copiers: 900,
        maxDrawdown: 18.2,
        riskScore: 7,
        description: "Trading based on global macroeconomic trends and news.",
        tags: ["Macro", "News", "Fundamental"],
        chartData: [15, 10, 25, 20, 35, 30, 50, 45, 60, 55, 75, 80]
    }
];

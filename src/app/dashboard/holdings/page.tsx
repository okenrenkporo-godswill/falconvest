import { WalletPage } from "@/components/dashboard/wallet-page";

export default function HoldingsPage() {
  // In a real app, fetch balance from Supabase here
  return (
    <WalletPage
      title="Holdings Wallet"
      description="Manage your longterm crypto assets."
      balance={0.00}
      walletType="holdings"
    />
  );
}

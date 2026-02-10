import { WalletPage } from "@/components/dashboard/wallet-page";

export default function StakingPage() {
  // In a real app, fetch balance from Supabase here
  return (
    <WalletPage
      title="Staking Wallet"
      description="Earn rewards on your staked assets."
      balance={0.00}
      walletType="staking"
    />
  );
}

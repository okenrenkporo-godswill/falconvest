import Header from "@/components/Header";
import Hero from "@/components/Hero";
import AutoCopyTrading from "@/components/AutoCopyTrading";
import TradingToolsSlider from "@/components/TradingToolsSlider";
import AssetExplorer from "@/components/AssetExplorer";
import TradingPlans from "@/components/TradingPlans";
import SecurityCard from "@/components/SecurityCard";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />

      {/* ACT 1: THE CORE (THEME-RESPONSIVE DARK/LIGHT) */}
      <div className="bg-neutral-50 dark:bg-black transition-colors duration-500">
        <section className="relative z-20">
          <AssetExplorer />
        </section>
      </div>

      {/* ACT 2: SOCIAL & TOOLS (THEME-RESPONSIVE LIGHTER) */}
      <div className="bg-white dark:bg-neutral-950 transition-colors duration-500">
        <section className="space-y-0">
          <AutoCopyTrading />
        </section>
        <section className="relative z-10">
          <TradingToolsSlider />
        </section>
      </div>

      {/* ACT 3: INSTITUTIONAL (THEME-RESPONSIVE DARK/LIGHT) */}
      <div className="bg-neutral-50 dark:bg-black transition-colors duration-500">
        <section className="relative z-10">
          <TradingPlans />
        </section>
        <section className="relative z-10">
          <SecurityCard />
        </section>
        <section className="relative z-10">
          <FAQ />
        </section>
      </div>

      <Footer />
    </div>
  );
}

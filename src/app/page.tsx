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

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-5xl font-bold">
            Professional Crypto Trading Platform
          </h2>
          <p className="text-xl text-default-600">
            Trade spot & futures, stake your assets, and copy top traders all in one secure platform
          </p>

          <div className="flex gap-4 justify-center pt-8">
            <Button as={Link} href="/register" color="primary" size="lg">
              Get Started
            </Button>
            <Button as={Link} href="/login" variant="bordered" size="lg">
              Sign In
            </Button>
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

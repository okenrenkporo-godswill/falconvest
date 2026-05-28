import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UserFriendlyPlatform from "@/components/UserFriendlyPlatform";
import AboutUsCopy from "@/components/AboutUsCopy";
import StatsSection from "@/components/StatsSection";
import TrustedLicensing from "@/components/TrustedLicensing";
import FeatureHighlights from "@/components/FeatureHighlights";
import AssetExplorer from "@/components/AssetExplorer";
import StockDerivatives from "@/components/StockDerivatives";
import TradingToolsSlider from "@/components/TradingToolsSlider";
import TradingPlans from "@/components/TradingPlans";
import SecurityCard from "@/components/SecurityCard";
import EducationSection from "@/components/EducationSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Header />
      <Hero />

      <main>
        {/* Section 2: User-Friendly Trading Platform Options */}
        <UserFriendlyPlatform />

        {/* Section 3: About Us with Professional Copy Cards */}
        <AboutUsCopy />

        {/* Section 4: Live Global Stats Indicators */}
        <StatsSection />

        {/* Section 5: User Trust & Regulatory Licensing */}
        <TrustedLicensing />

        {/* Section 6: Feature Highlights 2x2 Grid */}
        <FeatureHighlights />

        {/* Interactive Live Price Terminal */}
        <section className="relative z-10 border-t border-black/5 dark:border-white/5">
          <AssetExplorer />
        </section>

        {/* Section 8: Large derivatives box */}
        <StockDerivatives />

        {/* Premium charting sliders and protection tools */}
        <section className="relative z-10">
          <TradingToolsSlider />
        </section>

        {/* ACT 3: INSTITUTIONAL */}
        <div className="bg-neutral-50 dark:bg-black transition-colors duration-500">
          <section className="relative z-10">
            <TradingPlans />
          </section>
          <section className="relative z-10">
            <SecurityCard />
          </section>
          <section className="relative z-10">
            <EducationSection />
          </section>
          <section className="relative z-10">
            <FAQ />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

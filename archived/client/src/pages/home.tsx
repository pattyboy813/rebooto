import { ModernNav } from "@/components/sections/modern-nav";
import { ModernHero } from "@/components/sections/modern-hero";
import { ModernFeatures } from "@/components/sections/modern-features";
import { ModernStats } from "@/components/sections/modern-stats";
import { ModernCTA } from "@/components/sections/modern-cta";
import { ModernFooter } from "@/components/sections/modern-footer";
import { StickyCountdown } from "@/components/sticky-countdown";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <StickyCountdown />
      <ModernNav />
      <div id="hero">
        <ModernHero />
      </div>
      <div id="features">
        <ModernFeatures />
      </div>
      <div id="stats">
        <ModernStats />
      </div>
      <div id="cta">
        <ModernCTA />
      </div>
      <ModernFooter />
    </div>
  );
}

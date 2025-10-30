import { ModernHero } from "@/components/sections/modern-hero";
import { ModernFeatures } from "@/components/sections/modern-features";
import { ModernStats } from "@/components/sections/modern-stats";
import { ModernCTA } from "@/components/sections/modern-cta";
import { ModernFooter } from "@/components/sections/modern-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <ModernHero />
      <ModernFeatures />
      <ModernStats />
      <ModernCTA />
      <ModernFooter />
    </div>
  );
}

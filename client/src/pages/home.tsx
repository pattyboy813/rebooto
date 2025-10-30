import { PremiumHero } from "@/components/sections/premium-hero";
import { PremiumValue } from "@/components/sections/premium-value";
import { PremiumHow } from "@/components/sections/premium-how";
import { PremiumSkills } from "@/components/sections/premium-skills";
import { PremiumAuth } from "@/components/sections/premium-auth";
import { PremiumFooter } from "@/components/sections/premium-footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <PremiumHero />
      <PremiumValue />
      <PremiumHow />
      <PremiumSkills />
      <PremiumAuth />
      <PremiumFooter />
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Hero } from "@/components/sections/hero";
import { ValueProposition } from "@/components/sections/value-proposition";
import { HowItWorks } from "@/components/sections/how-it-works";
import { WhatYoullLearn } from "@/components/sections/what-youll-learn";
import { EmailSignup } from "@/components/sections/email-signup";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Hero />
      <ValueProposition />
      <HowItWorks />
      <WhatYoullLearn />
      <EmailSignup />
      <Footer />
    </div>
  );
}

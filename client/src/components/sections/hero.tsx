import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap) return;

    const ctx = window.gsap.context(() => {
      window.gsap.from(".hero-headline", {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      window.gsap.from(".hero-subheading", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.2,
        ease: "power3.out",
      });

      window.gsap.from(".hero-countdown", {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.4,
        ease: "power3.out",
      });

      window.gsap.from(".hero-cta", {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        delay: 0.6,
        ease: "back.out(1.4)",
      });

      window.gsap.from(".scroll-indicator", {
        opacity: 0,
        y: -10,
        duration: 0.8,
        delay: 1,
        ease: "power3.out",
      });

      window.gsap.to(".scroll-indicator", {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSignup = () => {
    const signupSection = document.getElementById("signup");
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-card pointer-events-none" />
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 to-chart-2/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-chart-2/20 to-primary/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
        <div className="hero-headline">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Coming Soon</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            Learn IT Support
            <br />
            <span className="text-gradient-brand">Through Real Scenarios</span>
          </h1>
        </div>

        <p className="hero-subheading text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Master practical troubleshooting skills with interactive, hands-on challenges.
          Build confidence by solving real IT problems in a safe learning environment.
        </p>

        <div className="hero-countdown">
          <CountdownTimer />
        </div>

        <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            onClick={scrollToSignup}
            className="bg-gradient-brand text-white border border-primary-border px-8 py-6 text-lg font-semibold rounded-xl min-h-14 hover:scale-105 transition-transform"
            data-testid="button-get-early-access"
          >
            Get Early Access
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToSignup}
            className="px-8 py-6 text-lg font-semibold rounded-xl min-h-14"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>

        <div className="scroll-indicator absolute bottom-12 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

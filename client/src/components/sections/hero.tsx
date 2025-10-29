import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Sparkles } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap) return;

    const ctx = window.gsap.context(() => {
      const tl = window.gsap.timeline({ defaults: { ease: "power3.out" } });
      
      tl.from(".hero-badge", {
        opacity: 0,
        scale: 0.8,
        duration: 0.6,
      })
      .from(".hero-headline", {
        opacity: 0,
        y: 40,
        duration: 1,
      }, "-=0.3")
      .from(".hero-subheading", {
        opacity: 0,
        y: 30,
        duration: 0.8,
      }, "-=0.6")
      .from(".hero-countdown", {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.8,
      }, "-=0.4")
      .from(".hero-cta", {
        opacity: 0,
        y: 20,
        duration: 0.6,
      }, "-=0.3");

      window.gsap.to(".scroll-indicator", {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      const handleScroll = () => {
        const scrollY = window.scrollY;
        if (backgroundRef.current) {
          window.gsap.to(backgroundRef.current, {
            y: scrollY * 0.3,
            duration: 0.3,
            ease: "power1.out",
          });
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => window.removeEventListener("scroll", handleScroll);
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
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 md:px-6"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background via-card/30 to-background pointer-events-none" />
      
      <div ref={backgroundRef} className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-r from-primary/30 to-chart-2/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-r from-chart-2/30 to-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-[32rem] h-96 md:h-[32rem] bg-gradient-to-r from-primary/10 to-chart-2/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 md:space-y-8">
        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-chart-2/10 border border-primary/20 backdrop-blur-sm mb-4 md:mb-6">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Launching December 2025</span>
        </div>

        <div className="hero-headline space-y-4 md:space-y-6">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Learn IT Support
            <br />
            <span className="text-gradient-brand inline-block">Through Real Scenarios</span>
          </h1>
        </div>

        <p className="hero-subheading text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
          Master practical troubleshooting skills with interactive, hands-on challenges.
          Build confidence by solving real IT problems in a safe learning environment.
        </p>

        <div className="hero-countdown pt-4 md:pt-6">
          <CountdownTimer />
        </div>

        <div className="hero-cta flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-2 md:pt-4 px-4">
          <Button
            size="lg"
            onClick={scrollToSignup}
            className="w-full sm:w-auto bg-gradient-brand text-white border border-primary-border rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            data-testid="button-get-early-access"
          >
            Get Early Access
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToSignup}
            className="w-full sm:w-auto rounded-xl backdrop-blur-sm border-primary/20"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>

        <div className="scroll-indicator absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 opacity-60 hover:opacity-100 transition-opacity">
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Zap, TrendingUp, Monitor, ArrowRight } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Real-World Scenarios",
    description: "Practice with authentic IT problems you'll encounter in the field. No theory-only learning.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get immediate responses to your troubleshooting decisions. Learn from mistakes in real-time.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Watch your skills grow with XP, achievements, and detailed performance insights.",
  },
];

export function ValueProposition() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSignup = () => {
    const signupSection = document.getElementById("signup");
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    const ctx = window.gsap.context(() => {
      window.gsap.from(".section-header", {
        scrollTrigger: {
          trigger: ".section-header",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      const cards = document.querySelectorAll(".benefit-card");
      window.gsap.from(cards, {
        scrollTrigger: {
          trigger: cards[0],
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      window.gsap.from(".value-visual", {
        scrollTrigger: {
          trigger: ".value-visual",
          start: "top 80%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 px-4 md:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="section-header text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            Why Choose TryRebooto?
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Traditional IT training is boring. We made it interactive, practical, and fun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
          {benefits.map((benefit, index) => (
            <Card
              key={benefit.title}
              className="benefit-card group p-6 md:p-8 hover-elevate transition-all duration-500 relative overflow-hidden"
              data-testid={`card-benefit-${index}`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-brand opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{benefit.title}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="value-visual group p-6 md:p-10 lg:p-12 bg-gradient-to-br from-card/80 to-card/40 border-2 backdrop-blur-sm hover-elevate">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
                See It In Action
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
                Experience how interactive troubleshooting scenarios work. Make decisions, 
                see results, and learn from every choice in a risk-free environment.
              </p>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToSignup}
                className="w-full sm:w-auto rounded-xl group"
                data-testid="button-try-preview"
              >
                Join Early Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="order-1 md:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-video rounded-xl md:rounded-2xl bg-gradient-brand/10 border-2 border-primary/20 flex items-center justify-center backdrop-blur-sm group-hover:border-primary/40 transition-all duration-500">
                <Monitor className="w-16 h-16 md:w-24 md:h-24 text-primary/40 group-hover:text-primary/60 transition-colors duration-300" />
                <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary/5 to-chart-2/5" />
                <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Target, Zap, TrendingUp } from "lucide-react";

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
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="section-header text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Why Choose TryRebooto?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Traditional IT training is boring. We made it interactive, practical, and fun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={benefit.title}
              className="benefit-card p-8 hover-elevate transition-all duration-300"
              data-testid={`card-benefit-${index}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mb-6">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

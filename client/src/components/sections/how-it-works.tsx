import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Layers, Workflow, Award } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Layers,
    title: "Choose Your Challenge",
    description: "Select from real-world IT scenarios across hardware, networking, and software troubleshooting.",
  },
  {
    number: 2,
    icon: Workflow,
    title: "Solve Real Problems",
    description: "Make decisions, test solutions, and navigate through interactive decision trees just like in the field.",
  },
  {
    number: 3,
    icon: Award,
    title: "Track Your Progress",
    description: "Earn XP, unlock achievements, and see your skills grow with detailed performance analytics.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap || !window.ScrollTrigger) return;

    const ctx = window.gsap.context(() => {
      window.gsap.from(".how-header", {
        scrollTrigger: {
          trigger: ".how-header",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      });

      const stepCards = document.querySelectorAll(".step-card");
      window.gsap.from(stepCards, {
        scrollTrigger: {
          trigger: stepCards[0],
          start: "top 80%",
        },
        opacity: 0,
        x: -30,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 md:py-32 px-6 bg-card/30">
      <div className="max-w-6xl mx-auto">
        <div className="how-header text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Your journey to IT mastery in three simple steps
          </p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              className="step-card p-8 hover-elevate transition-all duration-300"
              data-testid={`card-step-${step.number}`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center">
                      <step.icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {step.number}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

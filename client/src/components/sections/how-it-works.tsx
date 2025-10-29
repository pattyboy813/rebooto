import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Layers, Workflow, Award, ChevronRight } from "lucide-react";

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
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      const stepCards = document.querySelectorAll(".step-card");
      stepCards.forEach((card, index) => {
        window.gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
          opacity: 0,
          x: index % 2 === 0 ? -40 : 40,
          duration: 0.8,
          ease: "power3.out",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 px-4 md:px-6 bg-gradient-to-b from-transparent via-card/10 to-transparent">
      <div className="max-w-7xl mx-auto">
        <div className="how-header text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            How It Works
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Your journey to IT mastery in three simple steps
          </p>
        </div>

        <div className="space-y-6 md:space-y-8">
          {steps.map((step, index) => (
            <Card
              key={step.number}
              className="step-card group p-6 md:p-8 lg:p-10 hover-elevate transition-all duration-500 relative overflow-hidden"
              data-testid={`card-step-${step.number}`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-brand opacity-0 group-hover:opacity-5 blur-3xl transition-opacity duration-500" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 relative z-10">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-xl md:rounded-2xl bg-gradient-brand flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                      <step.icon className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm md:text-base shadow-lg">
                      {step.number}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2 md:space-y-3">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold group-hover:text-primary transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <ChevronRight className="hidden md:block w-6 h-6 lg:w-8 lg:h-8 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-2 transition-all duration-300" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

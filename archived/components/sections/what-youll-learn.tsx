import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { HardDrive, Network, Monitor, Check } from "lucide-react";

const categories = [
  {
    icon: HardDrive,
    title: "Hardware Troubleshooting",
    topics: [
      "Component diagnostics",
      "Performance issues",
      "Boot problems",
      "Peripheral setup",
    ],
  },
  {
    icon: Network,
    title: "Network Diagnostics",
    topics: [
      "Connectivity issues",
      "IP configuration",
      "DNS troubleshooting",
      "WiFi optimization",
    ],
  },
  {
    icon: Monitor,
    title: "Software Issues",
    topics: [
      "Application crashes",
      "System errors",
      "Driver problems",
      "Update failures",
    ],
  },
];

export function WhatYoullLearn() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.gsap || !window.ScrollTrigger) return;

    const ctx = window.gsap.context(() => {
      window.gsap.from(".learn-header", {
        scrollTrigger: {
          trigger: ".learn-header",
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power3.out",
      });

      const categoryCards = document.querySelectorAll(".category-card");
      window.gsap.from(categoryCards, {
        scrollTrigger: {
          trigger: categoryCards[0],
          start: "top 80%",
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 px-4 md:px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-card/10 via-transparent to-card/10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="learn-header text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            What You'll Learn
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Build expertise across the core pillars of IT support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Card
              key={category.title}
              className="category-card group p-6 md:p-8 hover-elevate transition-all duration-500 border-2 relative overflow-hidden"
              data-testid={`card-category-${index}`}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-brand opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-brand flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary/20">
                  <category.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">{category.title}</h3>
                <ul className="space-y-3">
                  {category.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-primary/10 flex items-center justify-center group-hover/item:bg-primary/20 transition-colors duration-300">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm md:text-base text-muted-foreground group-hover/item:text-foreground transition-colors duration-300">
                        {topic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

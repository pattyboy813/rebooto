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
        y: 30,
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
        <div className="learn-header text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            What You'll Learn
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Build expertise across the core pillars of IT support
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card
              key={category.title}
              className="category-card p-8 hover-elevate transition-all duration-300 border-2"
              data-testid={`card-category-${index}`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center mb-6">
                <category.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-6">{category.title}</h3>
              <ul className="space-y-3">
                {category.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{topic}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

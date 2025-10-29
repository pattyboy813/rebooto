import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const launchDate = new Date("2025-12-31T23:59:59").getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = launchDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((difference % (1000 * 60)) / 1000),
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined" && window.gsap) {
      const boxes = document.querySelectorAll(".countdown-box");
      window.gsap.from(boxes, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.08,
        ease: "back.out(1.7)",
      });
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="countdown-box flex flex-col items-center justify-center p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-card-border backdrop-blur-md"
          >
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold mb-1 md:mb-2">--</div>
            <div className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">
              {["Days", "Hours", "Mins", "Secs"][i]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: "Days", shortLabel: "Days" },
    { value: timeLeft.hours, label: "Hours", shortLabel: "Hours" },
    { value: timeLeft.minutes, label: "Minutes", shortLabel: "Mins" },
    { value: timeLeft.seconds, label: "Seconds", shortLabel: "Secs" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto px-4" role="timer" aria-live="polite">
      {timeUnits.map((unit) => (
        <div
          key={unit.label}
          className="countdown-box group flex flex-col items-center justify-center p-4 md:p-6 rounded-xl md:rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-card-border backdrop-blur-md hover-elevate transition-all duration-300 hover:scale-105 hover:border-primary/30"
          data-testid={`countdown-${unit.label.toLowerCase()}`}
        >
          <div className="relative">
            <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-gradient-brand mb-1 md:mb-2 transition-all duration-300">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
          </div>
          <div className="text-xs md:text-sm uppercase tracking-wider text-muted-foreground">
            <span className="hidden md:inline">{unit.label}</span>
            <span className="md:hidden">{unit.shortLabel}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

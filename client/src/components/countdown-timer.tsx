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
        scale: 0.9,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.4)",
      });
    }
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="countdown-box flex flex-col items-center justify-center p-6 rounded-2xl bg-card/50 border border-card-border backdrop-blur-sm"
          >
            <div className="text-4xl md:text-6xl font-bold mb-2">--</div>
            <div className="text-sm uppercase tracking-widest text-muted-foreground">
              {["Days", "Hours", "Minutes", "Seconds"][i]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hours" },
    { value: timeLeft.minutes, label: "Minutes" },
    { value: timeLeft.seconds, label: "Seconds" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto" role="timer" aria-live="polite">
      {timeUnits.map((unit, index) => (
        <div
          key={unit.label}
          className="countdown-box flex flex-col items-center justify-center p-6 rounded-2xl bg-card/50 border border-card-border backdrop-blur-sm hover-elevate"
          data-testid={`countdown-${unit.label.toLowerCase()}`}
        >
          <div className="text-4xl md:text-6xl font-bold text-gradient-brand mb-2">
            {String(unit.value).padStart(2, "0")}
          </div>
          <div className="text-sm uppercase tracking-widest text-muted-foreground">
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
}

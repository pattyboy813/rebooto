import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function StickyCountdown() {
  const [mounted, setMounted] = useState(false);
  const { scrollY } = useScroll();
  
  // Show sticky countdown after scrolling 600px (past hero)
  const [isVisible, setIsVisible] = useState(false);
  
  // Beta launch date - matches main countdown
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
    const handleScroll = () => {
      // Show sticky countdown when scrolled past 600px
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const timeUnits = [
    { value: timeLeft.days, label: "D" },
    { value: timeLeft.hours, label: "H" },
    { value: timeLeft.minutes, label: "M" },
    { value: timeLeft.seconds, label: "S" },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 shadow-lg"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      data-testid="sticky-countdown"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6">
        <span className="text-sm font-semibold uppercase tracking-wider hidden sm:inline">
          Beta Launches In:
        </span>
        <div className="flex items-center gap-2 md:gap-3">
          {timeUnits.map((unit, index) => (
            <div
              key={unit.label}
              className="flex items-center gap-1"
            >
              <div className="flex flex-col items-center min-w-[40px] md:min-w-[50px]">
                <motion.span
                  key={unit.value}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-xl md:text-2xl font-bold"
                  data-testid={`sticky-countdown-value-${unit.label.toLowerCase()}`}
                >
                  {String(unit.value).padStart(2, "0")}
                </motion.span>
                <span className="text-xs uppercase opacity-90">
                  {unit.label}
                </span>
              </div>
              {index < timeUnits.length - 1 && (
                <span className="text-lg md:text-xl font-bold opacity-50">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

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
      // Show sticky countdown when scrolled past 350px (sooner)
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  const timeUnits = [
    { value: timeLeft.days },
    { value: timeLeft.hours },
    { value: timeLeft.minutes },
    { value: timeLeft.seconds },
  ];

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ 
        y: isVisible ? 0 : -100, 
        opacity: isVisible ? 1 : 0 
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-[72px] left-0 right-0 z-30 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-2 shadow-lg"
      style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
      data-testid="sticky-countdown"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-6">
        <span className="text-sm font-semibold uppercase tracking-wider hidden sm:inline">
          Beta Launches In:
        </span>
        <div className="flex items-center gap-2">
          {timeUnits.map((unit, index) => (
            <div key={index} className="flex items-center">
              <motion.span
                key={unit.value}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-2xl font-bold tabular-nums"
                data-testid={`sticky-countdown-${index}`}
              >
                {String(unit.value).padStart(2, "0")}
              </motion.span>
              {index < timeUnits.length - 1 && (
                <span className="text-xl font-bold mx-2">:</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

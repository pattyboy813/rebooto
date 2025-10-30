import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlipCardProps {
  value: number;
  label: string;
  testId: string;
}

function FlipCard({ value, label, testId }: FlipCardProps) {
  const [currentValue, setCurrentValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setIsFlipping(true);
      const timer = setTimeout(() => {
        setCurrentValue(value);
        setIsFlipping(false);
        prevValueRef.current = value;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  const displayValue = String(currentValue).padStart(2, "0");

  return (
    <div className="flex flex-col items-center gap-3 md:gap-4" data-testid={testId}>
      {/* Single Unified Flip Display */}
      <div className="relative w-20 h-24 sm:w-24 sm:h-32 md:w-32 md:h-40 lg:w-40 lg:h-48">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gray-800 to-gray-900 shadow-2xl border-3 border-gray-700/60" />
        
        {/* Display Area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={displayValue}
              initial={isFlipping ? { rotateX: -90, opacity: 0 } : false}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: 90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white font-mono"
              style={{ 
                transformStyle: "preserve-3d"
              }}
            >
              {displayValue}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Middle Line for vintage look */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-950/50 z-10" />
        
        {/* Screws/Rivets for vintage look */}
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
      </div>

      {/* Label */}
      <div className="text-xs md:text-sm lg:text-base uppercase tracking-wider font-semibold text-gray-700">
        {label}
      </div>
    </div>
  );
}

export function FlipTimer() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);

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

    // Set initial time immediately
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex justify-center items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 px-4">
        {["Days", "Hours", "Mins", "Secs"].map((label) => (
          <div key={label} className="flex flex-col items-center gap-3 md:gap-4">
            <div className="w-20 h-24 sm:w-24 sm:h-32 md:w-32 md:h-40 lg:w-40 lg:h-48 rounded-xl bg-gray-800 animate-pulse" />
            <div className="text-xs md:text-sm lg:text-base uppercase tracking-wider text-gray-400">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const timeUnits = [
    { value: timeLeft.days, label: "Days", testId: "countdown-days" },
    { value: timeLeft.hours, label: "Hours", testId: "countdown-hours" },
    { value: timeLeft.minutes, label: "Mins", testId: "countdown-minutes" },
    { value: timeLeft.seconds, label: "Secs", testId: "countdown-seconds" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
      role="timer"
      aria-live="polite"
    >
      {/* Vintage Panel Background */}
      <div className="absolute -inset-4 md:-inset-6 rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-2xl border-4 border-gray-300/50" />
      <div className="absolute -inset-3 md:-inset-5 rounded-2xl md:rounded-3xl bg-gradient-to-br from-gray-200/80 to-gray-300/80" />
      
      {/* Main Timer Display */}
      <div className="relative flex justify-center items-center gap-3 sm:gap-6 md:gap-8 lg:gap-10 px-4 py-8 md:py-10">
        {timeUnits.map((unit) => (
          <FlipCard
            key={unit.label}
            value={unit.value}
            label={unit.label}
            testId={unit.testId}
          />
        ))}
      </div>

      {/* Vintage Brand Label */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
        <div className="px-4 py-1 rounded-full bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 text-white text-xs font-bold tracking-wider shadow-lg">
          LAUNCH COUNTDOWN
        </div>
      </div>
    </motion.div>
  );
}

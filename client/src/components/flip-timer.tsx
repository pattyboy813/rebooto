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
  const topDigit = displayValue[0];
  const bottomDigit = displayValue[1];

  return (
    <div className="flex flex-col items-center gap-2 md:gap-3" data-testid={testId}>
      {/* Flip Display Container */}
      <div className="relative flex gap-1 sm:gap-2">
        {/* First Digit */}
        <div className="relative w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 lg:w-24 lg:h-32">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl border-2 border-gray-700/50" />
          
          {/* Top Half */}
          <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-end justify-center pb-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`top-${topDigit}-${isFlipping}`}
                  initial={isFlipping ? { rotateX: 0 } : false}
                  animate={isFlipping ? { rotateX: -90 } : { rotateX: 0 }}
                  exit={{ rotateX: -90 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono origin-bottom"
                  style={{ 
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden"
                  }}
                >
                  {topDigit}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Middle Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-950 z-10 shadow-md" />
          <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 -translate-y-px z-10" />

          {/* Bottom Half */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-start justify-center pt-1">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`bottom-${topDigit}-${isFlipping}`}
                  initial={isFlipping ? { rotateX: 90 } : false}
                  animate={{ rotateX: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut", delay: isFlipping ? 0.15 : 0 }}
                  className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono origin-top"
                  style={{ 
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden"
                  }}
                >
                  {topDigit}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>

          {/* Screws/Rivets for vintage look */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
        </div>

        {/* Second Digit */}
        <div className="relative w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 lg:w-24 lg:h-32">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-gray-800 to-gray-900 shadow-xl border-2 border-gray-700/50" />
          
          <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-end justify-center pb-1">
              <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono">
                {bottomDigit}
              </span>
            </div>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-950 z-10 shadow-md" />
          <div className="absolute top-1/2 left-2 right-2 h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 -translate-y-px z-10" />

          <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-lg">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 flex items-start justify-center pt-1">
              <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white font-mono">
                {bottomDigit}
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          </div>

          <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
          <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
          <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-gray-600 shadow-inner" />
        </div>
      </div>

      {/* Label */}
      <div className="text-xs md:text-sm uppercase tracking-wider font-semibold text-gray-700">
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
      <div className="flex justify-center items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 px-1 sm:px-4">
        {["Days", "Hours", "Mins", "Secs"].map((label) => (
          <div key={label} className="flex flex-col items-center gap-2 md:gap-3">
            <div className="flex gap-1 sm:gap-2">
              <div className="w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg bg-gray-800 animate-pulse" />
              <div className="w-10 h-14 sm:w-14 sm:h-20 md:w-20 md:h-28 lg:w-24 lg:h-32 rounded-lg bg-gray-800 animate-pulse" />
            </div>
            <div className="text-xs md:text-sm uppercase tracking-wider text-gray-400">
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
      <div className="relative flex justify-center items-center gap-2 sm:gap-4 md:gap-6 lg:gap-8 px-1 sm:px-4 py-6 md:py-8">
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

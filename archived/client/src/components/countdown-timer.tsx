import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  // Beta launch date - adjust this as needed
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

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-3xl mx-auto">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-teal-200/50 shadow-lg"
          >
            <div className="text-3xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">--</div>
            <div className="text-xs md:text-sm uppercase tracking-wider text-gray-600">
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
    <div className="w-full max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-6"
      >
        <p className="text-sm md:text-base font-semibold text-teal-600 uppercase tracking-wider" data-testid="countdown-label">
          Beta Launches In
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4" role="timer" aria-live="polite">
        {timeUnits.map((unit, index) => (
          <motion.div
            key={unit.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className="group flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-teal-200/50 shadow-lg hover:shadow-xl transition-all"
            data-testid={`countdown-${unit.label.toLowerCase()}`}
          >
            <motion.div
              key={unit.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent mb-2"
              data-testid={`countdown-value-${unit.label.toLowerCase()}`}
            >
              {String(unit.value).padStart(2, "0")}
            </motion.div>
            <div className="text-xs md:text-sm uppercase tracking-wide text-gray-600 font-medium">
              <span className="hidden md:inline">{unit.label}</span>
              <span className="md:hidden">{unit.shortLabel}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

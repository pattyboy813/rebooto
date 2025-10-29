import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown } from "lucide-react";
import { CountdownTimer } from "@/components/countdown-timer";
import { motion } from "framer-motion";

export function PremiumHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const orb1Ref = useRef<HTMLDivElement>(null);
  const orb2Ref = useRef<HTMLDivElement>(null);
  const orb3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      const offsetX = (clientX - centerX) / 50;
      const offsetY = (clientY - centerY) / 50;

      if (orb1Ref.current) {
        orb1Ref.current.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      }
      if (orb2Ref.current) {
        orb2Ref.current.style.transform = `translate(${-offsetX * 0.7}px, ${-offsetY * 0.7}px)`;
      }
      if (orb3Ref.current) {
        orb3Ref.current.style.transform = `translate(${offsetX * 0.5}px, ${-offsetY * 0.5}px)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollToSignup = () => {
    const signupSection = document.getElementById("signup");
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 md:px-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30"
    >
      {/* Animated 3D Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          ref={orb1Ref}
          className="absolute top-1/4 left-1/4 w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl transition-transform duration-700 ease-out"
        />
        <div
          ref={orb2Ref}
          className="absolute bottom-1/4 right-1/4 w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl transition-transform duration-700 ease-out"
        />
        <div
          ref={orb3Ref}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 md:w-[32rem] md:h-[32rem] rounded-full bg-gradient-to-br from-blue-300/10 to-purple-300/10 blur-3xl transition-transform duration-700 ease-out"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-6 md:space-y-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-gray-200/50 shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Launching December 2025</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="space-y-4 md:space-y-6"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 leading-tight">
            Learn IT Support
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Through Real Scenarios
            </span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="text-lg sm:text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4"
        >
          Master practical troubleshooting skills with interactive, hands-on challenges.
          Build confidence by solving real IT problems in a safe learning environment.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="pt-4 md:pt-6"
        >
          <CountdownTimer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-2 md:pt-4 px-4"
        >
          <Button
            size="lg"
            onClick={scrollToSignup}
            className="w-full sm:w-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 px-8"
            data-testid="button-get-early-access"
          >
            Get Early Access
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToSignup}
            className="w-full sm:w-auto rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white/50 backdrop-blur-sm hover:bg-white transition-all duration-300 px-8"
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
          className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
            onClick={scrollToSignup}
          >
            <span className="text-sm text-gray-500">Scroll to explore</span>
            <ChevronDown className="w-6 h-6 text-gray-500" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

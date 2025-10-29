import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Target, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    icon: Target,
    title: "Real-World Scenarios",
    description: "Practice with authentic IT challenges that you'll actually face in the field. No theoretical fluff.",
  },
  {
    icon: Zap,
    title: "Interactive Learning",
    description: "Make decisions, see results, and learn from every choice in hands-on troubleshooting scenarios.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Earn XP, unlock achievements, and watch your skills grow with detailed performance analytics.",
  },
];

export function PremiumValue() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const scrollToSignup = () => {
    const signupSection = document.getElementById("signup");
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden"
    >
      {/* Subtle background decoration */}
      <div className="absolute top-1/2 right-0 w-96 h-96 bg-gradient-to-l from-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Why Choose TryRebooto?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Traditional IT training is boring. We made it interactive, practical, and fun.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
              data-testid={`card-benefit-${index}`}
            >
              <div className="relative backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl p-8 md:p-10 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="backdrop-blur-lg bg-gradient-to-br from-white/80 to-white/60 border border-gray-200/50 rounded-3xl p-8 md:p-12 lg:p-16 shadow-xl shadow-gray-200/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                See It In Action
              </h3>
              <p className="text-gray-600 text-lg md:text-xl leading-relaxed mb-8">
                Experience how interactive troubleshooting scenarios work. Make decisions, 
                see results, and learn from every choice in a risk-free environment.
              </p>
              <Button
                size="lg"
                onClick={scrollToSignup}
                className="group rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/30 px-8"
                data-testid="button-try-preview"
              >
                Join Early Access
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
            <div className="order-1 md:order-2 flex items-center justify-center">
              <div className="relative w-full max-w-md">
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-gray-200/50 flex items-center justify-center backdrop-blur-sm shadow-xl">
                  <div className="text-center p-8">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500">Interactive Demo</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stats = [
  { value: "1,200+", label: "Learners Waiting" },
  { value: "500+", label: "Practice Scenarios" },
  { value: "95%", label: "Completion Rate" },
  { value: "24/7", label: "Access Anytime" },
];

export function ModernStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-gradient-to-r from-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: [0.21, 1.11, 0.81, 0.99]
              }}
              className="text-center"
              data-testid={`card-stat-${index}`}
            >
              <motion.div 
                className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent mb-2" 
                data-testid={`text-stat-value-${index}`}
                initial={{ scale: 0.8 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                {stat.value}
              </motion.div>
              <div className="text-sm md:text-base text-gray-600 font-medium" data-testid={`text-stat-label-${index}`}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

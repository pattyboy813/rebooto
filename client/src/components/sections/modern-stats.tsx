import { motion } from "framer-motion";

const stats = [
  { value: "1,200+", label: "Learners Waiting" },
  { value: "500+", label: "Practice Scenarios" },
  { value: "95%", label: "Completion Rate" },
  { value: "24/7", label: "Access Anytime" },
];

export function ModernStats() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-teal-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
              data-testid={`card-stat-${index}`}
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent mb-2" data-testid={`text-stat-value-${index}`}>
                {stat.value}
              </div>
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

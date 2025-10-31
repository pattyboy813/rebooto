import { HardDrive, Network, Monitor, Check } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    icon: HardDrive,
    title: "Hardware Troubleshooting",
    topics: [
      "Component diagnostics",
      "Performance issues",
      "Boot problems",
      "Peripheral setup",
    ],
  },
  {
    icon: Network,
    title: "Network Diagnostics",
    topics: [
      "Connectivity issues",
      "IP configuration",
      "DNS troubleshooting",
      "WiFi optimization",
    ],
  },
  {
    icon: Monitor,
    title: "Software Issues",
    topics: [
      "Application crashes",
      "System errors",
      "Driver problems",
      "Update failures",
    ],
  },
];

export function PremiumSkills() {
  return (
    <section id="skills" className="py-20 md:py-32 px-4 md:px-6 bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            What You'll Learn
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Build expertise across the core pillars of IT support
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {categories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
              data-testid={`card-category-${index}`}
            >
              <div className="backdrop-blur-lg bg-white/60 border-2 border-gray-200/50 rounded-3xl p-8 md:p-10 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50 hover:border-blue-300/50 transition-all duration-300 h-full">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                  <category.icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6">{category.title}</h3>
                <ul className="space-y-3">
                  {category.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3 group/item">
                      <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-blue-100 flex items-center justify-center group-hover/item:bg-blue-200 transition-colors duration-300">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-base text-gray-600 group-hover/item:text-gray-900 transition-colors duration-300">
                        {topic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

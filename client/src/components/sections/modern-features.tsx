import { motion } from "framer-motion";
import { Zap, Trophy, Brain, TrendingUp } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Real-World Scenarios",
    description: "Practice with AI-generated IT support scenarios based on actual helpdesk situations. Build muscle memory for real problems.",
  },
  {
    icon: Trophy,
    title: "Gamified Learning",
    description: "Earn XP, level up, and unlock achievements as you master new skills. Stay motivated with progress tracking.",
  },
  {
    icon: Brain,
    title: "AI-Powered Guidance",
    description: "Get instant feedback and personalized learning paths powered by GPT-4o. Learn smarter, not harder.",
  },
  {
    icon: TrendingUp,
    title: "Job-Ready Skills",
    description: "Build a portfolio of completed scenarios. Show employers you can solve real IT problems, not just pass tests.",
  },
];

export function ModernFeatures() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 mb-4" data-testid="heading-features">
            Learn by Doing
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto" data-testid="text-features-description">
            Traditional IT courses teach theory. Rebooto puts you in the driver's seat.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
              data-testid={`card-feature-${index}`}
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" data-testid={`icon-feature-${index}`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3" data-testid={`heading-feature-${index}`}>
                  {feature.title}
                </h3>
                <p className="text-base text-gray-600 leading-relaxed" data-testid={`text-feature-${index}`}>
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

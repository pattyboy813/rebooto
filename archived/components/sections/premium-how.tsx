import { Layers, Workflow, Award, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    icon: Layers,
    title: "Choose Your Challenge",
    description: "Select from real-world IT scenarios across hardware, networking, and software troubleshooting.",
  },
  {
    number: 2,
    icon: Workflow,
    title: "Solve Real Problems",
    description: "Make decisions, test solutions, and navigate through interactive decision trees just like in the field.",
  },
  {
    number: 3,
    icon: Award,
    title: "Track Your Progress",
    description: "Earn XP, unlock achievements, and see your skills grow with detailed performance analytics.",
  },
];

export function PremiumHow() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-6 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-r from-purple-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Your journey to IT mastery in three simple steps
          </p>
        </motion.div>

        <div className="space-y-8 md:space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="group"
              data-testid={`card-step-${step.number}`}
            >
              <div className="backdrop-blur-lg bg-white/60 border border-gray-200/50 rounded-3xl p-8 md:p-10 lg:p-12 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-300/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-blue-500/30">
                        <step.icon className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white" />
                      </div>
                      <div className="absolute -top-3 -right-3 w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white flex items-center justify-center font-bold text-lg md:text-xl shadow-lg">
                        {step.number}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2 md:space-y-3">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {step.title}
                    </h3>
                    <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  <ChevronRight className="hidden lg:block w-8 h-8 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300 flex-shrink-0" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ModernPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function ModernPageHeader({ title, description, icon: Icon, action }: ModernPageHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          {Icon && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-xl opacity-50" />
              <div className="relative bg-gradient-to-r from-teal-500 to-emerald-500 p-4 rounded-full">
                <Icon className="h-8 w-8 text-white" strokeWidth={1.5} />
              </div>
            </motion.div>
          )}
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {title}
            </h1>
            {description && (
              <p className="text-lg text-gray-600 mt-2">{description}</p>
            )}
          </div>
        </div>
        {action && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

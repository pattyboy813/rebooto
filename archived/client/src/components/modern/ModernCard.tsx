import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function ModernCard({ children, className, delay = 0 }: ModernCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className={cn("backdrop-blur-sm bg-white/80 border-gray-200/50 shadow-lg hover-elevate", className)}>
        {children}
      </Card>
    </motion.div>
  );
}

import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, ArrowLeft, Search, Compass } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Orbs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* 404 Icon with Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-2xl opacity-50"
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative bg-gradient-to-r from-teal-500 to-emerald-500 p-8 rounded-full">
              <AlertTriangle className="h-24 w-24 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent tracking-tight">
            404
          </h1>
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          data-testid="heading-not-found"
        >
          Page Not Found
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg text-gray-600 mb-8 max-w-md mx-auto"
        >
          Oops! Looks like you've ventured into uncharted territory. The page you're looking for doesn't exist or has been moved.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-8 gap-2 shadow-lg"
              data-testid="button-home"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Button>
          </Link>

          <Button
            size="lg"
            variant="outline"
            onClick={() => window.history.back()}
            className="px-8 gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-gray-200"
        >
          <p className="text-sm text-gray-500 mb-4">Or explore these popular pages:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="link-dashboard">
                <Compass className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Link href="/app/courses">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="link-courses">
                <Search className="h-4 w-4" />
                Courses
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="link-blog">
                <Search className="h-4 w-4" />
                Blog
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

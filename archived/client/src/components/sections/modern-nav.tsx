import { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Menu, X, Sparkles } from "lucide-react";

export function ModernNav() {
  const [, setLocation] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  
  const navBackdrop = useTransform(
    scrollY,
    [0, 50],
    ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-all"
        style={{
          backgroundColor: navBackdrop,
          borderBottom: `1px solid ${isScrolled ? 'rgba(0,0,0,0.1)' : 'transparent'}`,
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-logo"
            >
              <Sparkles className="w-6 h-6 text-teal-500" data-testid="icon-logo" />
              <span className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">
                Rebooto
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <motion.button
                onClick={() => scrollToSection("features")}
                className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                whileHover={{ y: -2 }}
                data-testid="link-features-nav"
              >
                Features
              </motion.button>
              <motion.button
                onClick={() => scrollToSection("stats")}
                className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                whileHover={{ y: -2 }}
                data-testid="link-stats-nav"
              >
                Why Rebooto
              </motion.button>
              <motion.button
                onClick={() => scrollToSection("cta")}
                className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                whileHover={{ y: -2 }}
                data-testid="link-cta-nav"
              >
                Get Started
              </motion.button>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/auth")}
                className="text-gray-700 hover:text-teal-600"
                data-testid="button-login-nav"
              >
                Login
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => setLocation("/auth")}
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-full px-6"
                  data-testid="button-signup-nav"
                >
                  Sign Up Free
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <motion.div
        className="fixed inset-0 z-40 md:hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          y: isMobileMenuOpen ? 0 : -20,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-white/95 backdrop-blur-lg pt-24 px-6">
          <div className="flex flex-col gap-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-2xl font-semibold text-gray-700 hover:text-teal-600 transition-colors text-left"
              data-testid="link-features-mobile"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("stats")}
              className="text-2xl font-semibold text-gray-700 hover:text-teal-600 transition-colors text-left"
              data-testid="link-stats-mobile"
            >
              Why Rebooto
            </button>
            <button
              onClick={() => scrollToSection("cta")}
              className="text-2xl font-semibold text-gray-700 hover:text-teal-600 transition-colors text-left"
              data-testid="link-cta-mobile"
            >
              Get Started
            </button>
            
            <div className="border-t border-gray-200 pt-6 mt-4">
              <div className="flex flex-col gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setLocation("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center text-lg py-6"
                  data-testid="button-login-mobile"
                >
                  Login
                </Button>
                <Button
                  onClick={() => {
                    setLocation("/auth");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-center bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-lg py-6"
                  data-testid="button-signup-mobile"
                >
                  Sign Up Free
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}

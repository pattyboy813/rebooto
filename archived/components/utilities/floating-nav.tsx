import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Skills", href: "#skills" },
];

export function FloatingNav() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const scrollToSignup = () => {
    const signupSection = document.getElementById("signup");
    if (signupSection) {
      signupSection.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed top-4 md:top-6 left-0 right-0 z-50 px-4 sm:px-8 md:px-12"
      >
        <div className="max-w-6xl mx-auto backdrop-blur-xl bg-white/80 border-2 border-white/50 rounded-full px-4 sm:px-6 md:px-8 py-3 md:py-4 shadow-xl shadow-gray-300/20">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 sm:gap-3 group transition-all hover:scale-105"
              data-testid="button-scroll-top"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-shadow">
                <span className="text-white font-bold text-sm sm:text-base">R</span>
              </div>
              <span className="font-bold text-lg sm:text-xl hidden sm:inline bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Rebooto
              </span>
            </button>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors relative group"
                  data-testid={`nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </button>
              ))}
            </div>

            {/* CTA Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                size="sm"
                onClick={scrollToSignup}
                className="hidden sm:inline-flex rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 px-6 font-semibold"
                data-testid="nav-button-get-access"
              >
                Get Early Access
              </Button>

              {/* Mobile Menu Button */}
              <Button
                size="icon"
                variant="ghost"
                className="lg:hidden rounded-full hover:bg-gray-100/80"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-20 sm:top-24 left-3 right-3 sm:left-4 sm:right-4 z-40 lg:hidden"
          >
            <div className="backdrop-blur-xl bg-white/95 border-2 border-white/50 rounded-3xl p-6 shadow-2xl shadow-gray-300/30">
              <div className="flex flex-col gap-1">
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(link.href)}
                    className="text-left text-base font-semibold text-gray-700 hover:text-gray-900 py-3 px-4 rounded-2xl hover:bg-gray-100/60 transition-all"
                    data-testid={`mobile-nav-link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {link.label}
                  </motion.button>
                ))}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="pt-2"
                >
                  <Button
                    onClick={scrollToSignup}
                    className="w-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-blue-500/30 font-semibold"
                    data-testid="mobile-button-get-access"
                  >
                    Get Early Access
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

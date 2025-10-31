import { Button } from "@/components/ui/button";
import { SiX, SiLinkedin, SiGithub } from "react-icons/si";

const socialLinks = [
  { label: "Twitter", href: "https://twitter.com", icon: SiX },
  { label: "LinkedIn", href: "https://linkedin.com", icon: SiLinkedin },
  { label: "GitHub", href: "https://github.com", icon: SiGithub },
];

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy", href: "#" },
];

export function PremiumFooter() {
  return (
    <footer className="py-16 md:py-20 px-4 md:px-6 border-t border-gray-200/50 bg-gradient-to-b from-white to-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 mb-12 md:mb-16">
          <div className="space-y-4 md:space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="text-2xl md:text-3xl font-bold text-gray-900">Rebooto</span>
            </div>
            <p className="text-base md:text-lg text-gray-600 max-w-md leading-relaxed">
              Master IT support through interactive scenarios. Build real-world troubleshooting skills in a safe learning environment.
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-6 md:gap-8">
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  size="icon"
                  variant="ghost"
                  asChild
                  className="rounded-xl hover:bg-gray-100 transition-all hover:scale-110"
                  data-testid={`link-${social.label.toLowerCase()}`}
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-600" />
                  </a>
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-6 md:gap-8">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm md:text-base text-gray-600 hover:text-gray-900 transition-colors font-medium"
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-200/50 text-center">
          <p className="text-sm md:text-base text-gray-500">
            &copy; {new Date().getFullYear()} Rebooto. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

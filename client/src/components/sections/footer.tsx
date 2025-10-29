import { SiX, SiLinkedin, SiGithub } from "react-icons/si";
import { Button } from "@/components/ui/button";

const socialLinks = [
  { icon: SiX, href: "https://twitter.com", label: "Twitter" },
  { icon: SiLinkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: SiGithub, href: "https://github.com", label: "GitHub" },
];

const footerLinks = [
  { label: "About", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Privacy", href: "#" },
];

export function Footer() {
  return (
    <footer className="py-12 md:py-16 px-4 md:px-6 border-t border-border/50 bg-gradient-to-b from-transparent to-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-brand bg-clip-text text-transparent">
              TryRebooto
            </h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-md">
              Master IT support through interactive scenarios. Build real-world troubleshooting skills in a safe learning environment.
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-6 md:gap-8">
            <div className="flex gap-2 md:gap-3">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  size="icon"
                  variant="ghost"
                  asChild
                  className="hover-elevate rounded-xl"
                  data-testid={`link-${social.label.toLowerCase()}`}
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="transition-transform hover:scale-110"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 md:gap-6">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-6 md:pt-8 border-t border-border/50 text-center text-xs md:text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TryRebooto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

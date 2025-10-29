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
    <footer className="py-12 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-2">TryRebooto</h3>
            <p className="text-muted-foreground">
              Master IT support through interactive scenarios
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-6">
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <Button
                  key={social.label}
                  size="icon"
                  variant="ghost"
                  asChild
                  className="hover-elevate"
                  data-testid={`link-${social.label.toLowerCase()}`}
                >
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                </Button>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-6">
              {footerLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-testid={`link-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TryRebooto. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

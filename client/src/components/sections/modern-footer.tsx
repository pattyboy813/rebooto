import { Github, Twitter, Linkedin } from "lucide-react";

export function ModernFooter() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent" data-testid="heading-footer-brand">
              Rebooto
            </h3>
            <p className="text-sm text-gray-600" data-testid="text-footer-tagline">
              Gamified IT support learning platform. Master real-world skills through AI-powered scenarios.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider" data-testid="heading-footer-product">
              Product
            </h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-features">Features</a></li>
              <li><a href="#pricing" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-pricing">Pricing</a></li>
              <li><a href="#faq" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-faq">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider" data-testid="heading-footer-resources">
              Resources
            </h4>
            <ul className="space-y-2">
              <li><a href="#docs" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-docs">Documentation</a></li>
              <li><a href="#blog" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-blog">Blog</a></li>
              <li><a href="#support" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-support">Support</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider" data-testid="heading-footer-connect">
              Connect
            </h4>
            <div className="flex gap-4">
              <a href="#twitter" className="text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-twitter">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#github" className="text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-github">
                <Github className="w-5 h-5" />
              </a>
              <a href="#linkedin" className="text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-linkedin">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600" data-testid="text-copyright">
            © 2025 Rebooto. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#privacy" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-privacy">Privacy Policy</a>
            <a href="#terms" className="text-sm text-gray-600 hover:text-teal-600 transition-colors" data-testid="link-terms">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

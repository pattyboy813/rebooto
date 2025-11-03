import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Beta Access",
    price: "Free",
    period: "",
    description: "Full access during beta period",
    features: [
      "Unlimited course access",
      "All difficulty levels (Beginner to Advanced)",
      "Interactive hands-on scenarios",
      "XP, levels, and achievements",
      "Progress tracking",
      "Email support",
      "Regular content updates",
      "Community access",
    ],
    cta: "Start Learning Free",
    highlighted: true,
  },
  {
    name: "Future Pro",
    price: "TBD",
    period: "",
    description: "Coming after beta - more features",
    features: [
      "Everything in Beta Access",
      "Priority support",
      "Advanced analytics",
      "Custom learning paths",
      "Certification prep courses",
      "Team collaboration (coming soon)",
      "API access (coming soon)",
      "Early access to new features",
    ],
    cta: "Coming Soon",
    highlighted: false,
  },
];

export default function Pricing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30">
      {/* Header */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => setLocation("/")}
                data-testid="button-back-home"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/auth")}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button
                className="bg-gradient-admin text-white"
                onClick={() => setLocation("/auth")}
                data-testid="button-signup"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-6 bg-gradient-admin text-white border-0 text-lg px-6 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            Beta Launch Special
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-admin mb-6" data-testid="heading-pricing">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Rebooto is completely free during our beta period. Learn all you want, no credit card required.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan, idx) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                className={`p-8 h-full ${
                  plan.highlighted
                    ? "border-2 border-teal-500 shadow-lg shadow-teal-500/20"
                    : "border-border"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="mb-4 bg-gradient-admin text-white border-0">
                    Recommended
                  </Badge>
                )}
                <h3 className="text-3xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gradient-admin">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-2">{plan.period}</span>}
                </div>
                <p className="text-muted-foreground mb-8">{plan.description}</p>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-admin/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-teal-600" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full rounded-full ${
                    plan.highlighted
                      ? "bg-gradient-admin text-white"
                      : ""
                  }`}
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => plan.highlighted && setLocation("/auth")}
                  disabled={!plan.highlighted}
                  data-testid={`button-${plan.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {plan.cta}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient-admin">Pricing Questions</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">How long is the beta free?</h3>
              <p className="text-muted-foreground text-sm">
                Rebooto will remain free through the beta period, which runs until December 31, 2025. 
                We'll announce pricing changes at least 60 days in advance.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">Will I lose access after beta?</h3>
              <p className="text-muted-foreground text-sm">
                No! Beta users will get special early-adopter pricing and features when we launch our paid plans. 
                We're building this for you.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">Do I need a credit card?</h3>
              <p className="text-muted-foreground text-sm">
                Nope! Just sign up with your email and start learning immediately. No payment information required during beta.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-lg mb-3">What happens to my progress?</h3>
              <p className="text-muted-foreground text-sm">
                Your XP, levels, completed courses, and achievements are saved permanently. 
                You'll never lose your progress, even if you pause your account.
              </p>
            </Card>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Card className="p-12 bg-gradient-admin text-white">
            <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of IT professionals building practical support skills with Rebooto.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/auth")}
              className="rounded-full"
              data-testid="button-start-learning"
            >
              Sign Up Free - No Credit Card Required
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

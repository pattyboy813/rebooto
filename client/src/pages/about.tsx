import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Users, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const team = [
  {
    name: "Sarah Chen",
    role: "Founder & CEO",
    bio: "Former IT Director with 15+ years in enterprise support. Built Rebooto to make IT training practical and accessible.",
  },
  {
    name: "Marcus Johnson",
    role: "Head of Curriculum",
    bio: "Senior IT trainer and CompTIA certified instructor. Creates real-world scenarios based on 10,000+ support tickets.",
  },
  {
    name: "Dr. Emily Rodriguez",
    role: "AI & Learning Science",
    bio: "PhD in Educational Technology. Ensures our AI generates effective, pedagogically-sound training content.",
  },
];

const values = [
  {
    icon: Target,
    title: "Practical Over Theoretical",
    description: "Real help desk tickets, actual error messages, hands-on troubleshooting - not memorizing definitions.",
  },
  {
    icon: Users,
    title: "Accessible to All",
    description: "Quality IT training shouldn't require expensive certifications. Learn at your own pace, completely free.",
  },
  {
    icon: Sparkles,
    title: "AI-Enhanced Learning",
    description: "Leverage AI to generate unlimited realistic scenarios while keeping human expertise at the core.",
  },
  {
    icon: TrendingUp,
    title: "Career-Focused",
    description: "Every lesson builds skills that employers actually want. Get job-ready, not just test-ready.",
  },
];

export default function About() {
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
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-admin mb-6" data-testid="heading-about">
            About Rebooto
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to make IT support training practical, engaging, and accessible to everyone - 
            regardless of background or budget.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-20"
        >
          <Card className="p-12 bg-gradient-admin text-white">
            <h2 className="text-4xl font-bold mb-6 text-center">Our Mission</h2>
            <p className="text-xl text-white/90 text-center max-w-4xl mx-auto leading-relaxed">
              Traditional IT training is broken. It's expensive, theoretical, and doesn't prepare you for real support work. 
              We created Rebooto to fix that - using AI to generate unlimited realistic scenarios that simulate actual help desk tickets. 
              No more memorizing facts. Just hands-on, practical training that builds real-world skills.
            </p>
          </Card>
        </motion.div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-gradient-admin">Our Values</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            These principles guide everything we build
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
              >
                <Card className="p-8 h-full hover-elevate">
                  <div className="w-14 h-14 rounded-xl bg-gradient-admin/10 flex items-center justify-center mb-6">
                    <value.icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-4 text-gradient-admin">Meet the Team</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Built by IT professionals, for IT professionals
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <Card className="p-8 text-center h-full">
                  <div className="w-20 h-20 rounded-full bg-gradient-admin mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-teal-600 font-medium mb-4">{member.role}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{member.bio}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-12 text-center bg-gradient-to-br from-teal-50 to-emerald-50 border-teal-200">
            <h2 className="text-4xl font-bold mb-6 text-gradient-admin">Join Us on This Journey</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              We're just getting started. Help us build the future of IT training by joining our beta program.
            </p>
            <Button
              size="lg"
              className="bg-gradient-admin text-white rounded-full"
              onClick={() => setLocation("/auth")}
              data-testid="button-join-beta"
            >
              Sign Up Free
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

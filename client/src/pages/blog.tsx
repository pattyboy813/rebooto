import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const blogPosts = [
  {
    id: 1,
    title: "The Future of IT Support Training: Why Hands-On Learning Wins",
    slug: "hands-on-learning-wins",
    excerpt: "Traditional IT training focuses too much on theory. Learn why our practical, scenario-based approach prepares you for real-world support faster.",
    author: "Sarah Chen",
    date: "2025-01-15",
    readTime: "5 min",
    category: "Learning",
    featured: true,
  },
  {
    id: 2,
    title: "Top 10 IT Support Scenarios Every Beginner Should Master",
    slug: "top-10-scenarios",
    excerpt: "From password resets to network troubleshooting, these fundamental scenarios form the foundation of effective IT support.",
    author: "Marcus Johnson",
    date: "2025-01-12",
    readTime: "8 min",
    category: "Tips & Tricks",
    featured: false,
  },
  {
    id: 3,
    title: "How AI is Revolutionizing IT Training (And Why Humans Still Matter)",
    slug: "ai-it-training",
    excerpt: "We use AI to generate realistic support tickets, but the human element of troubleshooting logic and customer service remains irreplaceable.",
    author: "Dr. Emily Rodriguez",
    date: "2025-01-10",
    readTime: "6 min",
    category: "Technology",
    featured: true,
  },
  {
    id: 4,
    title: "Building Your IT Career: Certifications vs. Practical Experience",
    slug: "certs-vs-experience",
    excerpt: "Both matter, but knowing which to prioritize at different career stages can accelerate your path to senior roles.",
    author: "James Patterson",
    date: "2025-01-08",
    readTime: "7 min",
    category: "Career",
    featured: false,
  },
  {
    id: 5,
    title: "5 Common Hardware Troubleshooting Mistakes (And How to Avoid Them)",
    slug: "hardware-mistakes",
    excerpt: "Even experienced techs make these errors. Learn to recognize and prevent them before they cause bigger problems.",
    author: "Sarah Chen",
    date: "2025-01-05",
    readTime: "4 min",
    category: "Hardware",
    featured: false,
  },
  {
    id: 6,
    title: "Network Troubleshooting 101: The OSI Model in Practice",
    slug: "osi-model-practice",
    excerpt: "Stop memorizing layers. Start using the OSI model as a practical troubleshooting framework for real network issues.",
    author: "Marcus Johnson",
    date: "2025-01-03",
    readTime: "10 min",
    category: "Networking",
    featured: false,
  },
];

export default function Blog() {
  const [, setLocation] = useLocation();

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.filter(post => !post.featured);

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

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-admin flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-admin mb-6" data-testid="heading-blog">
            Rebooto Blog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            IT support tips, career advice, and learning strategies
          </p>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <span className="text-gradient-admin">Featured</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="p-8 h-full hover-elevate cursor-pointer" data-testid={`post-${post.slug}`}>
                    <Badge className="mb-4 bg-gradient-admin text-white border-0">{post.category}</Badge>
                    <h3 className="text-2xl font-bold mb-4 text-gradient-admin">{post.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        <div>
          <h2 className="text-3xl font-bold mb-8">
            <span className="text-gradient-admin">Recent Posts</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {recentPosts.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="p-6 h-full hover-elevate cursor-pointer" data-testid={`post-${post.slug}`}>
                  <Badge className="mb-3" variant="secondary">{post.category}</Badge>
                  <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <Card className="p-12 bg-gradient-admin text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Get the latest IT support tips, learning strategies, and platform updates delivered to your inbox.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/")}
              className="rounded-full"
              data-testid="button-subscribe"
            >
              Subscribe to Newsletter
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

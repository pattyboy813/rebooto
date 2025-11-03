import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, User, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  tags: string[] | null;
  published: boolean;
  publishedAt: string | null;
  authorId: number;
  createdAt: string;
  updatedAt: string;
}

export default function Blog() {
  const [, setLocation] = useLocation();

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min`;
  };

  const featuredPosts = blogPosts.slice(0, 2);
  const recentPosts = blogPosts.slice(2);

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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading blog posts...</p>
          </div>
        )}

        {/* Featured Posts */}
        {!isLoading && featuredPosts.length > 0 && (
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
                    {post.tags && post.tags.length > 0 && (
                      <Badge className="mb-4 bg-gradient-admin text-white border-0">{post.tags[0]}</Badge>
                    )}
                    <h3 className="text-2xl font-bold mb-4 text-gradient-admin">{post.title}</h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{calculateReadTime(post.content)}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Posts */}
        {!isLoading && recentPosts.length > 0 && (
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
                    {post.tags && post.tags.length > 0 && (
                      <Badge className="mb-3" variant="secondary">{post.tags[0]}</Badge>
                    )}
                    <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{calculateReadTime(post.content)}</span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg mb-4">No blog posts available yet.</p>
            <p className="text-muted-foreground text-sm">Check back soon for IT support tips and learning strategies!</p>
          </div>
        )}

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

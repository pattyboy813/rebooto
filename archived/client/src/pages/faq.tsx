import { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Search, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const faqCategories = [
  {
    title: "Getting Started",
    faqs: [
      {
        question: "Is Rebooto really free?",
        answer: "Yes! Rebooto is currently in beta and completely free to use. We want to help as many people as possible learn IT support skills. We'll announce any pricing changes well in advance.",
      },
      {
        question: "Do I need prior IT experience to start?",
        answer: "Not at all! Our courses are designed for all skill levels. Start with Beginner courses if you're new to IT support. Each course is labeled by difficulty level, so you can progress at your own pace.",
      },
      {
        question: "How long does it take to complete a course?",
        answer: "It varies by course, but most beginner courses take 2-4 hours to complete. You can learn at your own pace - there are no time limits or deadlines. Your progress is saved automatically.",
      },
      {
        question: "Can I use Rebooto on my phone or tablet?",
        answer: "Yes! Rebooto is fully responsive and works on desktop, tablet, and mobile devices. However, for the best learning experience with detailed scenarios, we recommend using a desktop or laptop.",
      },
    ],
  },
  {
    title: "Learning & Progress",
    faqs: [
      {
        question: "What are XP and levels?",
        answer: "XP (Experience Points) are earned by completing lessons. As you earn XP, you level up! Each level represents your overall progress and expertise. XP amounts vary by course difficulty: Beginner lessons award 100 XP, Intermediate award 150 XP, and Advanced award 200 XP.",
      },
      {
        question: "Can I retake lessons or courses?",
        answer: "Absolutely! You can revisit any lesson at any time to review concepts. However, you only earn XP once per lesson to prevent gaming the system. Use retakes to refresh your knowledge or practice troubleshooting steps.",
      },
      {
        question: "How are scenarios different from traditional courses?",
        answer: "Traditional courses teach theory. Rebooto uses realistic, hands-on scenarios based on actual help desk tickets. Each lesson simulates a real IT problem with specific error messages, troubleshooting steps, and solutions - just like you'd encounter in a real support role.",
      },
      {
        question: "What are achievements and how do I unlock them?",
        answer: "Achievements are badges you earn by hitting milestones (completing your first lesson, reaching level 10, finishing a full course, etc.). They celebrate your progress and keep learning fun and engaging.",
      },
    ],
  },
  {
    title: "Courses & Content",
    faqs: [
      {
        question: "What types of IT scenarios do you cover?",
        answer: "We cover three main categories: Hardware Headaches (boot issues, component failures, beep codes), Network Nightmares (connectivity problems, DNS issues, IP conflicts), and Software Struggles (application errors, OS troubleshooting, updates). Each includes practical, real-world scenarios.",
      },
      {
        question: "Are the scenarios based on real IT tickets?",
        answer: "Yes! Our AI generates scenarios based on actual help desk patterns and real support tickets. You'll encounter specific error messages, beep codes, command-line tools, and troubleshooting logic used by IT professionals every day.",
      },
      {
        question: "How often is new content added?",
        answer: "We add new courses and lessons regularly. Admins can generate new courses using our AI-powered course creator, which creates realistic scenarios on demand. Follow our blog or enable notifications to stay updated on new content.",
      },
      {
        question: "Can I suggest course topics?",
        answer: "Definitely! We love feedback from our community. Use the Support page to submit course ideas, and we'll consider them for future content. Popular requests get priority.",
      },
    ],
  },
  {
    title: "Account & Technical",
    faqs: [
      {
        question: "How do I reset my password?",
        answer: "Click 'Forgot Password' on the login page, enter your email, and we'll send you a reset link. If you don't receive the email within a few minutes, check your spam folder or contact support.",
      },
      {
        question: "Can I change my email address?",
        answer: "Yes! Go to your Profile Settings page (coming soon) and update your email. You'll need to verify the new email address for security.",
      },
      {
        question: "Is my data secure?",
        answer: "Absolutely. We use industry-standard encryption for passwords (bcrypt), secure session management, and HTTPS for all connections. We never share your personal information with third parties.",
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account at any time from your Profile Settings. Note that this is permanent and will delete all your progress, XP, and achievements.",
      },
    ],
  },
];

export default function FAQ() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.faqs.length > 0);

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

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-admin flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gradient-admin mb-6" data-testid="heading-faq">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions about Rebooto
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg"
                data-testid="input-search-faq"
              />
            </div>
          </div>
        </motion.div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, idx) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <h2 className="text-2xl font-bold mb-4 text-gradient-admin" data-testid={`category-${category.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {category.title}
                </h2>
                <Card className="p-6">
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIdx) => (
                      <AccordionItem key={faqIdx} value={`item-${idx}-${faqIdx}`}>
                        <AccordionTrigger className="text-left" data-testid={`question-${idx}-${faqIdx}`}>
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground text-lg">
                No FAQs found for "{searchQuery}"
              </p>
            </Card>
          )}
        </div>

        {/* Still Need Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <Card className="p-12 bg-gradient-admin text-white">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setLocation("/support")}
              className="rounded-full"
              data-testid="button-contact-support"
            >
              Contact Support
            </Button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

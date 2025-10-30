import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSession, requireAuth, requireAdmin, getCurrentUser, hashPassword, verifyPassword, sanitizeUser } from "./auth";
import {
  insertEmailSignupSchema,
  insertUserProgressSchema,
  insertFeedbackSchema,
  insertCourseSchema,
  insertLessonSchema,
  localSignupSchema,
  localLoginSchema,
} from "@shared/schema";
import OpenAI from "openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupSession(app);

  // Local email/password authentication
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = localSignupSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);

      // Create user with local auth
      const user = await storage.createUser({
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        dateOfBirth: validatedData.dateOfBirth,
        authProvider: "local",
        hashedPassword,
        isAdmin: false,
        replitId: null,
      });

      // Set session
      req.session.userId = user.id;

      res.status(201).json({
        user: sanitizeUser(user),
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = localLoginSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.hashedPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValid = await verifyPassword(validatedData.password, user.hashedPassword);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if account is active
      if (!user.isActive) {
        return res.status(403).json({ message: "Account is deactivated" });
      }

      // Set session
      req.session.userId = user.id;

      res.json({
        user: sanitizeUser(user),
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.post("/api/signups", async (req, res) => {
    try {
      const validatedData = insertEmailSignupSchema.parse(req.body);
      const signup = await storage.createEmailSignup(validatedData);
      res.status(201).json(signup);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Invalid email format",
          errors: error.errors 
        });
      }
      if (error.message === "Email already registered") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/signups", requireAuth, async (_req, res) => {
    try {
      const signups = await storage.getAllEmailSignups();
      res.json(signups);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/signups/count", async (_req, res) => {
    try {
      const count = await storage.getEmailSignupsCount();
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/user", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });


  app.get("/api/progress", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const progressList = await storage.getUserProgressList(user.id);
      res.json(progressList);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/progress", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const validatedData = insertUserProgressSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const progress = await storage.createUserProgress(validatedData);
      res.status(201).json(progress);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/progress/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const existing = await storage.getUserProgress(user.id, req.body.lessonId);
      if (!existing || existing.id !== id) {
        return res.status(404).json({ message: "Progress not found" });
      }

      const updates: any = {};
      if (req.body.completed !== undefined) {
        updates.completed = req.body.completed;
        if (req.body.completed) {
          updates.completedAt = new Date();
          
          // Award XP only if lesson wasn't already completed
          if (!existing.completed) {
            const lesson = await storage.getLesson(req.body.lessonId);
            if (lesson) {
              await storage.updateUserXP(user.id, lesson.xpReward);
            }
          }
        }
      }
      if (req.body.choices !== undefined) updates.choices = req.body.choices;
      if (req.body.score !== undefined) updates.score = req.body.score;

      const progress = await storage.updateUserProgress(id, updates);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const completedCount = await storage.getUserCompletedCount(user.id);
      const progressList = await storage.getUserProgressList(user.id);
      
      res.json({
        xp: user?.xp || 0,
        level: user?.level || 1,
        scenariosCompleted: completedCount,
        totalProgress: progressList.length,
        recentActivity: progressList.slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/feedback", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const feedbackRecord = await storage.createFeedback(validatedData);
      res.status(201).json(feedbackRecord);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Course routes
  app.get("/api/courses", async (_req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      const lessons = await storage.getLessonsByCourse(id);
      res.json({ ...course, lessons });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/courses/:id/enroll", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const courseId = parseInt(req.params.id);
      const existing = await storage.getCourseEnrollment(user.id, courseId);
      if (existing) {
        return res.status(409).json({ message: "Already enrolled in this course" });
      }
      const enrollment = await storage.createEnrollment({ userId: user.id, courseId });
      res.status(201).json(enrollment);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/enrollments", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const enrollments = await storage.getUserEnrollments(user.id);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Lesson routes
  app.get("/api/lessons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lesson = await storage.getLesson(id);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      res.json(lesson);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/lessons/:id/complete", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const lessonId = parseInt(req.params.id);
      const lesson = await storage.getLesson(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      let progress = await storage.getUserProgress(user.id, lessonId);
      
      if (!progress) {
        progress = await storage.createUserProgress({
          userId: user.id,
          lessonId,
          completed: true,
          choices: req.body.choices || [],
          score: req.body.score || 0,
        });
        const updatedUser = await storage.updateUserXP(user.id, lesson.xpReward);
        
        const allAchievements = await storage.getAllAchievements();
        for (const achievement of allAchievements) {
          if (updatedUser.xp >= achievement.xpRequired) {
            const hasAchievement = await storage.checkUserHasAchievement(user.id, achievement.id);
            if (!hasAchievement) {
              await storage.unlockAchievement({ userId: user.id, achievementId: achievement.id });
            }
          }
        }
        
        return res.json({ progress, xpAwarded: lesson.xpReward });
      }

      if (progress.completed) {
        return res.status(409).json({ message: "Lesson already completed" });
      }

      const updatedProgress = await storage.updateUserProgress(progress.id, {
        completed: true,
        choices: req.body.choices || progress.choices,
        score: req.body.score || progress.score,
      });
      
      const updatedUser = await storage.updateUserXP(user.id, lesson.xpReward);
      
      const allAchievements = await storage.getAllAchievements();
      for (const achievement of allAchievements) {
        if (updatedUser.xp >= achievement.xpRequired) {
          const hasAchievement = await storage.checkUserHasAchievement(user.id, achievement.id);
          if (!hasAchievement) {
            await storage.unlockAchievement({ userId: user.id, achievementId: achievement.id });
          }
        }
      }
      
      res.json({ progress: updatedProgress, xpAwarded: lesson.xpReward });
    } catch (error) {
      console.error("Error completing lesson:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Achievement routes
  app.get("/api/achievements", async (_req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/achievements", requireAuth, async (req: any, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userAchievements = await storage.getUserAchievements(user.id);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Stats Routes
  app.get("/api/admin/stats", requireAdmin, async (_req, res) => {
    try {
      const totalUsers = await storage.getTotalUsersCount();
      const activeCourses = await storage.getAllCourses();
      const emailSignups = await storage.getEmailSignupsCount();
      const allProgress = await storage.getAllUserProgress();
      const allLessons = await storage.getAllLessons();
      
      // Calculate completion rate
      const totalLessons = allLessons.length;
      const completedLessons = allProgress.filter(p => p.completed).length;
      const completionRate = totalLessons > 0 
        ? Math.round((completedLessons / totalLessons) * 100) 
        : 0;
      
      res.json({
        totalUsers,
        activeCourses: activeCourses.length,
        emailSignups,
        completionRate,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Users Routes
  app.get("/api/admin/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Sanitize users - remove passwords
      const sanitizedUsers = users.map(user => sanitizeUser(user));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Validate request body with Zod
      const roleUpdateSchema = z.object({
        isAdmin: z.boolean(),
      });
      
      const validationResult = roleUpdateSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid request body",
          errors: validationResult.error.errors 
        });
      }

      const { isAdmin } = validationResult.data;
      const updatedUser = await storage.updateUser(userId, { isAdmin });
      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = await getCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (currentUser.id === userId) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      await storage.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Course Management Routes
  app.post("/api/admin/courses/generate", requireAdmin, async (req, res) => {
    try {
      const { title, description, category, difficulty, lessonCount } = req.body;

      if (!title || !description || !category || !difficulty || !lessonCount) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });

      const xpRewards: Record<string, number> = {
        Beginner: 100,
        Intermediate: 150,
        Advanced: 200,
      };

      const prompt = `Generate ${lessonCount} PRACTICAL, hands-on IT support lessons for a course titled "${title}".
Description: ${description}
Category: ${category}
Difficulty: ${difficulty}

CRITICAL: These must be REAL-WORLD, PRACTICAL scenarios, not theoretical knowledge. Each lesson should simulate an actual help desk ticket.

For each lesson, create:
1. **Title**: Specific problem (e.g., "Computer Won't Boot - 3 Beep Code Error" not "Understanding Boot Processes")

2. **Description**: Brief 1-2 sentence summary of the practical scenario

3. **Content** (THIS IS THE MOST IMPORTANT PART - Make it detailed and hands-on):
   
   **Problem**: Write like a real help desk ticket. Include:
   - User's complaint/symptoms (exactly as a user would describe it)
   - Specific error messages, codes, or beep codes if applicable
   - What the user was doing when the problem occurred
   - Any troubleshooting they've already attempted
   Example: "User reports laptop won't turn on. When pressing power button, they hear 3 short beeps repeatedly. Screen remains black. User states it was working fine yesterday but laptop was dropped. Battery indicator light blinks amber 3 times."

   **Steps**: Detailed, actionable troubleshooting steps (${difficulty === 'Beginner' ? '7-12' : difficulty === 'Intermediate' ? '10-15' : '12-18'} steps). Each step should:
   - Be specific and actionable ("Press F2 during boot" not "Access BIOS")
   - Include exact commands, buttons, or tools to use
   - Mention what to look for or expect
   - Build logically from diagnosis to solution
   Example steps:
   - "Power off the laptop completely and disconnect the power adapter"
   - "Locate the RAM access panel on the bottom of the laptop (usually marked with a memory icon)"
   - "Use a Phillips #0 screwdriver to remove the 2 screws securing the panel"
   - "Carefully press the retention clips outward on both sides of the RAM module"
   - "Remove the RAM stick and inspect for visible damage or debris"
   - "Clean the gold contacts with a soft, dry cloth or pencil eraser"
   - "Firmly reseat the RAM module at a 30-degree angle, then press down until clips lock"
   - "Replace the access panel and secure with screws"
   - "Reconnect power adapter and press the power button"
   - "Listen for the normal single beep and check if system boots to BIOS/OS"

   **Solution**: Comprehensive resolution with:
   - Root cause explanation (what actually caused the problem)
   - Why the fix works (technical reasoning)
   - Prevention tips for the future
   - When to escalate (if fix doesn't work)
   Example: "The 3-beep POST code indicates a RAM failure. In this case, the laptop drop likely caused the RAM module to become unseated. Reseating the RAM allows proper contact with the motherboard, resolving the boot failure. The amber light pattern confirms Dell's RAM diagnostic code. If reseating doesn't work, the RAM module itself may be damaged and need replacement. Always document the beep code pattern as it provides crucial diagnostic information."

4. **XP Reward**: ${xpRewards[difficulty as keyof typeof xpRewards]}

${category === 'Hardware Headaches' ? `
HARDWARE SCENARIOS should include:
- Specific error codes (beep codes, LED patterns, BIOS codes)
- Physical components to check (RAM, HDD, cables, power supply)
- Diagnostic tools (POST cards, multimeters, hardware diagnostics)
- Actual hardware models/brands when relevant
` : category === 'Network Nightmares' ? `
NETWORK SCENARIOS should include:
- Specific error messages ("Cannot obtain IP address", "DNS server not responding")
- Exact commands (ipconfig /all, ping 8.8.8.8, tracert)
- Tools to use (Network Diagnostics, Device Manager, router admin panel)
- IP addresses, subnet masks, gateway configurations
- Troubleshooting from Layer 1 (physical) up to Layer 7 (application)
` : `
SOFTWARE SCENARIOS should include:
- Actual error codes and messages (e.g., "Error 0x80070005", "Application has stopped working")
- Specific applications and versions
- Registry paths or config file locations if relevant
- Command-line tools (sfc /scannow, DISM, event viewer)
- Log file locations and what to look for
`}

Return ONLY a valid JSON array with NO additional text:
[
  {
    "title": "Specific problem title",
    "description": "Brief scenario summary",
    "content": {
      "problem": "Detailed help desk ticket with symptoms, error messages, user actions",
      "steps": ["Actionable step 1", "Actionable step 2", ...],
      "solution": "Root cause + why fix works + prevention tips"
    },
    "xpReward": ${xpRewards[difficulty as keyof typeof xpRewards]}
  }
]

Make every scenario feel like a real support ticket you'd actually encounter. Include specific details, real tools, actual commands, and practical troubleshooting logic.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior IT support specialist and training instructor with 15+ years of hands-on help desk experience. You create PRACTICAL, realistic training scenarios based on actual support tickets you've handled. Your scenarios include specific error messages, exact commands, real tools, and detailed troubleshooting steps - NOT theoretical knowledge. Every scenario should feel like a real ticket from a real user. Always respond with valid JSON only, no additional text or markdown.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      if (!responseText) {
        return res.status(500).json({ message: "Failed to generate lessons" });
      }

      let lessons;
      try {
        lessons = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", responseText);
        return res.status(500).json({ message: "Invalid response format from AI" });
      }

      res.json({ lessons });
    } catch (error: any) {
      console.error("Error generating course:", error);
      res.status(500).json({ message: error.message || "Failed to generate course" });
    }
  });

  app.post("/api/admin/courses", requireAdmin, async (req, res) => {
    try {
      const { course, lessons } = req.body;

      if (!course || !lessons || !Array.isArray(lessons)) {
        return res.status(400).json({ message: "Invalid request format" });
      }

      const validatedCourse = insertCourseSchema.parse(course);
      
      const totalXP = lessons.reduce((sum: number, lesson: any) => sum + (lesson.xpReward || 0), 0);
      const createdCourse = await storage.createCourse({
        ...validatedCourse,
        xpTotal: totalXP,
        lessonCount: lessons.length,
      });

      const createdLessons = [];
      for (let i = 0; i < lessons.length; i++) {
        const validatedLesson = insertLessonSchema.parse({
          ...lessons[i],
          courseId: createdCourse.id,
          orderIndex: i,
        });
        const lesson = await storage.createLesson(validatedLesson);
        createdLessons.push(lesson);
      }

      res.status(201).json({ ...createdCourse, lessons: createdLessons });
    } catch (error: any) {
      console.error("Error creating course:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.get("/api/admin/courses", requireAdmin, async (_req, res) => {
    try {
      const courses = await storage.getAllCourses();
      const coursesWithLessonCount = await Promise.all(
        courses.map(async (course) => {
          const lessons = await storage.getLessonsByCourse(course.id);
          return { ...course, lessonCount: lessons.length };
        })
      );
      res.json(coursesWithLessonCount);
    } catch (error) {
      console.error("Error fetching admin courses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/courses/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCourse(id);
      res.json({ message: "Course deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting course:", error);
      if (error.message === "Course not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete course" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

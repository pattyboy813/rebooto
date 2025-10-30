import type { Express } from "express";
import { createServer, type Server } from "http";
import { randomBytes } from "crypto";
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
import { sendEmail } from "./outlook";

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

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email || typeof email !== "string") {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      
      // For security, don't reveal if email exists or not
      // Always return success message
      if (user && user.authProvider === "local") {
        // Generate cryptographically secure reset token (64 characters hex)
        // TODO: Security enhancement - hash token before storage (e.g., SHA-256) to prevent 
        // account takeover if database is compromised. Current implementation uses secure 
        // random generation with 1-hour expiry and single-use validation as MVP protection.
        const token = randomBytes(32).toString('hex');
        
        // Token expires in 1 hour
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
        
        await storage.createPasswordResetToken({
          userId: user.id,
          token,
          expiresAt,
        });

        // Send password reset email via Outlook
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${token}`;
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #14b8a6;">Reset Your Rebooto Password</h2>
            <p>Hi ${user.firstName},</p>
            <p>You requested to reset your password for your Rebooto account. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #14b8a6 0%, #10b981 100%); color: white; padding: 12px 32px; text-decoration: none; border-radius: 24px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="color: #666; word-break: break-all;">${resetUrl}</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="color: #999; font-size: 12px;">Rebooto - Gamified IT Support Learning Platform</p>
          </div>
        `;

        try {
          await sendEmail(user.email, "Reset Your Rebooto Password", emailBody);
          console.log(`Password reset email sent to ${email}`);
        } catch (emailError) {
          console.error("Failed to send password reset email:", emailError);
          // Log the reset link for development fallback
          console.log(`Reset link (email failed): ${resetUrl}`);
        }
        
        // In development, also return the token in response for easier testing
        if (process.env.NODE_ENV !== 'production') {
          return res.json({ 
            message: "Password reset email sent. Check your inbox.",
            devToken: token
          });
        }
      }
      
      res.json({ message: "If that email exists, a password reset link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      const resetPasswordSchema = z.object({
        token: z.string().min(1, "Token is required"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      });
      
      const validatedData = resetPasswordSchema.parse({ token, password });
      
      // Verify token exists and is not expired
      const resetToken = await storage.getPasswordResetToken(validatedData.token);
      
      if (!resetToken || resetToken.usedAt) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Get user
      const user = await storage.getUser(resetToken.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Update user password
      await storage.updateUser(user.id, { hashedPassword });
      
      // Mark token as used
      await storage.markPasswordResetTokenUsed(validatedData.token);
      
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User profile management routes (protected)
  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const updateProfileSchema = z.object({
        firstName: z.string().min(1, "First name is required").optional(),
        lastName: z.string().min(1, "Last name is required").optional(),
        email: z.string().email("Invalid email address").optional(),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
      });

      const validatedData = updateProfileSchema.parse(req.body);

      // If email is being changed, check if it's already taken
      if (validatedData.email && validatedData.email !== user.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser) {
          return res.status(409).json({ message: "Email already in use" });
        }
      }

      const updatedUser = await storage.updateUser(user.id, validatedData);
      res.json({ user: sanitizeUser(updatedUser) });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/password", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Get full user with hashedPassword
      const fullUser = await storage.getUser(currentUser.id);
      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Only local auth users can change password
      if (fullUser.authProvider !== "local" || !fullUser.hashedPassword) {
        return res.status(400).json({ message: "Password change not available for this account type" });
      }

      const changePasswordSchema = z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "New password must be at least 8 characters"),
      });

      const validatedData = changePasswordSchema.parse(req.body);

      // Verify current password
      const isValid = await verifyPassword(validatedData.currentPassword, fullUser.hashedPassword);
      if (!isValid) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash and update new password
      const hashedPassword = await hashPassword(validatedData.newPassword);
      await storage.updateUser(fullUser.id, { hashedPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      console.error("Change password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/user/account", requireAuth, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { password } = req.body;

      // Get full user with hashedPassword
      const fullUser = await storage.getUser(currentUser.id);
      if (!fullUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // For local auth users, require password confirmation
      if (fullUser.authProvider === "local" && fullUser.hashedPassword) {
        if (!password) {
          return res.status(400).json({ message: "Password is required to delete account" });
        }

        const isValid = await verifyPassword(password, fullUser.hashedPassword);
        if (!isValid) {
          return res.status(401).json({ message: "Incorrect password" });
        }
      }

      // Delete user account
      await storage.deleteUser(fullUser.id);

      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
      });

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
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

  // Blog Post Routes
  app.get("/api/blog", async (_req, res) => {
    try {
      const posts = await storage.getPublishedBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/blog", requireAdmin, async (_req, res) => {
    try {
      const posts = await storage.getAllBlogPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching all blog posts:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/blog", requireAdmin, async (req, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const createBlogPostSchema = z.object({
        title: z.string().min(1, "Title is required"),
        slug: z.string().min(1, "Slug is required"),
        excerpt: z.string().min(1, "Excerpt is required"),
        content: z.string().min(1, "Content is required"),
        featuredImage: z.string().optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().default(false),
      });

      const validatedData = createBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost({
        ...validatedData,
        authorId: currentUser.id,
        publishedAt: validatedData.published ? new Date() : null,
      });

      res.status(201).json(post);
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create blog post" });
    }
  });

  app.put("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const updateBlogPostSchema = z.object({
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        excerpt: z.string().min(1).optional(),
        content: z.string().min(1).optional(),
        featuredImage: z.string().optional(),
        tags: z.array(z.string()).optional(),
        published: z.boolean().optional(),
      });

      const validatedData = updateBlogPostSchema.parse(req.body);
      
      // If publishing, set publishedAt
      let updateData: any = { ...validatedData };
      if (validatedData.published === true) {
        updateData.publishedAt = new Date();
      } else if (validatedData.published === false) {
        updateData.publishedAt = null;
      }

      const post = await storage.updateBlogPost(id, updateData);
      res.json(post);
    } catch (error: any) {
      console.error("Error updating blog post:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      if (error.message === "Blog post not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update blog post" });
    }
  });

  app.delete("/api/admin/blog/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.json({ message: "Blog post deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting blog post:", error);
      if (error.message === "Blog post not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete blog post" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

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
  insertUserRoleSchema,
  insertNoticeSchema,
  insertSupportLogSchema,
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

        const emailResult = await sendEmail(user.email, "Reset Your Rebooto Password", emailBody);
        
        if (emailResult.success) {
          console.log(`Password reset email sent successfully to ${email}`);
        } else {
          console.error("Failed to send password reset email:", emailResult.error);
          // Security: Do not log the actual token/reset URL as it would expose credentials in logs
          console.log(`Password reset requested for user: ${user.id} (email send failed - check Outlook integration)`);
          // Note: Token remains valid in database for 1 hour even if email fails
        }
        
        // DEVELOPMENT ONLY: Return token in response for testing purposes
        // WARNING: This should NEVER be exposed in production deployments
        if (process.env.NODE_ENV === 'development') {
          return res.json({ 
            message: "Password reset email sent. Check your inbox.",
            devToken: token // Only for local development/testing
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

  // Helper function to check and mark enrollment complete
  async function checkEnrollmentCompletion(userId: number, courseId: number) {
    const courseLessons = await storage.getLessonsByCourse(courseId);
    console.log(`[Enrollment Check] Course ${courseId} has ${courseLessons.length} lessons`);
    
    const allCompleted = await Promise.all(
      courseLessons.map(async (l: any) => {
        const p = await storage.getUserProgress(userId, l.id);
        console.log(`[Enrollment Check] Lesson ${l.id}: progress=${p?.id}, completed=${p?.completed}`);
        return p?.completed || false;
      })
    );
    
    console.log(`[Enrollment Check] All completed status:`, allCompleted);
    console.log(`[Enrollment Check] Every completed?`, allCompleted.every((c: boolean) => c === true));
    
    if (allCompleted.every((c: boolean) => c === true)) {
      console.log(`[Enrollment Check] All lessons complete! Looking for enrollment...`);
      const userEnrollments = await storage.getUserEnrollments(userId);
      const enrollment = userEnrollments.find((e: any) => e.courseId === courseId);
      console.log(`[Enrollment Check] Found enrollment:`, enrollment?.id, 'completedAt:', enrollment?.completedAt);
      if (enrollment && !enrollment.completedAt) {
        console.log(`[Enrollment Check] Marking enrollment ${enrollment.id} as complete`);
        await storage.completeEnrollment(enrollment.id);
      }
    }
  }

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
        
        // Check if all lessons in the course are now completed
        await checkEnrollmentCompletion(user.id, lesson.courseId);
        
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
      
      // Check if all lessons in the course are now completed
      await checkEnrollmentCompletion(user.id, lesson.courseId);
      
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

      const prompt = `Generate ${lessonCount} comprehensive IT support theory lessons for a course titled "${title}".
Description: ${description}
Category: ${category}
Difficulty: ${difficulty}

CRITICAL: Create TEXT-BASED educational content. NO references to audio, video, podcasts, or multimedia. Focus on written theory, concepts, and interactive quiz questions.

For each lesson, create a "content" array with blocks in this exact structure:

**BLOCK 1 - SCENARIO** (type: "scenario"):
- Introduce the topic with context and real-world relevance
- Explain why this knowledge is important for IT support
- Set learning objectives
Example: "Understanding BIOS POST codes is essential for hardware diagnostics. When a computer fails to boot, POST codes help identify the exact hardware component causing the issue. This lesson teaches you to interpret beep patterns, LED indicators, and troubleshoot boot failures effectively."

**BLOCKS 2-${difficulty === 'Beginner' ? '7' : difficulty === 'Intermediate' ? '9' : '11'} - TEXT** (type: "text"):
- Each block teaches one specific concept or technique
- Include technical details, terminology, and examples
- Build knowledge progressively from basics to advanced
- Use concrete examples and real-world applications
Example blocks:
- "POST (Power-On Self-Test) runs automatically when powering on a computer, checking all hardware components before loading the operating system. The BIOS executes this diagnostic to ensure system stability."
- "Different manufacturers use unique beep code patterns. Dell systems use 1-3-2 (motherboard issue), while AMI BIOS uses 3 short beeps for memory errors. Always consult manufacturer documentation."
- "LED diagnostic lights provide visual feedback: solid amber indicates power/battery problems, blinking amber suggests motherboard failure, and solid white shows normal operation."

**BLOCKS ${difficulty === 'Beginner' ? '8-10' : difficulty === 'Intermediate' ? '10-12' : '12-15'} - QUIZ** (type: "quiz"):
Create ${difficulty === 'Beginner' ? '3' : difficulty === 'Intermediate' ? '3' : '4'} multiple-choice questions that TEST the concepts taught. Each quiz must have:
- "question": Clear, specific question about the lesson content
- "options": Array of ${difficulty === 'Beginner' ? '3' : '4'} plausible answers (one correct, others are realistic distractors)
- "correctAnswer": Index (0-based) of the correct option
- "explanation": Detailed explanation of WHY the answer is correct and why other options are wrong

Example quiz block:
{
  "type": "quiz",
  "question": "A computer emits three short beeps during startup and fails to display anything on screen. Based on standard AMI BIOS codes, what is the most likely cause?",
  "options": [
    "Hard drive failure",
    "RAM (memory) error or improperly seated modules",
    "Overheating CPU",
    "Power supply malfunction"
  ],
  "correctAnswer": 1,
  "explanation": "Three short beeps in AMI BIOS specifically indicate a base memory (RAM) error. This is one of the most common POST failure codes. The RAM modules may be improperly seated, incompatible, or faulty. Hard drive issues don't trigger POST beeps since POST occurs before drive detection. CPU overheating would cause shutdown, not beep codes. Power supply failure would prevent any beeps at all."
}

${category === 'Hardware Headaches' ? `
HARDWARE TOPICS should include:
- Specific diagnostic codes (POST beeps, LED patterns, BIOS error codes)
- Physical components (RAM, motherboard, PSU, drives, cables)
- Diagnostic tools and techniques
- Real manufacturer examples (Dell, HP, Lenovo)
` : category === 'Network Nightmares' ? `
NETWORK TOPICS should include:
- Network troubleshooting commands (ipconfig, ping, tracert, nslookup)
- Common error messages and their meanings
- OSI model layers and troubleshooting approach
- IP addressing, DNS, DHCP concepts
` : `
SOFTWARE TOPICS should include:
- Windows error codes and system tools
- Application troubleshooting methods  
- Registry, event logs, and diagnostic commands
- Safe mode, system restore, and recovery options
`}

Return ONLY valid JSON array (NO markdown, NO backticks):
[
  {
    "title": "Clear lesson title",
    "description": "1-2 sentence overview",
    "content": [
      {
        "type": "scenario",
        "content": "Introduction with context..."
      },
      {
        "type": "text",
        "content": "First concept explanation..."
      },
      {
        "type": "text",
        "content": "Second concept explanation..."
      },
      {
        "type": "quiz",
        "question": "Test question?",
        "options": ["Option 1", "Option 2", "Option 3"],
        "correctAnswer": 1,
        "explanation": "Why option 2 is correct..."
      }
    ],
    "xpReward": ${xpRewards[difficulty as keyof typeof xpRewards]}
  }
]

Make questions challenging but fair. Ensure explanations teach WHY answers are correct.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a senior IT support training instructor with 15+ years of experience creating interactive educational content. You create comprehensive, TEXT-BASED lessons with engaging multiple-choice quiz questions that test understanding. NEVER reference audio, video, podcasts, or any multimedia content. Focus entirely on written educational material with detailed explanations, technical concepts, and interactive learning assessments. Every quiz question must have plausible distractors and clear explanations that reinforce learning. Always respond with valid JSON only - no markdown formatting, no code blocks, no additional text.",
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
        
        // Validate lesson content structure
        if (Array.isArray(lessons)) {
          for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            if (lesson.content && Array.isArray(lesson.content)) {
              // Validate each content block against our schema
              const { lessonContentArraySchema } = await import("@shared/schema");
              try {
                lessonContentArraySchema.parse(lesson.content);
              } catch (validationError: any) {
                console.error("AI Content validation error:", validationError.errors || validationError.message);
                console.error("Invalid content:", JSON.stringify(lesson.content, null, 2));
                return res.status(400).json({ 
                  message: "AI generated invalid lesson structure - please regenerate",
                  lessonIndex: i,
                  lessonTitle: lesson.title,
                  errors: validationError.errors || [validationError.message]
                });
              }
            }
          }
        }
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

  app.post("/api/admin/courses/manual", requireAdmin, async (req, res) => {
    try {
      const { title, description, category, difficulty, lessons } = req.body;

      if (!title || !description || !category || !difficulty || !lessons || !Array.isArray(lessons)) {
        return res.status(400).json({ message: "Invalid request format" });
      }

      // Validate course data
      const validatedCourse = insertCourseSchema.parse({
        title,
        description,
        category,
        difficulty,
      });

      // Calculate total XP from lessons
      const totalXP = lessons.reduce((sum: number, lesson: any) => sum + (lesson.xpReward || 0), 0);

      // Create the course
      const createdCourse = await storage.createCourse({
        ...validatedCourse,
        xpTotal: totalXP,
        lessonCount: lessons.length,
      });

      // Create lessons
      const createdLessons = [];
      for (let i = 0; i < lessons.length; i++) {
        const lessonData = lessons[i];

        // Validate content structure
        if (lessonData.content && Array.isArray(lessonData.content)) {
          const { lessonContentArraySchema } = await import("@shared/schema");
          try {
            lessonContentArraySchema.parse(lessonData.content);
          } catch (validationError: any) {
            return res.status(400).json({
              message: `Lesson ${i + 1} has invalid content structure`,
              lessonIndex: i,
              lessonTitle: lessonData.title,
              errors: validationError.errors || [validationError.message]
            });
          }
        }

        const validatedLesson = insertLessonSchema.parse({
          title: lessonData.title,
          description: lessonData.description,
          xpReward: lessonData.xpReward || 100,
          content: lessonData.content,
          courseId: createdCourse.id,
          orderIndex: i,
        });

        const lesson = await storage.createLesson(validatedLesson);
        createdLessons.push(lesson);
      }

      res.status(201).json({ ...createdCourse, lessons: createdLessons });
    } catch (error: any) {
      console.error("Error creating manual course:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create course" });
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
        // Validate content structure if using new block format
        if (lessons[i].content && Array.isArray(lessons[i].content)) {
          const { lessonContentArraySchema } = await import("@shared/schema");
          try {
            lessonContentArraySchema.parse(lessons[i].content);
          } catch (validationError: any) {
            return res.status(400).json({ 
              message: `Lesson ${i + 1} has invalid content structure`,
              lessonIndex: i,
              lessonTitle: lessons[i].title,
              errors: validationError.errors || [validationError.message]
            });
          }
        }
        
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
      const posts = await storage.getAllBlogPosts(false);
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
        title: validatedData.title,
        slug: validatedData.slug,
        excerpt: validatedData.excerpt,
        content: validatedData.content,
        coverImageUrl: validatedData.featuredImage || null,
        authorId: currentUser.id,
        status: validatedData.published ? 'published' : 'draft',
        readTimeMinutes: Math.ceil(validatedData.content.split(' ').length / 200),
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

  // ========== USER ROLE MANAGEMENT ROUTES ==========
  app.post("/api/admin/roles", requireAdmin, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertUserRoleSchema.parse(req.body);
      const role = await storage.assignRole({
        ...validatedData,
        grantedBy: currentUser.id,
      });
      res.status(201).json(role);
    } catch (error: any) {
      console.error("Error assigning role:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to assign role" });
    }
  });

  app.get("/api/admin/roles", requireAdmin, async (_req, res) => {
    try {
      const roles = await storage.getAllUserRoles();
      res.json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.get("/api/admin/roles/user/:userId", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const roles = await storage.getUserRoles(userId);
      res.json(roles);
    } catch (error) {
      console.error("Error fetching user roles:", error);
      res.status(500).json({ message: "Failed to fetch user roles" });
    }
  });

  app.delete("/api/admin/roles/user/:userId/role/:roleName", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const roleName = req.params.roleName;
      await storage.removeRole(userId, roleName);
      res.json({ message: "Role removed successfully" });
    } catch (error) {
      console.error("Error removing role:", error);
      res.status(500).json({ message: "Failed to remove role" });
    }
  });

  // Admin password reset for any user
  app.post("/api/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(userId, { hashedPassword });

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // ========== NOTICE MANAGEMENT ROUTES ==========
  app.post("/api/admin/notices", requireAdmin, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertNoticeSchema.parse(req.body);
      const notice = await storage.createNotice({
        ...validatedData,
        createdBy: currentUser.id,
      });
      res.status(201).json(notice);
    } catch (error: any) {
      console.error("Error creating notice:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create notice" });
    }
  });

  app.get("/api/admin/notices", requireAdmin, async (_req, res) => {
    try {
      const notices = await storage.getAllNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Failed to fetch notices" });
    }
  });

  app.get("/api/notices/active", async (_req, res) => {
    try {
      const notices = await storage.getActiveNotices();
      res.json(notices);
    } catch (error) {
      console.error("Error fetching active notices:", error);
      res.status(500).json({ message: "Failed to fetch active notices" });
    }
  });

  app.put("/api/admin/notices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNoticeSchema.partial().parse(req.body);
      const notice = await storage.updateNotice(id, validatedData);
      res.json(notice);
    } catch (error: any) {
      console.error("Error updating notice:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update notice" });
    }
  });

  app.post("/api/admin/notices/:id/deactivate", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notice = await storage.deactivateNotice(id);
      res.json(notice);
    } catch (error) {
      console.error("Error deactivating notice:", error);
      res.status(500).json({ message: "Failed to deactivate notice" });
    }
  });

  app.delete("/api/admin/notices/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNotice(id);
      res.json({ message: "Notice deleted successfully" });
    } catch (error) {
      console.error("Error deleting notice:", error);
      res.status(500).json({ message: "Failed to delete notice" });
    }
  });

  // ========== SUPPORT LOG ROUTES ==========
  app.post("/api/support", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const validatedData = insertSupportLogSchema.parse(req.body);
      const supportLog = await storage.createSupportLog({
        ...validatedData,
        userId: currentUser.id,
        userEmail: currentUser.email,
      });
      res.status(201).json(supportLog);
    } catch (error: any) {
      console.error("Error creating support log:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create support log" });
    }
  });

  app.get("/api/admin/support", requireAdmin, async (_req, res) => {
    try {
      const logs = await storage.getAllSupportLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching support logs:", error);
      res.status(500).json({ message: "Failed to fetch support logs" });
    }
  });

  app.get("/api/admin/support/status/:status", requireAdmin, async (req, res) => {
    try {
      const status = req.params.status;
      const logs = await storage.getSupportLogsByStatus(status);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching support logs by status:", error);
      res.status(500).json({ message: "Failed to fetch support logs" });
    }
  });

  app.get("/api/support/my-tickets", requireAuth, async (req: any, res) => {
    try {
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const logs = await storage.getUserSupportLogs(currentUser.id);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching user support logs:", error);
      res.status(500).json({ message: "Failed to fetch support logs" });
    }
  });

  app.put("/api/admin/support/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const log = await storage.updateSupportLog(id, updates);
      res.json(log);
    } catch (error) {
      console.error("Error updating support log:", error);
      res.status(500).json({ message: "Failed to update support log" });
    }
  });

  app.post("/api/admin/support/:id/resolve", requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const log = await storage.resolveSupportLog(id, currentUser.id);
      res.json(log);
    } catch (error) {
      console.error("Error resolving support log:", error);
      res.status(500).json({ message: "Failed to resolve support log" });
    }
  });

  app.delete("/api/admin/support/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSupportLog(id);
      res.json({ message: "Support log deleted successfully" });
    } catch (error) {
      console.error("Error deleting support log:", error);
      res.status(500).json({ message: "Failed to delete support log" });
    }
  });

  // Get single ticket with responses
  app.get("/api/support/:id", requireAuth, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const ticket = await storage.getSupportLog(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Users can only see their own tickets unless they're admin
      if (ticket.userId !== currentUser.id && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const responses = await storage.getTicketResponses(id);
      res.json({ ticket, responses });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  // Add response to ticket
  app.post("/api/support/:id/responses", requireAuth, async (req: any, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const currentUser = await getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const ticket = await storage.getSupportLog(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      // Users can only respond to their own tickets unless they're admin
      if (ticket.userId !== currentUser.id && !currentUser.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { message } = req.body;
      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Response message is required" });
      }

      const response = await storage.createTicketResponse({
        ticketId,
        userId: currentUser.id,
        message: message.trim(),
        isAdminResponse: currentUser.isAdmin,
      });

      // Update ticket status if it was resolved and user is adding a response
      if (ticket.status === "resolved" && !currentUser.isAdmin) {
        await storage.updateSupportLog(ticketId, { status: "in_progress" });
      }

      res.status(201).json(response);
    } catch (error) {
      console.error("Error creating ticket response:", error);
      res.status(500).json({ message: "Failed to create response" });
    }
  });

  // Delete ticket response (admin only)
  app.delete("/api/admin/support/:ticketId/responses/:responseId", requireAdmin, async (req, res) => {
    try {
      const responseId = parseInt(req.params.responseId);
      await storage.deleteTicketResponse(responseId);
      res.json({ message: "Response deleted successfully" });
    } catch (error) {
      console.error("Error deleting ticket response:", error);
      res.status(500).json({ message: "Failed to delete response" });
    }
  });

  // ========== EMAIL SENDER ROUTES ==========
  app.post("/api/admin/email/send", requireAdmin, async (req, res) => {
    try {
      const { recipients, subject, body } = req.body;

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return res.status(400).json({ message: "Recipients array is required" });
      }

      if (!subject || !body) {
        return res.status(400).json({ message: "Subject and body are required" });
      }

      const results = [];
      for (const email of recipients) {
        try {
          await sendEmail(email, subject, body);
          results.push({ email, status: "sent" });
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          results.push({ email, status: "failed", error: String(error) });
        }
      }

      res.json({ message: "Email sending completed", results });
    } catch (error) {
      console.error("Error sending emails:", error);
      res.status(500).json({ message: "Failed to send emails" });
    }
  });

  app.get("/api/admin/email/users", requireAdmin, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      const emails = users.map(u => ({ id: u.id, email: u.email, name: `${u.firstName} ${u.lastName}` }));
      res.json(emails);
    } catch (error) {
      console.error("Error fetching user emails:", error);
      res.status(500).json({ message: "Failed to fetch user emails" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

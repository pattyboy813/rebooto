import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { hashPassword, verifyPassword, requireAuth, getCurrentUser } from "./auth";
import {
  insertEmailSignupSchema,
  insertUserSchema,
  insertUserProgressSchema,
  insertFeedbackSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      req.session!.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session!.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });


  app.get("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const progressList = await storage.getUserProgressList(userId);
      res.json(progressList);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/progress", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const validatedData = insertUserProgressSchema.parse({
        ...req.body,
        userId,
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

  app.patch("/api/progress/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.session!.userId!;
      
      const existing = await storage.getUserProgress(userId, req.body.lessonId);
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
              await storage.updateUserXP(userId, lesson.xpReward);
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

  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const user = await storage.getUser(userId);
      const completedCount = await storage.getUserCompletedCount(userId);
      const progressList = await storage.getUserProgressList(userId);
      
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

  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const userId = req.session!.userId!;
      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        userId,
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

  const httpServer = createServer(app);

  return httpServer;
}

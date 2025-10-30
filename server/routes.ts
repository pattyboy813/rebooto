import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertEmailSignupSchema,
  insertUserProgressSchema,
  insertFeedbackSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
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

  app.get("/api/signups", isAuthenticated, async (_req, res) => {
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

  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/auth/me", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });


  app.get("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const progressList = await storage.getUserProgressList(user.id);
      res.json(progressList);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/progress", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.patch("/api/progress/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.post("/api/feedback", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.post("/api/courses/:id/enroll", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.get("/api/enrollments", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.post("/api/lessons/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
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

  app.get("/api/user/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const replitId = req.user.claims.sub;
      const user = await storage.getUserByReplitId(replitId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userAchievements = await storage.getUserAchievements(user.id);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

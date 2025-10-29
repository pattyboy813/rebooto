import {
  users,
  emailSignups,
  scenarios,
  userProgress,
  feedback,
  type User,
  type InsertUser,
  type EmailSignup,
  type InsertEmailSignup,
  type Scenario,
  type InsertScenario,
  type UserProgress,
  type InsertUserProgress,
  type Feedback,
  type InsertFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserXP(userId: number, xpGained: number): Promise<User>;
  
  createEmailSignup(signup: InsertEmailSignup): Promise<EmailSignup>;
  getEmailSignupByEmail(email: string): Promise<EmailSignup | undefined>;
  getEmailSignupsCount(): Promise<number>;
  
  createScenario(scenario: InsertScenario): Promise<Scenario>;
  getScenario(id: number): Promise<Scenario | undefined>;
  getAllScenarios(): Promise<Scenario[]>;
  getScenariosByCategory(category: string): Promise<Scenario[]>;
  
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgress(userId: number, scenarioId: number): Promise<UserProgress | undefined>;
  updateUserProgress(id: number, updates: Partial<InsertUserProgress>): Promise<UserProgress>;
  getUserProgressList(userId: number): Promise<UserProgress[]>;
  getUserCompletedCount(userId: number): Promise<number>;
  
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  getUserFeedback(userId: number): Promise<Feedback[]>;
}

export class DatabaseStorage implements IStorage {
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async updateUserXP(userId: number, xpGained: number): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const newXP = user.xp + xpGained;
    const newLevel = Math.floor(newXP / 500) + 1;
    
    const [updatedUser] = await db
      .update(users)
      .set({ xp: newXP, level: newLevel })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }

  async createEmailSignup(insertSignup: InsertEmailSignup): Promise<EmailSignup> {
    const existing = await this.getEmailSignupByEmail(insertSignup.email);
    if (existing) {
      throw new Error("Email already registered");
    }
    
    const [signup] = await db.insert(emailSignups).values(insertSignup).returning();
    return signup;
  }

  async getEmailSignupByEmail(email: string): Promise<EmailSignup | undefined> {
    const [signup] = await db.select().from(emailSignups).where(eq(emailSignups.email, email));
    return signup || undefined;
  }

  async getEmailSignupsCount(): Promise<number> {
    const result = await db.select().from(emailSignups);
    return result.length;
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const [scenario] = await db.insert(scenarios).values(insertScenario).returning();
    return scenario;
  }

  async getScenario(id: number): Promise<Scenario | undefined> {
    const [scenario] = await db.select().from(scenarios).where(eq(scenarios.id, id));
    return scenario || undefined;
  }

  async getAllScenarios(): Promise<Scenario[]> {
    return await db.select().from(scenarios);
  }

  async getScenariosByCategory(category: string): Promise<Scenario[]> {
    return await db.select().from(scenarios).where(eq(scenarios.category, category));
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async getUserProgress(userId: number, scenarioId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.scenarioId, scenarioId)));
    return progress || undefined;
  }

  async updateUserProgress(id: number, updates: Partial<InsertUserProgress>): Promise<UserProgress> {
    const [progress] = await db
      .update(userProgress)
      .set(updates)
      .where(eq(userProgress.id, id))
      .returning();
    return progress;
  }

  async getUserProgressList(userId: number): Promise<UserProgress[]> {
    return await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId))
      .orderBy(desc(userProgress.createdAt));
  }

  async getUserCompletedCount(userId: number): Promise<number> {
    const result = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)));
    return result.length;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackRecord] = await db.insert(feedback).values(insertFeedback).returning();
    return feedbackRecord;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return await db.select().from(feedback).where(eq(feedback.userId, userId)).orderBy(desc(feedback.createdAt));
  }
}

export const storage = new DatabaseStorage();

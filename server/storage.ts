import {
  users,
  emailSignups,
  courses,
  lessons,
  achievements,
  enrollments,
  userProgress,
  userAchievements,
  feedback,
  type User,
  type InsertUser,
  type EmailSignup,
  type InsertEmailSignup,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type Achievement,
  type InsertAchievement,
  type Enrollment,
  type InsertEnrollment,
  type UserProgress,
  type InsertUserProgress,
  type UserAchievement,
  type InsertUserAchievement,
  type Feedback,
  type InsertFeedback,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  updateUserXP(userId: number, xpGained: number): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  
  // Email signup methods
  createEmailSignup(signup: InsertEmailSignup): Promise<EmailSignup>;
  getEmailSignupByEmail(email: string): Promise<EmailSignup | undefined>;
  getAllEmailSignups(): Promise<EmailSignup[]>;
  getEmailSignupsCount(): Promise<number>;
  
  // Course methods
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getAllCourses(): Promise<Course[]>;
  getCoursesByCategory(category: string): Promise<Course[]>;
  updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  
  // Lesson methods
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getLessonsByCourse(courseId: number): Promise<Lesson[]>;
  updateLesson(id: number, updates: Partial<InsertLesson>): Promise<Lesson>;
  deleteLesson(id: number): Promise<void>;
  
  // Enrollment methods
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: number): Promise<Enrollment[]>;
  getCourseEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined>;
  completeEnrollment(id: number): Promise<Enrollment>;
  
  // Progress methods
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgress(userId: number, lessonId: number): Promise<UserProgress | undefined>;
  updateUserProgress(id: number, updates: Partial<InsertUserProgress>): Promise<UserProgress>;
  getUserProgressList(userId: number): Promise<UserProgress[]>;
  getUserCompletedCount(userId: number): Promise<number>;
  
  // Achievement methods
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAllAchievements(): Promise<Achievement[]>;
  getAchievementsByCategory(category: string): Promise<Achievement[]>;
  
  // User achievement methods
  unlockAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement>;
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  checkUserHasAchievement(userId: number, achievementId: number): Promise<boolean>;
  
  // Feedback methods
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

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
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

  async getAllEmailSignups(): Promise<EmailSignup[]> {
    return await db.select().from(emailSignups).orderBy(desc(emailSignups.createdAt));
  }

  async getEmailSignupsCount(): Promise<number> {
    const result = await db.select().from(emailSignups);
    return result.length;
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getAllCourses(): Promise<Course[]> {
    return await db.select().from(courses);
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.category, category));
  }

  async updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set(updates)
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    const course = await this.getCourse(id);
    if (!course) {
      throw new Error("Course not found");
    }
    await db.delete(courses).where(eq(courses.id, id));
  }

  async createLesson(insertLesson: InsertLesson): Promise<Lesson> {
    const [lesson] = await db.insert(lessons).values(insertLesson).returning();
    return lesson;
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
    return lesson || undefined;
  }

  async getLessonsByCourse(courseId: number): Promise<Lesson[]> {
    return await db.select().from(lessons).where(eq(lessons.courseId, courseId));
  }

  async updateLesson(id: number, updates: Partial<InsertLesson>): Promise<Lesson> {
    const [updatedLesson] = await db
      .update(lessons)
      .set(updates)
      .where(eq(lessons.id, id))
      .returning();
    return updatedLesson;
  }

  async deleteLesson(id: number): Promise<void> {
    const lesson = await this.getLesson(id);
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    await db.delete(lessons).where(eq(lessons.id, id));
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(insertEnrollment).returning();
    return enrollment;
  }

  async getUserEnrollments(userId: number): Promise<Enrollment[]> {
    return await db.select().from(enrollments).where(eq(enrollments.userId, userId));
  }

  async getCourseEnrollment(userId: number, courseId: number): Promise<Enrollment | undefined> {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)));
    return enrollment || undefined;
  }

  async completeEnrollment(id: number): Promise<Enrollment> {
    const [enrollment] = await db
      .update(enrollments)
      .set({ completedAt: new Date() })
      .where(eq(enrollments.id, id))
      .returning();
    return enrollment;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async getAllAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.category, category));
  }

  async unlockAchievement(insertUserAchievement: InsertUserAchievement): Promise<UserAchievement> {
    const [userAchievement] = await db.insert(userAchievements).values(insertUserAchievement).returning();
    return userAchievement;
  }

  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return await db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async checkUserHasAchievement(userId: number, achievementId: number): Promise<boolean> {
    const [userAchievement] = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
    return !!userAchievement;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async getUserProgress(userId: number, lessonId: number): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)));
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

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
  passwordResetTokens,
  blogPosts,
  documentationArticles,
  type User,
  type InsertUser,
  type UpsertUser,
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
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type BlogPost,
  type InsertBlogPost,
  type DocumentationArticle,
  type InsertDocumentationArticle,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt, lt } from "drizzle-orm";

export interface IStorage {
  // User methods
  createUser(user: InsertUser): Promise<User>;
  getUser(id: number): Promise<User | undefined>;
  getUserByReplitId(replitId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: number, xpGained: number): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getTotalUsersCount(): Promise<number>;
  
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
  getAllLessons(): Promise<Lesson[]>;
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
  getAllUserProgress(): Promise<UserProgress[]>;
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
  
  // Password reset token methods
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
  
  // Blog post methods
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  getAllBlogPosts(includeUnpublished?: boolean): Promise<BlogPost[]>;
  updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost>;
  publishBlogPost(id: number): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;
  
  // Documentation article methods
  createDocumentationArticle(article: InsertDocumentationArticle): Promise<DocumentationArticle>;
  getDocumentationArticle(id: number): Promise<DocumentationArticle | undefined>;
  getDocumentationArticleBySlug(slug: string): Promise<DocumentationArticle | undefined>;
  getAllDocumentationArticles(includeUnpublished?: boolean): Promise<DocumentationArticle[]>;
  getDocumentationArticlesByCategory(category: string, includeUnpublished?: boolean): Promise<DocumentationArticle[]>;
  updateDocumentationArticle(id: number, updates: Partial<InsertDocumentationArticle>): Promise<DocumentationArticle>;
  publishDocumentationArticle(id: number): Promise<DocumentationArticle>;
  deleteDocumentationArticle(id: number): Promise<void>;
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

  async getUserByReplitId(replitId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.replitId, replitId));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.replitId) {
      throw new Error("Replit ID is required for upsert");
    }

    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.replitId,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
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

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    const allUsers = await db.select().from(users).orderBy(users.createdAt);
    return allUsers;
  }

  async getTotalUsersCount(): Promise<number> {
    const result = await db.select().from(users);
    return result.length;
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

  async getAllLessons(): Promise<Lesson[]> {
    return await db.select().from(lessons);
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

  async getAllUserProgress(): Promise<UserProgress[]> {
    return await db.select().from(userProgress);
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

  async createPasswordResetToken(insertToken: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(insertToken).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.token, token), gt(passwordResetTokens.expiresAt, new Date())));
    return resetToken || undefined;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.token, token));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db.delete(passwordResetTokens).where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  async createBlogPost(insertPost: InsertBlogPost): Promise<BlogPost> {
    const [post] = await db.insert(blogPosts).values(insertPost).returning();
    return post;
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async getAllBlogPosts(includeUnpublished = false): Promise<BlogPost[]> {
    if (includeUnpublished) {
      return await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
    }
    return await db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(desc(blogPosts.publishedAt));
  }

  async updateBlogPost(id: number, updates: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async publishBlogPost(id: number): Promise<BlogPost> {
    const [post] = await db
      .update(blogPosts)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return post;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  async createDocumentationArticle(insertArticle: InsertDocumentationArticle): Promise<DocumentationArticle> {
    const [article] = await db.insert(documentationArticles).values(insertArticle).returning();
    return article;
  }

  async getDocumentationArticle(id: number): Promise<DocumentationArticle | undefined> {
    const [article] = await db.select().from(documentationArticles).where(eq(documentationArticles.id, id));
    return article || undefined;
  }

  async getDocumentationArticleBySlug(slug: string): Promise<DocumentationArticle | undefined> {
    const [article] = await db.select().from(documentationArticles).where(eq(documentationArticles.slug, slug));
    return article || undefined;
  }

  async getAllDocumentationArticles(includeUnpublished = false): Promise<DocumentationArticle[]> {
    if (includeUnpublished) {
      return await db.select().from(documentationArticles).orderBy(documentationArticles.orderIndex);
    }
    return await db.select().from(documentationArticles).where(eq(documentationArticles.status, "published")).orderBy(documentationArticles.orderIndex);
  }

  async getDocumentationArticlesByCategory(category: string, includeUnpublished = false): Promise<DocumentationArticle[]> {
    if (includeUnpublished) {
      return await db.select().from(documentationArticles).where(eq(documentationArticles.category, category)).orderBy(documentationArticles.orderIndex);
    }
    return await db
      .select()
      .from(documentationArticles)
      .where(and(eq(documentationArticles.category, category), eq(documentationArticles.status, "published")))
      .orderBy(documentationArticles.orderIndex);
  }

  async updateDocumentationArticle(id: number, updates: Partial<InsertDocumentationArticle>): Promise<DocumentationArticle> {
    const [article] = await db
      .update(documentationArticles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documentationArticles.id, id))
      .returning();
    return article;
  }

  async publishDocumentationArticle(id: number): Promise<DocumentationArticle> {
    const [article] = await db
      .update(documentationArticles)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(documentationArticles.id, id))
      .returning();
    return article;
  }

  async deleteDocumentationArticle(id: number): Promise<void> {
    await db.delete(documentationArticles).where(eq(documentationArticles.id, id));
  }
}

export const storage = new DatabaseStorage();

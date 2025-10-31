import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, serial, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => ({
    expireIndex: index("IDX_session_expire").on(table.expire),
  })
);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitId: varchar("replit_id").unique(), // Replit Auth user ID (from 'sub' claim) - nullable for local auth
  email: varchar("email").notNull().unique(), // Unique to prevent duplicate accounts
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  dateOfBirth: varchar("date_of_birth"), // Format: YYYY-MM-DD
  profileImageUrl: varchar("profile_image_url"),
  authProvider: varchar("auth_provider").notNull().default("replit"), // "replit", "local", "google", "github", "apple"
  hashedPassword: varchar("hashed_password"), // Only for local auth users
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true), // For deactivating accounts
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const emailSignups = pgTable("email_signups", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // "Hardware Headaches", "Network Nightmares", "Software Struggles"
  difficulty: text("difficulty").notNull(), // "Beginner", "Intermediate", "Advanced"
  xpTotal: integer("xp_total").notNull().default(0),
  lessonCount: integer("lesson_count").notNull().default(0), // Number of lessons in this course
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  orderIndex: integer("order_index").notNull().default(0),
  xpReward: integer("xp_reward").notNull().default(100),
  content: jsonb("content").notNull(), // AI-generated lesson content (text, scenarios, quizzes)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // "Cable Whisperer", "Router Rescuer"
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(), // Lucide icon name
  category: text("category").notNull(), // "Hardware", "Network", "Software", "General"
  xpRequired: integer("xp_required").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  uniqueUserCourse: unique().on(table.userId, table.courseId),
}));

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: integer("lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  completed: boolean("completed").notNull().default(false),
  choices: jsonb("choices").notNull().default([]),
  score: integer("score").notNull().default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserLesson: unique().on(table.userId, table.lessonId),
}));

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserAchievement: unique().on(table.userId, table.achievementId),
}));

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  rating: integer("rating"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adminInvites = pgTable("admin_invites", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  inviteCode: varchar("invite_code").notNull().unique(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  usedBy: integer("used_by").references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sentEmails = pgTable("sent_emails", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => emailTemplates.id),
  recipientEmail: varchar("recipient_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentBy: integer("sent_by").notNull().references(() => users.id),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  status: varchar("status").notNull().default("sent"), // "sent", "failed", "bounced"
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(), // Markdown or HTML content
  coverImageUrl: text("cover_image_url"),
  authorId: integer("author_id").notNull().references(() => users.id),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // "draft", "published"
  readTimeMinutes: integer("read_time_minutes").notNull().default(5),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documentationArticles = pgTable("documentation_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(), // Markdown or HTML content
  category: varchar("category", { length: 100 }).notNull(), // "Getting Started", "Courses", "Progress & Achievements", "Account & Settings"
  orderIndex: integer("order_index").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("draft"), // "draft", "published"
  authorId: integer("author_id").notNull().references(() => users.id),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  categoryIndex: index("idx_doc_category").on(table.category),
  slugIndex: index("idx_doc_slug").on(table.slug),
}));

export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  feedback: many(feedback),
  enrollments: many(enrollments),
  achievements: many(userAchievements),
  createdInvites: many(adminInvites, { relationName: "createdInvites" }),
  usedInvite: many(adminInvites, { relationName: "usedInvite" }),
  createdTemplates: many(emailTemplates),
  sentEmails: many(sentEmails),
  passwordResetTokens: many(passwordResetTokens),
  blogPosts: many(blogPosts),
  documentationArticles: many(documentationArticles),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  lessons: many(lessons),
  enrollments: many(enrollments),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  progress: many(userProgress),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, {
    fields: [enrollments.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
}));

export const adminInvitesRelations = relations(adminInvites, ({ one }) => ({
  creator: one(users, {
    fields: [adminInvites.createdBy],
    references: [users.id],
    relationName: "createdInvites",
  }),
  usedByUser: one(users, {
    fields: [adminInvites.usedBy],
    references: [users.id],
    relationName: "usedInvite",
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one, many }) => ({
  creator: one(users, {
    fields: [emailTemplates.createdBy],
    references: [users.id],
  }),
  sentEmails: many(sentEmails),
}));

export const sentEmailsRelations = relations(sentEmails, ({ one }) => ({
  template: one(emailTemplates, {
    fields: [sentEmails.templateId],
    references: [emailTemplates.id],
  }),
  sender: one(users, {
    fields: [sentEmails.sentBy],
    references: [users.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const documentationArticlesRelations = relations(documentationArticles, ({ one }) => ({
  author: one(users, {
    fields: [documentationArticles.authorId],
    references: [users.id],
  }),
}));

// Auth schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  replitId: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  authProvider: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  xp: true,
  level: true,
  isActive: true,
});

export const localSignupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date (YYYY-MM-DD)"),
});

export const localLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertEmailSignupSchema = createInsertSchema(emailSignups).pick({
  email: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertEnrollmentSchema = createInsertSchema(enrollments).omit({
  id: true,
  enrolledAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
}).extend({
  message: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
});

export const insertAdminInviteSchema = createInsertSchema(adminInvites).omit({
  id: true,
  createdAt: true,
  usedBy: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSentEmailSchema = createInsertSchema(sentEmails).omit({
  id: true,
  sentAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
});

export const insertDocumentationArticleSchema = createInsertSchema(documentationArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
}).extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.enum(["Getting Started", "Courses", "Progress & Achievements", "Account & Settings", "Admin", "Technical", "FAQ"]),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type LocalSignup = z.infer<typeof localSignupSchema>;
export type LocalLogin = z.infer<typeof localLoginSchema>;
export type User = typeof users.$inferSelect;
export type InsertEmailSignup = z.infer<typeof insertEmailSignupSchema>;
export type EmailSignup = typeof emailSignups.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertEnrollment = z.infer<typeof insertEnrollmentSchema>;
export type Enrollment = typeof enrollments.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertAdminInvite = z.infer<typeof insertAdminInviteSchema>;
export type AdminInvite = typeof adminInvites.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertSentEmail = z.infer<typeof insertSentEmailSchema>;
export type SentEmail = typeof sentEmails.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertDocumentationArticle = z.infer<typeof insertDocumentationArticleSchema>;
export type DocumentationArticle = typeof documentationArticles.$inferSelect;

// Lesson Content Block Types
export const textBlockSchema = z.object({
  type: z.literal("text"),
  content: z.string().min(1, "Text content cannot be empty"),
});

export const scenarioBlockSchema = z.object({
  type: z.literal("scenario"),
  content: z.string().min(1, "Scenario content cannot be empty"),
  title: z.string().optional(),
});

export const quizBlockSchema = z.object({
  type: z.literal("quiz"),
  question: z.string().min(10, "Question must be at least 10 characters"),
  options: z.array(z.string()).min(2).max(5, "Quiz must have 2-5 options"),
  correctAnswer: z.number().min(0, "Correct answer must be a valid option index"),
  explanation: z.string().min(10, "Explanation is required for learning"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const lessonContentBlockSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  scenarioBlockSchema,
  quizBlockSchema,
]);

export const lessonContentArraySchema = z.array(lessonContentBlockSchema).min(1, "Lesson must have at least one content block");

export type TextBlock = z.infer<typeof textBlockSchema>;
export type ScenarioBlock = z.infer<typeof scenarioBlockSchema>;
export type QuizBlock = z.infer<typeof quizBlockSchema>;
export type LessonContentBlock = z.infer<typeof lessonContentBlockSchema>;
export type LessonContentArray = z.infer<typeof lessonContentArraySchema>;

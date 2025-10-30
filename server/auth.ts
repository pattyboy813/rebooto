import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import type { Express, Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function setupSession(app: Express) {
  app.set("trust proxy", 1);
  
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  const isProduction = process.env.NODE_ENV === "production";
  
  app.use(
    session({
      secret: process.env.SESSION_SECRET!,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProduction,
        maxAge: sessionTtl,
      },
    })
  );
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function getCurrentUser(req: Request) {
  if (!req.session?.userId) {
    return null;
  }
  const user = await storage.getUser(req.session.userId);
  return user ? sanitizeUser(user) : null;
}

export function sanitizeUser(user: User) {
  const { hashedPassword, ...safeUser } = user;
  return safeUser;
}

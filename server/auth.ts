import bcrypt from "bcryptjs";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
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
  return await storage.getUser(req.session.userId);
}

// Sanitize user object to remove sensitive fields before sending to client
export function sanitizeUser(user: User) {
  const { hashedPassword, ...safeUser } = user;
  return safeUser;
}

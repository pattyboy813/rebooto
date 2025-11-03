import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import path from "path";
import { registerRoutes } from "./routes";

const app = express();

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "tryrebooto-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
}));

// Body parsing middleware
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static(path.join(process.cwd(), 'public')));

// Simple request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api")) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});

// Register API routes
(async () => {
  const server = await registerRoutes(app);

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error(err);
  });

  // Serve index.html for all non-API routes (SPA fallback)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    console.log(`🚀 Rebooto server running on http://0.0.0.0:${port}`);
  });
})();

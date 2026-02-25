import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import sdkRoutes from './routes/sdk';
import evaluateRoutes from './routes/evaluate'; // Legacy endpoint
import analyticsRoutes from './routes/analytics.routes';
import auditRoutes from './routes/auditRoutes';

const app = express();

// Middleware
// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow localhost (dev)
    if (origin.startsWith('http://localhost')) return callback(null, true);
    // Allow Vercel deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow configured frontend URL
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// Database health check (for debugging)
app.get("/health/db", async (_req, res) => {
  try {
    const prisma = (await import('./config/database')).default;
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "OK", database: "connected" });
  } catch (error: any) {
    res.status(500).json({ status: "ERROR", database: "disconnected", error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes); // Unified API routes (projects + flags)
app.use('/api/v1/sdk', sdkRoutes); // SDK specific routes
app.use('/api/evaluate', evaluateRoutes); // Legacy evaluate endpoint (backward compatibility)
app.use('/api/analytics', analyticsRoutes); // Analytics and stats
app.use('/api', auditRoutes); // Audit logs

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

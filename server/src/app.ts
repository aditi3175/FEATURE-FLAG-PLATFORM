import 'dotenv/config';
import express from "express";
import cors from "cors";
import projectRoutes from './routes/projects';
import flagRoutes from './routes/flags';
import evaluateRoutes from './routes/evaluate';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/evaluate', evaluateRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

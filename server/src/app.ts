import 'dotenv/config';
import express from "express";
import cors from "cors";
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import sdkRoutes from './routes/sdk';
import evaluateRoutes from './routes/evaluate'; // Legacy endpoint

const app = express();

// Middleware
// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    // Allow any localhost
    if (origin.startsWith('http://localhost')) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "OK" });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes); // Unified API routes (projects + flags)
app.use('/api/v1/sdk', sdkRoutes); // SDK specific routes
app.use('/api/evaluate', evaluateRoutes); // Legacy evaluate endpoint (backward compatibility)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

import 'dotenv/config';
import app from "./app";
import { shutdownEventBuffer } from './services/eventBuffer';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown handler
const shutdown = async (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server and flushing event buffer...`);

  server.close(async () => {
    console.log('HTTP server closed');
    try {
      await shutdownEventBuffer();
      console.log('Event buffer flushed successfully');
    } catch (err) {
      console.error('Error during event buffer shutdown:', err);
    } finally {
      process.exit(0);
    }
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
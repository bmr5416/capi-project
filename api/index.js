/**
 * Vercel Serverless Function Entry Point
 * Wraps Express app for serverless deployment
 */
import express from 'express';
import cors from 'cors';
import clientsRouter from '../server/routes/clients.js';
import progressRouter from '../server/routes/progress.js';
import docsRouter from '../server/routes/docs.js';
import notesRouter from '../server/routes/notes.js';
import { errorHandler } from '../server/middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors({
  origin: true, // Allow all origins in serverless (Vercel handles domain restrictions)
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/clients', clientsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/docs', docsRouter);
app.use('/api/notes', notesRouter);

// Error handling
app.use(errorHandler);

// Export for Vercel serverless
export default app;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import clientsRouter from './routes/clients.js';
import progressRouter from './routes/progress.js';
import docsRouter from './routes/docs.js';
import notesRouter from './routes/notes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL || 'http://localhost:5173'
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
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

// Start server
app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`);
});

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';

import connectDB from './config/db.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import recordRoutes from './routes/recordRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

// Connect to MongoDB Atlas.
connectDB();

const app = express();

// Trust the first proxy (required for correct client IPs / rate limiting
// when deployed behind a reverse proxy such as Nginx, Render, Railway, etc.).
app.set('trust proxy', 1);

// Security & utility middleware.
app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Apply general rate limiting to all API routes.
app.use('/api', apiLimiter);

// Health check.
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// Routes.
app.use('/api/upload', uploadRoutes);
app.use('/api/records', recordRoutes);

// 404 + global error handler.
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\x1b[36m%s\x1b[0m', `Server running on port ${PORT}`);
});

export default app;

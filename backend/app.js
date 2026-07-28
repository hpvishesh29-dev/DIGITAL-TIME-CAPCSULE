import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security & Logging Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));
app.use('/api', apiLimiter);

// Serve uploaded files statically
const uploadsPath = path.join(process.cwd(), process.cwd().endsWith('backend') ? 'uploads' : 'backend/uploads');
app.use('/uploads', express.static(uploadsPath));

// REST API Route Registrations
app.use('/api/auth', authRoutes);
app.use('/api/memories', memoryRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Chrona AI Digital Time Capsule Backend',
    timestamp: new Date().toISOString(),
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;

import cors from 'cors';
import { env } from './env';

const allowedOrigin = env.FRONTEND_URL.replace(/\/$/, '');
const vercelPreview = /^https:\/\/[\w-]+\.vercel\.app$/;

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || origin.replace(/\/$/, '') === allowedOrigin || vercelPreview.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
});

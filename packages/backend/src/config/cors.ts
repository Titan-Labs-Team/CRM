import cors from 'cors';
import { env } from './env';

const allowedOrigin = env.FRONTEND_URL.replace(/\/$/, '');

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || origin.replace(/\/$/, '') === allowedOrigin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
});

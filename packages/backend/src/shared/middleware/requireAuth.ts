import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';
import { env } from '../../config/env';

const secret = new TextEncoder().encode(env.JWT_SECRET);

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const { payload } = await jwtVerify(token, secret);
    req.user = {
      id: payload.sub as string,
      tenantId: payload.tenantId as string,
      role: payload.role as 'admin' | 'manager' | 'seller',
      email: payload.email as string,
    };
    req.tenantId = payload.tenantId as string;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

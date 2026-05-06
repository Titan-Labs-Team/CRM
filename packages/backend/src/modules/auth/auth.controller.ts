import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { registerSchema, loginSchema, refreshSchema, updateMeSchema } from './auth.schema';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await AuthService.register(input);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await AuthService.login(input);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await AuthService.refresh(refreshToken);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    await AuthService.logout(refreshToken);
    res.json({ data: { message: 'Logged out' } });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await AuthService.getMe(req.user!.id);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateMeSchema.parse(req.body);
    const user = await AuthService.updateMe(req.user!.id, input);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from 'express';
import * as UsersService from './users.service';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await UsersService.listUsers(req.user!.tenantId, req.query as Record<string, unknown>);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const input = UsersService.inviteUserSchema.parse(req.body);
    const user = await UsersService.inviteUser(req.user!.tenantId, input);
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const input = UsersService.updateUserSchema.parse(req.body);
    const user = await UsersService.updateUser(req.user!.tenantId, req.params.id, input);
    res.json({ data: user });
  } catch (err) {
    next(err);
  }
}

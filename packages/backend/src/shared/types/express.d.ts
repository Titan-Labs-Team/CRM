import 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: string;
      tenantId: string;
      role: 'admin' | 'manager' | 'seller';
      email: string;
    };
    tenantId?: string;
  }
}

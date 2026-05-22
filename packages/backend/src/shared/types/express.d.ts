declare global {
  namespace Express {
    interface User {
      id: string;
      tenantId: string;
      role: 'admin' | 'manager' | 'seller';
      email: string;
    }
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    tenantId?: string;
  }
}

export {};

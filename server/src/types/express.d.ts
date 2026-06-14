// Adds the authenticated user id to Express's Request object.
// Set by the requireAuth middleware after verifying the JWT.
import 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export {};

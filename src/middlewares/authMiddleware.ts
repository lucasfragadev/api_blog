import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Estendemos a interface Request do Express para adicionar nossa propriedade 'user',
// que conterá o payload decodificado do token.

export interface AuthRequest extends Request {
  user?: { id: string; name: string }
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied. Token not provided.' })
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format error.' })
  }

  const token = parts[1];

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('The JWT secret key was not configured in the environment.');
    }

    const decoded = jwt.verify(token, secret);

    req.user = decoded as { id: string; name: string };

    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' })
  }
};
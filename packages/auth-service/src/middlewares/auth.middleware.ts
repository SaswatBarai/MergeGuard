import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '@mergeguard/db';
import { config } from '../config/index.js';
import { AuthRequest } from '../controllers/auth.controller.js';

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  // Try JWT first
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: number; role: string };
    req.user = decoded;
    return next();
  } catch (_) {}

  // Fall back to API key validation
  if (token.startsWith('mg_')) {
    try {
      const keys = await prisma.apiKey.findMany({
        include: { user: { select: { id: true, globalRole: true } } },
      });
      for (const apiKey of keys) {
        const match = await bcrypt.compare(token, apiKey.keyHash);
        if (match) {
          req.user = { userId: apiKey.user.id, role: apiKey.user.globalRole };
          return next();
        }
      }
    } catch (_) {}
  }

  return res.status(401).json({ error: 'Invalid token' });
};

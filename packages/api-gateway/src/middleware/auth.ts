import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { config } from '../config/index.js';

export const verifyJwt = async (req: Request, res: Response, next: NextFunction) => {
  // Accept token from Authorization header OR ?token= query param (for browser EventSource)
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null;
  const authHeader = req.headers.authorization;

  if (!authHeader && !queryToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = queryToken ?? authHeader!.split(' ')[1];

  // 1. Try JWT first (web dashboard)
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    (req as any).user = decoded;
    return next();
  } catch (_) {
    // Not a valid JWT — fall through to API key check
  }

  // 2. Try API key (CLI) — delegate to auth-service
  try {
    const response = await axios.get(`${config.services.auth}/auth/validate-key`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    (req as any).user = { userId: response.data.id, role: response.data.globalRole };
    return next();
  } catch (_) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token or API key' });
  }
};

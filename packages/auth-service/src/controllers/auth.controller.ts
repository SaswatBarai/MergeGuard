import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { AuthService } from '../services/auth.service.js';
import { prisma } from '@mergeguard/db';
import { config } from '../config/index.js';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export class AuthController {
  static async githubLogin(req: Request, res: Response) {
    const githubUrl = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&redirect_uri=${config.github.redirectUri}&scope=user:email,repo`;
    res.redirect(githubUrl);
  }

  static async githubCallback(req: Request, res: Response) {
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    try {
      const accessToken = await AuthService.getGitHubAccessToken(code as string);
      const githubUser = await AuthService.getGitHubUser(accessToken);
      const emails = await AuthService.getGitHubUserEmails(accessToken);
      const primaryEmail = emails.find((e: any) => e.primary)?.email || githubUser.email;

      const user = await prisma.user.upsert({
        where: { githubId: githubUser.id.toString() },
        update: {
          accessToken: accessToken,
          avatarUrl: githubUser.avatar_url,
          name: githubUser.name || githubUser.login,
        },
        create: {
          githubId: githubUser.id.toString(),
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          avatarUrl: githubUser.avatar_url,
          accessToken: accessToken,
          globalRole: 'USER',
        },
      });

      // Background sync
      AuthService.syncUserRepositories(user.id, accessToken);

      const token = AuthService.generateJWT(user.id, user.globalRole);
      res.redirect(`${config.frontendUrl}/auth-callback?token=${token}`);
    } catch (error) {
      console.error('OAuth Error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  }

  static async createApiKey(req: AuthRequest, res: Response) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Key name is required' });

    try {
      const key = await AuthService.createApiKey(req.user!.userId, name);
      res.json({ key, name });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate API key' });
    }
  }

  static async listApiKeys(req: AuthRequest, res: Response) {
    try {
      const keys = await prisma.apiKey.findMany({
        where: { userId: req.user!.userId },
        select: { id: true, name: true, createdAt: true, lastUsedAt: true },
      });
      res.json(keys);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch API keys' });
    }
  }

  static async revokeApiKey(req: AuthRequest, res: Response) {
    const { id } = req.params;
    try {
      await prisma.apiKey.delete({
        where: { id: parseInt(id), userId: req.user!.userId },
      });
      res.json({ message: 'API key revoked' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to revoke API key' });
    }
  }

  static async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, name: true, email: true, avatarUrl: true, globalRole: true, accessToken: true },
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }

  static async validateApiKey(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const rawKey = authHeader.split(' ')[1];
    if (!rawKey.startsWith('mg_')) {
      return res.status(401).json({ error: 'Invalid key format' });
    }
    try {
      const keys = await prisma.apiKey.findMany({
        include: { user: { select: { id: true, globalRole: true } } },
      });
      for (const apiKey of keys) {
        const match = await bcrypt.compare(rawKey, apiKey.keyHash);
        if (match) {
          await prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() },
          });
          return res.json({ id: apiKey.user.id, globalRole: apiKey.user.globalRole });
        }
      }
      return res.status(401).json({ error: 'Invalid API key' });
    } catch (error) {
      res.status(500).json({ error: 'Validation failed' });
    }
  }

  static async getMyRepositories(req: AuthRequest, res: Response) {
    try {
      const accesses = await prisma.repositoryAccess.findMany({
        where: { userId: req.user!.userId },
        include: { repository: true },
        orderBy: { repository: { fullName: 'asc' } },
      });
      const repos = accesses.map((a) => ({
        id: a.repository.id,
        fullName: a.repository.fullName,
        githubRepoId: a.repository.githubRepoId,
        role: a.role,
      }));
      res.json(repos);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch repositories' });
    }
  }
}

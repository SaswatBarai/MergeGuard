import axios from 'axios';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@mergeguard/db';
import { config } from '../config/index.js';

export class AuthService {
  static async getGitHubAccessToken(code: string) {
    const response = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code,
        redirect_uri: config.github.redirectUri,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.data.access_token) {
      throw new Error('Failed to obtain access token');
    }

    return response.data.access_token;
  }

  static async getGitHubUser(accessToken: string) {
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` },
    });
    return response.data;
  }

  static async getGitHubUserEmails(accessToken: string) {
    const response = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `token ${accessToken}` },
    });
    return response.data;
  }

  static async syncUserRepositories(userId: number, accessToken: string) {
    try {
      const response = await axios.get('https://api.github.com/user/repos', {
        headers: { Authorization: `token ${accessToken}` },
        params: { per_page: 100, sort: 'updated' },
      });

      const githubRepos = response.data;

      for (const repo of githubRepos) {
        const dbRepo = await prisma.repository.upsert({
          where: { githubRepoId: repo.id.toString() },
          update: { fullName: repo.full_name },
          create: {
            githubRepoId: repo.id.toString(),
            fullName: repo.full_name,
          },
        });

        const role = repo.permissions?.admin ? 'MAINTAINER' : 'DEVELOPER';
        
        await prisma.repositoryAccess.upsert({
          where: {
            userId_repositoryId: {
              userId,
              repositoryId: dbRepo.id,
            },
          },
          update: { role },
          create: {
            userId,
            repositoryId: dbRepo.id,
            role,
          },
        });
      }
    } catch (error) {
      console.error('Repo sync failed:', error);
    }
  }

  static generateJWT(userId: number, role: string) {
    return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: '7d' });
  }

  static async createApiKey(userId: number, name: string) {
    const rawKey = `mg_${crypto.randomBytes(24).toString('hex')}`;
    const keyHash = await bcrypt.hash(rawKey, 10);

    await prisma.apiKey.create({
      data: {
        userId,
        name,
        keyHash,
      },
    });

    return rawKey;
  }
}

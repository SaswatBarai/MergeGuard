import axios from 'axios';
import { EventSource } from 'eventsource';
import { getApiKey, getApiUrl } from './config.js';

const client = () => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Not authenticated. Run `mergeguard auth login` first.');
  return axios.create({
    baseURL: getApiUrl(),
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  });
};

export const getMe = async () => {
  const { data } = await client().get('/auth/me');
  return data as { id: number; name: string; email: string; avatarUrl: string | null };
};

export const getMyRepositories = async () => {
  const { data } = await client().get('/auth/me/repositories');
  return data as Array<{ id: number; fullName: string; role: string }>;
};

export const createReview = async (payload: {
  prNumber: number;
  repositoryId: number;
  fullRepoName: string;
  githubToken: string;
  requesterId: number;
}) => {
  const { data } = await client().post('/reviews', payload);
  return data as { id: number };
};

export const getReviewStream = (jobId: number) => {
  const apiKey = getApiKey();
  const url = `${getApiUrl()}/reviews/${jobId}/stream`;
  const fetchWithAuth = (input: string | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      headers: { ...(init?.headers as Record<string, string>), Authorization: `Bearer ${apiKey}` },
    });
  return new EventSource(url, { fetch: fetchWithAuth } as any);
};

export const submitFeedback = async (jobId: number, feedback: string) => {
  const { data } = await client().post(`/reviews/${jobId}/feedback`, { feedback });
  return data;
};

export const getReview = async (jobId: number) => {
  const { data } = await client().get(`/reviews/${jobId}`);
  return data as { id: number; finalReport?: { synthesizedSummary: string } | null };
};

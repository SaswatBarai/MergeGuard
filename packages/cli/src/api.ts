import axios from 'axios';
import { EventSource } from 'eventsource';
import { getApiKey, getApiUrl } from './config.js';

const getHeaders = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing. Please run `mergeguard auth login` first.');
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
};

export const createReview = async (data: {
  prNumber: number;
  repositoryId: number;
  fullRepoName: string;
  githubToken: string;
  requesterId: number;
}) => {
  const response = await axios.post(`${getApiUrl()}/reviews`, data, {
    headers: getHeaders(),
  });
  return response.data;
};

export const getReviewStream = (jobId: number) => {
  const url = `${getApiUrl()}/reviews/${jobId}/stream`;
  const authHeader = getHeaders().Authorization;

  // eventsource v4 uses native fetch — pass a custom fetch to inject auth header
  const fetchWithAuth = (input: string | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      headers: { ...(init?.headers as Record<string, string>), Authorization: authHeader },
    });

  return new EventSource(url, { fetch: fetchWithAuth } as any);
};

export const submitFeedback = async (jobId: number, feedback: string) => {
  const response = await axios.post(
    `${getApiUrl()}/reviews/${jobId}/feedback`,
    { feedback },
    { headers: getHeaders() }
  );
  return response.data;
};

export const getReview = async (jobId: number) => {
  const response = await axios.get(`${getApiUrl()}/reviews/${jobId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

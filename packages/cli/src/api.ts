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
  const response = await axios.post(`${getApiUrl()}/api/reviews`, data, {
    headers: getHeaders(),
  });
  return response.data;
};

export const getReviewStream = (jobId: number) => {
  const url = `${getApiUrl()}/api/reviews/${jobId}/stream`;
  const headers = getHeaders();
  
  return new EventSource(url, { headers } as any);
};

export const submitFeedback = async (jobId: number, feedback: string) => {
  const response = await axios.post(
    `${getApiUrl()}/api/reviews/${jobId}/feedback`,
    { feedback },
    { headers: getHeaders() }
  );
  return response.data;
};

export const getReview = async (jobId: number) => {
  const response = await axios.get(`${getApiUrl()}/api/reviews/${jobId}`, {
    headers: getHeaders(),
  });
  return response.data;
};

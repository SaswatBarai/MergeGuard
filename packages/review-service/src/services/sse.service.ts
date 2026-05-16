import { Response } from 'express';

interface SseClient {
  id: number;
  res: Response;
}

class SseService {
  private clients: SseClient[] = [];

  addClient(jobId: number, res: Response) {
    const client = { id: jobId, res };
    this.clients.push(client);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // res.flushHeaders(); // Not always necessary depending on middleware

    return client;
  }

  removeClient(client: SseClient) {
    this.clients = this.clients.filter(c => c !== client);
  }

  broadcast(jobId: number, data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    this.clients
      .filter(client => client.id === jobId)
      .forEach(client => client.res.write(message));
  }
}

export const sseService = new SseService();

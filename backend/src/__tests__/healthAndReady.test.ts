import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('API Gateway Liveness & Readiness Endpoints', () => {
  const app = createApp();

  it('GET /api/v1/health returns HTTP 200 and liveness metadata without exposing database internals', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.service).toBe('Digital Wellness Hub API');
    expect(res.body.data.version).toBe('0.1.0');
    expect(res.body.data.database).toBeUndefined(); // Liveness must not expose DB internals
  });

  it('GET /api/v1/ready returns HTTP 200 when PostgreSQL is available and ready', async () => {
    const res = await request(app).get('/api/v1/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('READY');
    expect(res.body.data.database).toBe('CONNECTED');
    expect(res.body.data.timestamp).toBeDefined();
  });
});

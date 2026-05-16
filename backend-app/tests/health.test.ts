import { describe, it, expect } from 'bun:test';
import axios from 'axios';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000/api/v1';

describe('Health Check', () => {
  it('should return 200 for basic health check', async () => {
    const response = await axios.get(`${BASE_URL}/health`);
    expect(response.status).toBe(200);
    expect(response.data.data.status).toBe('ok');
  });

  it('should return 200 for detailed readiness check', async () => {
    const response = await axios.get(`${BASE_URL}/health/ready`);
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
});

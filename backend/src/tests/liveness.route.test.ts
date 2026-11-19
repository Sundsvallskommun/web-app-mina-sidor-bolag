import request from 'supertest';
import App from '@/app';
import { IndexController } from '@controllers/index.controller';
import { livenessHandler } from '@/routes/liveness.route';
import type { Request, Response } from 'express';

describe('livenessHandler', () => {
  it('responds 200 without consulting any dependency', () => {
    const json = jest.fn();
    const status = jest.fn();
    const res = { json, status } as unknown as Response;
    status.mockReturnValue(res);

    livenessHandler({} as Request, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ status: 'OK' });
  });
});

describe('GET /health', () => {
  it('is served outside BASE_URL_PREFIX without a session', async () => {
    const app = new App([IndexController]);

    const response = await request(app.getServer()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'OK' });
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});

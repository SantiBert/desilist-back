import request from 'supertest';
import App from '@/app';
import HealthRoute from '@routes/health.route';
import {STATUS_CODES} from '@/constants';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Health controller', () => {
  describe('[GET] /health', () => {
    describe('retrieve app uptime', () => {
      let response: request.Response;
      beforeAll(async () => {
        const healthRoute = new HealthRoute();
        const app = new App([healthRoute]);
        response = await request(app.getServer())
          .get(`${healthRoute.path}health`)
          .set({'x-api-version': '1.0.0'});
      });
      test('should return 200 status', () => {
        expect(response.status).toBe(STATUS_CODES.OK);
      });
      test('should return app uptime', () => {
        expect(response.body).toStrictEqual(response.body);
      });
    });
  });
});

import config from '../../config';
import {STATUS_CODES} from '../../constants';
import HealthController from '../../controllers/health.controller';
import interceptors from '../interceptors';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Health', () => {
  let req: any, res: any, next: any;
  const health = new HealthController();
  describe('health Controller', () => {
    let reqBody: any;
    describe('Health check OK', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        await health.health(req, res, next);
      });
      test('should have the Create userData', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
      });
    });

    describe('Should throw error and call next', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.body = reqBody;

        res.json = jest.fn().mockImplementation(() => {
          throw new Error();
        });
        await health.health(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error());
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });
});

import config from '../../config';
import {HttpException} from '../../exceptions/HttpException';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Exception Testing', () => {
  let exception: any;
  describe('Create Exception', () => {
    describe('Create new exception', () => {
      beforeAll(async () => {
        exception = new HttpException('bad_request', 400, 'User bad input');
      });
      test('should return a new Error', () => {
        expect(exception).toEqual(new Error('User bad input'));
        expect(exception.internalCode).toBe('bad_request');
        expect(exception.status).toBe(400);
        expect(exception.message).toBe('User bad input');
      });
    });
  });
});

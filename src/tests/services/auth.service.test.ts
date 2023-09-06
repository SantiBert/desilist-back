import config from '../../config';
import {AuthService} from '../../services';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Auth Service Testing', () => {
  let ret: any;
  const auth = new AuthService();
  describe('Hash Password', () => {
    describe('Hash Password OK', () => {
      beforeAll(async () => {
        ret = await auth.hashPassword('password');
      });
      test('should return hashed password', () => {
        expect(ret).toBe(ret);
      });
    });
  });

  describe('Compare Hash', () => {
    describe('Compare Hash OK', () => {
      beforeAll(async () => {
        ret = await auth.compareHash(
          'password',
          await auth.hashPassword('password')
        );
      });
      test('should return true', () => {
        expect(ret).toBe(true);
      });
    });

    describe('Compare Hash not OK', () => {
      beforeAll(async () => {
        ret = await auth.compareHash(
          'password',
          await auth.hashPassword('bad')
        );
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });
  });

  describe('Create cookie', () => {
    describe('Create cookie OK', () => {
      const token = 'eyJlbWFpbC==';
      beforeAll(async () => {
        ret = await auth.createCookie({token, expiresIn: 0});
      });
      test('should return true', () => {
        expect(ret).toBe(`x-refresh-token=${token}; Secure; HttpOnly;`);
      });
    });
  });

  describe('Create JWT', () => {
    describe('Create JWT OK', () => {
      const token = 'eyJlbWFpbC==';
      beforeAll(async () => {
        ret = await auth.createJWT({token, expiresIn: 0});
      });
      test('should return true', () => {
        expect(ret).toBe(token);
      });
    });
  });
});

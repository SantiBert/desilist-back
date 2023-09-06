import config from '../../config';
import {SessionService} from '../../services';
import {getISONow} from '../../utils/time';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Session Service Testing', () => {
  let ret: any;
  const sessionService = new SessionService();

  describe('Find by token', () => {
    describe('find session by token', () => {
      const readSession = {
        id: '12345',
        user_id: '12345',
        created_at: ''
      };
      beforeAll(async () => {
        sessionService.session.findUnique = jest
          .fn()
          .mockResolvedValue(readSession);
        ret = await sessionService.findByToken('eyasddsf==');
      });
      test('should return a session', () => {
        expect(ret).toBe(readSession);
      });
    });
  });

  describe('Find by id', () => {
    describe('find session by id', () => {
      const readSession = {
        token: 'eyasddsf==',
        user_id: '12345',
        created_at: ''
      };
      beforeAll(async () => {
        sessionService.session.findUnique = jest
          .fn()
          .mockResolvedValue(readSession);
        ret = await sessionService.findById(1);
      });
      test('should return a session', () => {
        expect(ret).toBe(readSession);
      });
    });
  });

  describe('Create session', () => {
    describe('create new session', () => {
      const createdSession = {
        id: '12345'
      };
      beforeAll(async () => {
        sessionService.session.create = jest
          .fn()
          .mockResolvedValue(createdSession);
        ret = await sessionService.create('12345', 'eyasddsf==');
      });
      test('should create a session', () => {
        expect(ret).toBe(createdSession);
      });
    });
  });

  describe('Update session', () => {
    describe('update session by id', () => {
      const updatedSession = {
        token: 'eyasddsf==',
        user_id: '12345'
      };
      beforeAll(async () => {
        sessionService.session.update = jest
          .fn()
          .mockResolvedValue(updatedSession);
        ret = await sessionService.updateById(1, {token: 'eyasddsf=='});
      });
      test('should update the session', () => {
        expect(ret).toBe(updatedSession);
      });
    });
  });

  describe('Delete session', () => {
    describe('delete many by user id', () => {
      beforeAll(async () => {
        sessionService.session.deleteMany = jest.fn().mockResolvedValue(null);
      });
      test('should delete all user sessions', () => {
        expect(
          async (): Promise<void> =>
            await sessionService.deleteManyByUserId('12345')
        ).not.toThrow();
      });
    });

    describe('delete by user id and token', () => {
      beforeAll(async () => {
        sessionService.session.deleteMany = jest.fn().mockResolvedValue(null);
      });
      test('should delete the user session', () => {
        expect(
          async (): Promise<void> =>
            await sessionService.deleteByUserIdAndToken('12345', 'eyasddsf==')
        ).not.toThrow();
      });
    });
  });

  describe('Check if the otp is valid', () => {
    describe('Valid token', () => {
      beforeAll(async () => {
        sessionService.findByToken = jest
          .fn()
          .mockResolvedValue({user_id: '12345', created_at: getISONow()});
        ret = await sessionService.isTokenValid('eyasddsf==');
      });
      test('should return true', () => {
        expect(ret).toBe(true);
      });
    });

    describe('Token not found', () => {
      beforeAll(async () => {
        sessionService.findByToken = jest.fn().mockResolvedValue(null);
        ret = await sessionService.isTokenValid('eyasddsf==');
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });

    // fix: token expired test
    describe('Token expired', () => {
      beforeAll(async () => {
        sessionService.findByToken = jest.fn().mockResolvedValue(null);
        ret = await sessionService.isTokenValid('eyasddsf==');
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });
  });
});

import config from '../../config';
import {PasswordService} from '../../services';
// fix: password service should have a hash function
import {hash} from 'bcrypt';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Password Service Testing', () => {
  let ret: any;
  const passwordService = new PasswordService();
  describe('Find by user id', () => {
    describe('find password', () => {
      const readPassword = {hash: 'qwerty1234', work_factor: null};
      beforeAll(async () => {
        passwordService.password.findUnique = jest
          .fn()
          .mockResolvedValue(readPassword);
        ret = await passwordService.findByUserId('12345');
      });
      test('should return user password', () => {
        expect(ret).toBe(readPassword);
      });
    });
  });

  describe('Create Password', () => {
    describe('create password', () => {
      const createdPassword = {id: '12345'};
      beforeAll(async () => {
        passwordService.password.create = jest
          .fn()
          .mockResolvedValue(createdPassword);
        ret = await passwordService.create({
          user_id: '12345',
          hash: 'qwerty1234'
        } as any);
      });
      test('should create the user password', () => {
        expect(ret).toBe(createdPassword);
      });
    });
  });

  describe('Update Password', () => {
    describe('update password', () => {
      const updatedPassword = {hash: 'qwerty1234', work_factor: null};
      beforeAll(async () => {
        passwordService.password.update = jest
          .fn()
          .mockResolvedValue(updatedPassword);
        ret = await passwordService.updateByUserId('12345', {
          hash: 'qwerty1234'
        });
      });
      test('should update the user password', () => {
        expect(ret).toBe(updatedPassword);
      });
    });
  });

  describe('isPasswordMatching', () => {
    describe('password match', () => {
      beforeAll(async () => {
        passwordService.findByUserId = jest.fn().mockResolvedValue({
          hash: await hash('qwerty1234', 10),
          work_factor: null
        });
        ret = await passwordService.isPasswordMatching(
          {id: '12345'},
          'qwerty1234'
        );
      });
      test('should match the password OK', () => {
        expect(ret).toBe(true);
      });
    });

    describe('password do not exists', () => {
      beforeAll(async () => {
        passwordService.findByUserId = jest.fn().mockResolvedValue(null);
        ret = await passwordService.isPasswordMatching('12345', 'qwerty1234');
      });
      test('should not match the password', () => {
        expect(ret).toBe(false);
      });
    });

    describe('password do not match', () => {
      beforeAll(async () => {
        passwordService.findByUserId = jest.fn().mockResolvedValue({
          hash: await hash('qwerty1234', 10),
          work_factor: null
        });
        ret = await passwordService.isPasswordMatching('12345', 'qwerty');
      });
      test('should not match the password', () => {
        expect(ret).toBe(false);
      });
    });

    describe('user do not exists', () => {
      beforeAll(async () => {
        passwordService.findByUserId = jest.fn().mockResolvedValue(null);
        ret = await passwordService.isPasswordMatching(null, 'qwerty1234');
      });
      test('should not match the password', () => {
        expect(ret).toBe(false);
      });
    });
  });
});

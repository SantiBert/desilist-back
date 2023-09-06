import config from '../../config';
import {UserService} from '../../services';
import {UserStatus} from '../../constants';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Users Service Testing', () => {
  let ret: any;
  const userService = new UserService();

  describe('Find User', () => {
    describe('Read user by id', () => {
      const readUser = {
        email: 'bart@gmail.com',
        phone_number: '+5491122334455',
        status_id: UserStatus.ACTIVE
      };
      beforeAll(async () => {
        userService.user.findFirst = jest.fn().mockResolvedValue(readUser);
        ret = await userService.findById('12345');
      });
      test('should return a user', () => {
        expect(ret).toBe(readUser);
      });
    });

    describe('Read user by email', () => {
      const readUser = {
        id: '12345',
        phone_number: '+5491122334455',
        status_id: UserStatus.ACTIVE
      };
      beforeAll(async () => {
        userService.user.findUnique = jest.fn().mockResolvedValue(readUser);
        ret = await userService.findByEmail('bart@gmail.com');
      });
      test('should return a user', () => {
        expect(ret).toBe(readUser);
      });
    });

    describe('Read current user', () => {
      const readUser = {
        email: 'bart@gmail.com',
        phone_number: '+5491122334455',
        status_id: UserStatus.ACTIVE
      };
      beforeAll(async () => {
        userService.user.findUnique = jest.fn().mockResolvedValue(readUser);
        ret = await userService.findCurrent('bart@gmail.com');
      });
      test('should return a user', () => {
        expect(ret).toBe(readUser);
      });
    });
  });

  describe('Create User', () => {
    describe('create a new user', () => {
      const createdUser = {
        id: '12345',
        email: 'bart@gmail.com'
      };
      beforeAll(async () => {
        userService.user.create = jest.fn().mockResolvedValue(createdUser);
        ret = await userService.create({} as any);
      });
      test('should return the created user', () => {
        expect(ret).toBe(createdUser);
      });
    });
  });

  describe('Update User by id', () => {
    describe('Update user', () => {
      const updatedUser = {
        id: '12345'
      };
      beforeAll(async () => {
        userService.user.update = jest.fn().mockResolvedValue(updatedUser);
        ret = await userService.updateById('12345', {});
      });
      test('should return the updated user id', () => {
        expect(ret).toBe(updatedUser);
      });
    });
  });

  describe('Delete User by id', () => {
    describe('delete the user', () => {
      beforeAll(async () => {
        userService.user.delete = jest.fn().mockResolvedValue(null);
      });
      test('should delete the user', () => {
        expect(
          async (): Promise<void> => await userService.deleteById('12345')
        ).not.toThrow();
      });
    });
  });

  describe('isUserDeleted', () => {
    describe('user deleted', () => {
      const readUser = {
        deleted_at: '2022-04-22 16:39:38.882'
      };
      beforeAll(async () => {
        userService.user.findUnique = jest.fn().mockResolvedValue(readUser);
        ret = await userService.isUserDeleted({} as any);
      });
      test('should delete the user', () => {
        expect(ret).toBe(true);
      });
    });

    describe('user not deleted', () => {
      const readUser = {
        deleted_at: null
      };
      beforeAll(async () => {
        userService.user.findUnique = jest.fn().mockResolvedValue(readUser);
        ret = await userService.isUserDeleted({} as any);
      });
      test('should delete the user', () => {
        expect(ret).toBe(false);
      });
    });
  });
});

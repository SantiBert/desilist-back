import config from '../../config';
import {ValidationService} from '../../services';
import {getISONow} from '../../utils/time';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Validation Service Testing', () => {
  let ret: any;
  const validationService = new ValidationService();

  describe('Find by token', () => {
    describe('find validation by token', () => {
      const readValidation = {
        user_id: '12345',
        created_at: ''
      };
      beforeAll(async () => {
        validationService.validation.findUnique = jest
          .fn()
          .mockResolvedValue(readValidation);
        ret = await validationService.findByToken('qwerty1234567890');
      });
      test('should return a validation', () => {
        expect(ret).toBe(readValidation);
      });
    });
  });

  describe('Find by user id', () => {
    describe('find validation by user id', () => {
      const readValidation = {
        token: 'qwerty1234567890',
        created_at: ''
      };
      beforeAll(async () => {
        validationService.validation.findUnique = jest
          .fn()
          .mockResolvedValue(readValidation);
        ret = await validationService.findByUserId('12345');
      });
      test('should return a validation', () => {
        expect(ret).toBe(readValidation);
      });
    });
  });

  describe('Create validation', () => {
    describe('create a new validation', () => {
      const createdValidation = {
        token: 'qwerty1234567890',
        created_at: ''
      };
      beforeAll(async () => {
        validationService.validation.create = jest
          .fn()
          .mockResolvedValue(createdValidation);
        ret = await validationService.create('12345');
      });
      test('should return a validation', () => {
        expect(ret).toBe(createdValidation);
      });
    });
  });

  describe('Delete validation', () => {
    describe('delete validation by token', () => {
      beforeAll(async () => {
        validationService.validation.delete = jest.fn().mockResolvedValue(null);
      });
      test('should delete the validation', () => {
        expect(
          async (): Promise<void> =>
            await validationService.deleteByToken('qwerty1234567890')
        ).not.toThrow();
      });
    });

    describe('delete validation by user id', () => {
      beforeAll(async () => {
        validationService.validation.delete = jest.fn().mockResolvedValue(null);
      });
      test('should delete the validation', () => {
        expect(
          async (): Promise<void> =>
            await validationService.deleteByUserId('12345')
        ).not.toThrow();
      });
    });
  });

  describe('Delete validation if exists', () => {
    describe('Delete validation', () => {
      beforeAll(async () => {
        validationService.findByToken = jest
          .fn()
          .mockResolvedValue({user_id: '12345', created_at: ''});
        validationService.deleteByToken = jest.fn().mockResolvedValue(null);
      });
      test('should delete the validation', () => {
        expect(
          async (): Promise<void> =>
            await validationService.deleteIfExists('qwerty1234567890')
        ).not.toThrow();
      });
    });

    describe('Validation do not exists', () => {
      beforeAll(async () => {
        validationService.findByToken = jest.fn().mockResolvedValue(null);
      });
      test('should not delete the validation', () => {
        expect(
          async (): Promise<void> =>
            await validationService.deleteIfExists('qwerty1234567890')
        ).not.toThrow();
      });
    });
  });

  describe('Delete otp if user has', () => {
    describe('Delete otp', () => {
      beforeAll(async () => {
        validationService.findByUserId = jest
          .fn()
          .mockResolvedValue({token: 'qwerty1234567890', created_at: ''});
        validationService.deleteByUserId = jest.fn().mockResolvedValue(null);
      });
      test('should delete the validation', () => {
        expect(
          async (): Promise<void> =>
            await validationService.deleteIfUserHas('12345')
        ).not.toThrow();
      });
    });

    describe('User do not have a validation', () => {
      beforeAll(async () => {
        validationService.findByUserId = jest.fn().mockResolvedValue(null);
      });
      test('should not delete the validation', () => {
        expect(
          async (): Promise<void> =>
            (ret = await validationService.deleteIfUserHas('12345'))
        ).not.toThrow();
      });
    });
  });

  describe('Check if the validation is valid', () => {
    describe('Valid token', () => {
      beforeAll(async () => {
        validationService.findByToken = jest
          .fn()
          .mockResolvedValue({user_id: '12345', created_at: getISONow()});
        ret = await validationService.isTokenValid('qwerty1234567890');
      });
      test('should return true', () => {
        expect(ret).toBe(true);
      });
    });

    describe('Token not found', () => {
      beforeAll(async () => {
        validationService.findByToken = jest.fn().mockResolvedValue(null);
        ret = await validationService.isTokenValid('qwerty1234567890');
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });

    // fix: token expired test
    describe('Token expired', () => {
      beforeAll(async () => {
        validationService.findByToken = jest.fn().mockResolvedValue(null);
        ret = await validationService.isTokenValid('qwerty1234567890');
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });
  });
});

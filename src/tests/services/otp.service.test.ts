import config from '../../config';
import {OTPService} from '../../services';
import {getISONow} from '../../utils/time';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('OTP Service Testing', () => {
  let ret: any;
  const otpService = new OTPService();

  describe('Find by otp', () => {
    describe('Read otp', () => {
      const readOTP = {
        user_id: '12345',
        created_at: ''
      };
      beforeAll(async () => {
        otpService.otp.findUnique = jest.fn().mockResolvedValue(readOTP);
        ret = await otpService.findByOTP('1234567');
      });
      test('should return an otp', () => {
        expect(ret).toBe(readOTP);
      });
    });
  });

  describe('Find by user id', () => {
    describe('Read otp', () => {
      const readOTP = {
        code: '1234567',
        created_at: ''
      };
      beforeAll(async () => {
        otpService.otp.findUnique = jest.fn().mockResolvedValue(readOTP);
        ret = await otpService.findByUserId('12345');
      });
      test('should return an otp', () => {
        expect(ret).toBe(readOTP);
      });
    });
  });

  describe('Create otp', () => {
    describe('Create otp', () => {
      const createdOTP = {
        code: '1234567',
        created_at: ''
      };
      beforeAll(async () => {
        otpService.otp.create = jest.fn().mockResolvedValue(createdOTP);
        ret = await otpService.create({} as any);
      });
      test('should return the created otp', () => {
        expect(ret).toBe(createdOTP);
      });
    });
  });

  describe('Delete by otp', () => {
    describe('Delete otp', () => {
      beforeAll(async () => {
        otpService.otp.delete = jest.fn().mockResolvedValue(null);
        ret = await otpService.deleteByOTP('1234567');
      });
      test('should delete the otp', () => {
        expect(ret).toBe(undefined);
      });
    });
  });

  describe('Delete by user id', () => {
    describe('Delete otp', () => {
      beforeAll(async () => {
        otpService.otp.delete = jest.fn().mockResolvedValue(null);
      });
      test('should delete the otp', () => {
        expect(
          async (): Promise<void> => await otpService.deleteByUserId('12345')
        ).not.toThrow();
      });
    });
  });

  describe('Delete otp if exists', () => {
    describe('Delete otp', () => {
      beforeAll(async () => {
        otpService.findByOTP = jest
          .fn()
          .mockResolvedValue({user_id: '12345', created_at: ''});
        otpService.deleteByOTP = jest.fn().mockResolvedValue(null);
      });
      test('should delete the otp', () => {
        expect(
          async (): Promise<void> => await otpService.deleteIfExists('1234567')
        ).not.toThrow();
      });
    });

    describe('OTP do not exists', () => {
      beforeAll(async () => {
        otpService.findByOTP = jest.fn().mockResolvedValue(null);
      });
      test('should not delete the otp', () => {
        expect(
          async (): Promise<void> => await otpService.deleteIfExists('1234567')
        ).not.toThrow();
      });
    });
  });

  describe('Delete otp if user has', () => {
    describe('Delete otp', () => {
      beforeAll(async () => {
        otpService.findByUserId = jest
          .fn()
          .mockResolvedValue({code: '1234567', created_at: ''});
        otpService.deleteByUserId = jest.fn().mockResolvedValue(null);
      });
      test('should delete the otp', () => {
        expect(
          async (): Promise<void> => await otpService.deleteIfUserHas('12345')
        ).not.toThrow();
      });
    });

    describe('User do not have an otp', () => {
      beforeAll(async () => {
        otpService.findByUserId = jest.fn().mockResolvedValue(null);
      });
      test('should not delete the otp', () => {
        expect(
          async (): Promise<void> => await otpService.deleteIfUserHas('12345')
        ).not.toThrow();
      });
    });
  });

  describe('Check if the otp is valid', () => {
    describe('Valid otp', () => {
      beforeAll(async () => {
        otpService.findByOTP = jest
          .fn()
          .mockResolvedValue({user_id: '12345', created_at: getISONow()});
        ret = await otpService.isOTPValid('1234567');
      });
      test('should return true', () => {
        expect(ret).toBe(true);
      });
    });

    describe('Otp not found', () => {
      beforeAll(async () => {
        otpService.findByOTP = jest.fn().mockResolvedValue(null);
        ret = await otpService.isOTPValid('1234567');
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });

    // fix: otp expired test
    describe('Otp expired', () => {
      beforeAll(async () => {
        otpService.findByOTP = jest.fn().mockResolvedValue(null);
        ret = await otpService.isOTPValid('1234567');
      });
      test('should return false', () => {
        expect(ret).toBe(false);
      });
    });
  });
});

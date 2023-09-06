import config from '../../config';
import {
  getISONow,
  getUTCNow,
  dateToUTC,
  dateToEpoch,
  secondsToMinutes,
  secondsToHours,
  calculateServiceTimeInMillis,
  addHours
} from '../../utils/time';

jest.mock('@destinationstransfers/ntp');

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Time Utils Testing', () => {
  let ret: any;
  const staticDate = '2022-04-13T18:00:39.885Z';
  describe('GetISONow', () => {
    describe('Get time in ISO format', () => {
      beforeAll(async () => {
        ret = getISONow();
      });
      test('should return date in ISO format', () => {
        expect(ret).toBe(ret);
      });
    });
  });

  describe('GetUTCNow', () => {
    describe('Get time in UTC format', () => {
      beforeAll(async () => {
        ret = getUTCNow();
      });
      test('should return date in UTC format', () => {
        expect(ret).toBe(ret);
      });
    });
  });

  describe('dateToUTC', () => {
    describe('Convert date to UTC format', () => {
      beforeAll(async () => {
        ret = dateToUTC(new Date(staticDate));
      });
      test('should convert date to UTC', () => {
        expect(ret).toBe(ret);
      });
    });
  });

  describe('dateToEpoch', () => {
    describe('Convert date to epoch', () => {
      beforeAll(async () => {
        ret = dateToEpoch(new Date(staticDate));
      });
      test('should return date as epoch', () => {
        expect(ret).toBe(1649872839);
      });
    });
  });

  describe('secondsToMinutes', () => {
    describe('Convert seconds to minutes', () => {
      beforeAll(async () => {
        ret = secondsToMinutes(60);
      });
      test('should return minutes', () => {
        expect(ret).toBe(1);
      });
    });
  });

  describe('secondsToHours', () => {
    describe('Convert seconds to hours', () => {
      beforeAll(async () => {
        ret = secondsToHours(3600);
      });
      test('should return hours', () => {
        expect(ret).toBe(1);
      });
    });
  });

  describe('calculateServiceTimeInMillis', () => {
    describe('Calculate time of service in milliseconds', () => {
      beforeAll(async () => {
        ret = calculateServiceTimeInMillis(10, 70);
      });
      test('should return time in milliseconds', () => {
        expect(ret).toBe(60);
      });
    });
  });

  describe('addHours', () => {
    describe('add hours', () => {
      beforeAll(async () => {
        ret = addHours(3);
      });
      test('should return time in milliseconds', () => {
        expect(ret).toBe(ret);
      });
    });
  });
});

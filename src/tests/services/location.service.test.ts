import config from '../../config';
import {LocationService} from '../../services';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Location Service Testing', () => {
  let ret: any;
  const locationService = new LocationService();
  describe('Find Sub-Categories', () => {
    describe('Read all', () => {
      const readLocations = [
        {
          id: '12345',
          user_id: 'u12345',
          country: 'EEUU',
          zip_code: '01100',
          city: 'Springfield',
          state: 'Massachusetts'
        },
        {
          id: '67890',
          user_id: 'u67890',
          country: 'EEUU',
          zip_code: '01100',
          city: 'Springfield',
          state: 'Massachusetts'
        }
      ];
      beforeAll(async () => {
        locationService.location.findMany = jest
          .fn()
          .mockResolvedValue(readLocations);
        ret = await locationService.find();
      });
      test('should return an array of locations', () => {
        expect(ret).toBe(readLocations);
      });
    });
  });

  describe('Find Locacion by id', () => {
    describe('Read location', () => {
      const readLocation = {
        id: '12345',
        user_id: 'u12345',
        country: 'EEUU',
        zip_code: '01100',
        city: 'Springfield',
        state: 'Massachusetts'
      };
      beforeAll(async () => {
        locationService.location.findUnique = jest
          .fn()
          .mockResolvedValue(readLocation);
        ret = await locationService.findById(1);
      });
      test('should return a location', () => {
        expect(ret).toBe(readLocation);
      });
    });
  });

  describe('Create Location', () => {
    describe('Create location', () => {
      const createdLocation = {
        id: '12345'
      };
      beforeAll(async () => {
        locationService.location.create = jest
          .fn()
          .mockResolvedValue(createdLocation);
        ret = await locationService.create({} as any);
      });
      test('should return the created location', () => {
        expect(ret).toBe(createdLocation);
      });
    });
  });

  describe('Update location by id', () => {
    describe('Update location', () => {
      const updatedLocation = {
        id: '12345'
      };
      beforeAll(async () => {
        locationService.location.update = jest
          .fn()
          .mockResolvedValue(updatedLocation);
        ret = await locationService.updateById(1, {});
      });
      test('should return the updated location', () => {
        expect(ret).toBe(updatedLocation);
      });
    });
  });

  describe('Find locations by user id', () => {
    describe('Read locations by user', () => {
      const readLocations = [
        {
          id: '12345',
          user_id: 'u12345',
          country: 'EEUU',
          zip_code: '01100',
          city: 'Springfield',
          state: 'Massachusetts'
        },
        {
          id: '67890',
          user_id: 'u67890',
          country: 'EEUU',
          zip_code: '01100',
          city: 'Springfield',
          state: 'Massachusetts'
        }
      ];
      beforeAll(async () => {
        locationService.location.findMany = jest
          .fn()
          .mockResolvedValue(readLocations);
        ret = await locationService.findByUserId('12345');
      });
      test('should return a location array', () => {
        expect(ret).toBe(readLocations);
      });
    });
  });
});

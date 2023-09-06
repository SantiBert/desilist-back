import config from '../../../config';
import {AdminDashboardService} from '../../../services/admin/dashboard.service';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Dashboard Service Testing', () => {
  let ret: any;
  const adminDashboardService = new AdminDashboardService();
  describe('Dashboard', () => {
    describe('Read all categories', () => {
      const readCategories = [
        {
          id: 2,
          name: 'Entertainment',
          listings: 17
        },
        {
          id: 5,
          name: 'Personal Services',
          listings: 17
        },
        {
          id: 4,
          name: 'Profesional Jobs',
          listings: 16
        },
        {
          id: 6,
          name: 'Professional Services',
          listings: 13
        },
        {
          id: 8,
          name: 'Real State',
          listings: 11
        },
        {
          id: 3,
          name: 'Retail Jobs',
          listings: 11
        },
        {
          id: 7,
          name: 'Items For Sale',
          listings: 8
        },
        {
          id: 1,
          name: 'Community',
          listings: 4
        }
      ];
      beforeAll(async () => {
        adminDashboardService.findCategoriesQuery = jest
          .fn()
          .mockResolvedValue(readCategories);
        ret = await adminDashboardService.findCategories();
      });
      test('should return an array of categories', () => {
        expect(ret).toStrictEqual(readCategories);
      });
    });
  });
});

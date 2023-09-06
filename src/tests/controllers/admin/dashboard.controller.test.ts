import config from '../../../config';
import {STATUS_CODES} from '../../../constants';
import AdminDashboardController from '../../../controllers/admin/dashboard.controller';
import interceptors from '../../interceptors';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Admin Dashboard Controller', () => {
  let req: any, res: any, next: any;
  const adminDashboardController = new AdminDashboardController();
  describe('getDashboard', () => {
    describe('Read all', () => {
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
      const readUsers = 8;

      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        adminDashboardController.dashboard.findCategories = jest
          .fn()
          .mockResolvedValue(readCategories);
        adminDashboardController.dashboard.countUsers = jest
          .fn()
          .mockResolvedValue(readUsers);

        await adminDashboardController.getDashboard(req, res, next);
      });
      test('should return Admin Dashboard', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          data: {categories: readCategories, user: readUsers},
          message: 'Dashboard'
        });
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        adminDashboardController.dashboard.findCategories = jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Server Error');
          });

        await adminDashboardController.getDashboard(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });
});

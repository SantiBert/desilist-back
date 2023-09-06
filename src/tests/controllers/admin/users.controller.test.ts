import config from '../../../config';
import {UserStatus, STATUS_CODES} from '../../../constants';
import UsersController from '../../../controllers/admin/users.controller';
import interceptors from '../../interceptors';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing User Controller', () => {
  let req: any, res: any, next: any;
  const userController = new UsersController();
  describe('getUsers', () => {
    describe('Read all', () => {
      const readUsers = [
        {
          id: '12345',
          email: 'bart@gmail.com',
          status_id: UserStatus.ACTIVE
        },
        {
          id: '67890',
          email: 'lisa@gmail.com',
          status_id: UserStatus.ACTIVE
        }
      ];
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        userController.adminUsers.find = jest.fn().mockResolvedValue(readUsers);

        await userController.getUsers(req, res, next);
      });
      test('should return all users', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          data: readUsers,
          message: 'findAll'
        });
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        userController.adminUsers.find = jest.fn().mockImplementation(() => {
          throw new Error('Server Error');
        });

        await userController.getUsers(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });

  describe('getUserById', () => {
    let reqParams: any;
    describe('Read user', () => {
      const readUser = {
        id: '12345',
        email: 'bart@gmail.com',
        status_id: UserStatus.ACTIVE,
        created_at: new Date(Date.now())
      };
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        userController.users.findById = jest.fn().mockResolvedValue(readUser);

        await userController.getUserById(req, res, next);
      });
      test('should return the user', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          data: {
            id: readUser.id,
            full_name: undefined,
            email: readUser.email,
            phone_number: undefined,
            bio: undefined,
            photo: undefined,
            member_since: '1 day'
          },
          message: 'findOne'
        });
      });
    });

    describe('User do not exists', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        userController.users.findById = jest.fn().mockResolvedValue(null);

        await userController.getUserById(req, res, next);
      });
      test('should throw user not found error', () => {
        expect(next).toBeCalledWith(new Error('User not found'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });

  describe('Update User', () => {
    let reqBody: any;
    let reqParams: any;
    describe('update user data', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        reqBody = {
          full_name: 'Bart Simpson',
          phone_number: '+5491122334455',
          bio: 'I am Bart',
          photo: null,
          country: 'EEUU',
          city: 'Springfield',
          state: 'Massachusetts',
          zip_code: '01101'
        };
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;
        req.body = reqBody;

        userController.users.updateById = jest
          .fn()
          .mockResolvedValue({id: '12345'});
        userController.locations.findByUserId = jest
          .fn()
          .mockResolvedValue([{id: '67890'}]);
        userController.locations.updateById = jest
          .fn()
          .mockResolvedValue({id: '67890'});

        await userController.updateUser(req, res, next);
      });
      test('should update the user', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          message: 'updated'
        });
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        reqBody = {
          full_name: 'Bart Simpson',
          phone_number: '+5491122334455',
          bio: 'I am Bart',
          photo: null
        };
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;
        req.body = reqBody;

        userController.users.updateById = jest.fn().mockImplementation(() => {
          throw new Error('Server Error');
        });

        await userController.updateUser(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });

  describe('Delete User', () => {
    let reqParams: any;
    describe('delete the user', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        userController.users.findById = jest
          .fn()
          .mockResolvedValue({
            full_name: "Deleted User Name",
            email: "deletedUser@desilisttest.com",
            role_id: 2
          });
        userController.listings.deleteByUserId = jest
          .fn()
          .mockResolvedValue(null);
        userController.users.deleteById = jest.fn().mockResolvedValue(null);

        await userController.deleteUser(req, res, next);
      });
      test('should delete the user', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          message: 'deleted'
        });
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        userController.users.findById = jest.fn().mockImplementation(() => {
          throw new Error('Server Error');
        });

        await userController.deleteUser(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });
});

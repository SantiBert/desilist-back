import config from '../../../config';
import {AdminUserService} from '../../../services';
import {UserStatus} from '../../../constants';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Users Service Testing', () => {
  let ret: any;
  const userService = new AdminUserService();
  describe('Find Users', () => {
    describe('Read all', () => {
      const readUsers = [
        {id: '12345', email: 'bart@gmail.com', status_id: UserStatus.ACTIVE},
        {id: '67890', email: 'lisa@gmail.com', status_id: UserStatus.ACTIVE}
      ];
      const response = {
        users: readUsers,
        cursor: '67890',
        pages: 1, 
        total: 2,
      }
      beforeAll(async () => {
        userService.user.findMany = jest.fn().mockResolvedValue(readUsers);
        userService.user.count = jest.fn().mockResolvedValue(readUsers.length);
        ret = await userService.find();
      });
      test('should return an array of users', () => {
        expect(ret).toStrictEqual(response);
      });
    });
  });
});

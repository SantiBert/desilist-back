import request from 'supertest';
import App from '@/app';
import {hash} from 'bcrypt';
import {
  CreateUserSignupDto,
  CreateUserDto,
  CreateUserResetPasswordDto
} from '@dtos/users.dto';
import AuthRoute from '@routes/auth.route';
import {STATUS_CODES} from '@/constants';
import {UserRoles, UserStatus} from '@/constants/user.constants';
import {Mailer, MailerProvider} from '@/utils/mailer';

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

jest.mock('@/utils/mailer');
jest.mock('@/utils/telephony');

// fix: mockClear is not a function
// beforeEach(() => {
//   clear all instances and calls to constructor and all methods:
//   -Mailer.mockClear();
//   -Telephony.mockClear();
// });

describe('Testing Auth', () => {
  describe('[POST] /signup', () => {
    const endpoint = 'signup';
    describe('User created OK', () => {
      let response: request.Response;
      const mailer = new Mailer({provider: MailerProvider.SENDGRID});
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      let userData: CreateUserSignupDto;
      beforeAll(async () => {
        userData = {
          full_name: 'Bart Simpson',
          phone_number: '+5491155667788',
          photo: '',
          bio: '',
          email: 'bart@gmail.com',
          password: '0123456789'
        };

        const authRoute = new AuthRoute();

        const users = authRoute.authController.authService.users;
        const otp = authRoute.authController.authService.otp;

        users.findUnique = jest.fn().mockResolvedValue(null);
        users.create = jest.fn().mockResolvedValue({
          id: createdUserId
        });
        otp.create = jest.fn().mockResolvedValue({id: 1, code: '112233'});
        users.update = jest.fn().mockResolvedValue({});
        mailer.sendMail = jest.fn().mockResolvedValue({});

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(userData)
          .set({'x-api-version': '1.0.0'});
      });
      test('should have the Create userData', () => {
        expect(response.status).toBe(STATUS_CODES.CREATED);
      });
      test('should match created user id', () => {
        expect(response.body.data.id).toBe(createdUserId);
      });
      test('should match response message', () => {
        expect(response.body.message).toBe('User created');
      });
    });

    describe('User already exists', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      let userData: CreateUserSignupDto;
      beforeAll(async () => {
        userData = {
          full_name: 'Bart Simpson',
          phone_number: '+5491155667788',
          photo: '',
          bio: '',
          email: 'bart@gmail.com',
          password: '0123456789'
        };

        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;

        users.findUnique = jest.fn().mockResolvedValue({
          id: createdUserId
        });

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(userData)
          .set({'x-api-version': '1.0.0'});
      });
      test('should return CONFLICT status', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
      });
      test('should match error message', () => {
        expect(response.body.message).toBe(
          `The email ${userData.email} already exists`
        );
      });
    });
  });

  describe('[POST] /login', () => {
    const endpoint = 'login';
    describe('Login correct', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      let tokenJWT = '';
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const session = authRoute.authController.authService.session;
        const password = await hash('0123456789', 10);
        const userData = {
          id: createdUserId,
          full_name: 'Bart Simpson',
          phone_number: '+5491155667788',
          photo: '',
          bio: '',
          email: 'bart@gmail.com',
          password: password,
          status_id: UserStatus.ACTIVE,
          role_id: UserRoles.USER,
          otp_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        };

        const token = await authRoute.authController.authService.createToken(
          userData
        );
        tokenJWT = await authRoute.authController.authService.createJWT(token);

        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue(userData);

        //mOCK SESSION
        session.create = jest.fn().mockResolvedValue({
          data: {
            user_id: createdUserId,
            token: tokenJWT
          }
        });

        const app = new App([authRoute]);

        //iNPUT DATA
        const loginData: CreateUserDto = {
          email: 'bart@gmail.com',
          password: '0123456789'
        };
        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(loginData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should have login correct', () => {
        expect(response.status).toBe(STATUS_CODES.OK);
        expect(response.body.message).toBe(`login`);
      });
      test('Should return token', () => {
        expect(response.body.token).toBe(tokenJWT);
      });
    });

    describe('Pending verify', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const password = await hash('0123456789', 10);
        const userData = {
          id: createdUserId,
          full_name: 'Bart Simpson',
          phone_number: '+5491155667788',
          photo: '',
          bio: '',
          email: 'bart@gmail.com',
          password: password,
          status_id: UserStatus.PENDING_VERIFICATION,
          role_id: UserRoles.USER,
          otp_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        };
        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue(userData);

        const app = new App([authRoute]);

        //iNPUT DATA
        const loginData: CreateUserDto = {
          email: 'bart@gmail.com',
          password: '0123456789'
        };
        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(loginData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should match error message', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
        expect(response.body.message).toBe(`User not verified`);
      });
    });

    describe('User not exist', () => {
      let response: request.Response;
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;

        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue(null);

        const app = new App([authRoute]);

        //iNPUT DATA
        const loginData: CreateUserDto = {
          email: 'bart@gmail.com',
          password: '0123456789'
        };
        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(loginData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should match error message', () => {
        expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
        expect(response.body.message).toBe(`You're not a register user`);
      });
    });

    describe('Wrong Password', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const password = await hash('0123456789', 10);

        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue({
          id: createdUserId,
          email: 'bart@gmail.com',
          password: password,
          status_id: 3
        });

        const app = new App([authRoute]);

        //iNPUT DATA
        const loginData: CreateUserDto = {
          email: 'bart@gmail.com',
          password: 'wrongpassword'
        };
        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(loginData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should match error message', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
        expect(response.body.message).toBe(`User or password wrong`);
      });
    });

    describe('Create Session Error', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const session = authRoute.authController.authService.session;
        const password = await hash('0123456789', 10);

        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue({
          id: createdUserId,
          email: 'bart@gmail.com',
          password: password,
          status_id: 1
        });

        //mOCK SESSION
        session.create = jest.fn().mockResolvedValue(null);

        const app = new App([authRoute]);

        //iNPUT DATA
        const loginData: CreateUserDto = {
          email: 'bart@gmail.com',
          password: '0123456789'
        };
        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(loginData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should match error message', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
        expect(response.body.message).toBe('Cannot create session');
      });
    });
  });

  describe('[POST] /logout', () => {
    const endpoint = 'logout';
    describe('Logout correct', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      let tokenJWT = '';
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const session = authRoute.authController.authService.session;
        //const authMiddleware = new PrismaClient().user;
        const password = await hash('0123456789', 10);
        const userData = {
          id: createdUserId,
          full_name: 'Bart Simpson',
          phone_number: '+5491155667788',
          photo: '',
          bio: '',
          email: 'bart@gmail.com',
          password: password,
          status_id: UserStatus.ACTIVE,
          role_id: UserRoles.USER,
          otp_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        };

        const token = await authRoute.authController.authService.createToken(
          userData
        );
        tokenJWT = await authRoute.authController.authService.createJWT(token);

        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue({
          email: 'bart@gmail.com',
          password: password
        });

        //mOCK SESSION
        session.deleteMany = jest.fn().mockResolvedValue(1);

        const app = new App([authRoute]);

        //iNPUT DATA
        const logoutData: {id: string} = {
          id: createdUserId
        };

        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(logoutData)
          .set({'x-api-version': '1.0.0', Authorization: `Bearer ${tokenJWT}`});
      });
      test('Should have logout correctly', () => {
        expect(response.status).toBe(STATUS_CODES.OK);
        expect(response.body.message).toBe('logout');
      });
    });

    describe('Cannot delete session', () => {
      let response: request.Response;
      const createdUserId = 'c753ee7c-b684-48f6-bee1-c460f7689fc4';
      let tokenJWT = '';
      beforeAll(async () => {
        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const session = authRoute.authController.authService.session;
        const password = await hash('0123456789', 10);
        const userData = {
          id: createdUserId,
          full_name: 'Bart Simpson',
          phone_number: '+5491155667788',
          photo: '',
          bio: '',
          email: 'bart@gmail.com',
          password: password,
          status_id: UserStatus.ACTIVE,
          role_id: UserRoles.USER,
          otp_id: 1,
          created_at: new Date(),
          updated_at: new Date()
        };

        const token = await authRoute.authController.authService.createToken(
          userData
        );
        tokenJWT = await authRoute.authController.authService.createJWT(token);

        //mOCK USER
        users.findUnique = jest.fn().mockResolvedValue({
          email: 'bart@gmail.com',
          password: password
        });

        //mOCK SESSION
        session.deleteMany = jest.fn().mockResolvedValue(null);

        const app = new App([authRoute]);

        //iNPUT DATA
        const logoutData: {id: string} = {
          id: createdUserId
        };
        //login
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(logoutData)
          .set({'x-api-version': '1.0.0', Authorization: `Bearer ${tokenJWT}`});
      });
      test('Should match error message', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
        expect(response.body.message).toBe(
          'Wrong Authentication token or missing'
        );
      });
    });
  });

  describe('[POST] /reset_password', () => {
    const endpoint = 'reset_password';
    describe('Password reset via email', () => {
      let response: request.Response;
      let requestData: CreateUserResetPasswordDto;
      beforeAll(async () => {
        requestData = {
          email: 'bart@gmail.com',
          flow: 'EMAIL'
        };

        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const otp = authRoute.authController.authService.otp;

        users.findUnique = jest.fn().mockResolvedValue({
          id: 'c753ee7c-b684-48f6-bee1-c460f7689fc4',
          status_id: UserStatus.ACTIVE,
          otp_id: 1
        });

        otp.update = jest.fn().mockResolvedValue({
          code: '112233'
        });

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(requestData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should have login correct', () => {
        expect(response.status).toBe(STATUS_CODES.OK);
      });
      test('Should return token', () => {
        expect(response.body.message).toBe('OTP code sent');
      });
    });
    describe('Password reset via email', () => {
      let response: request.Response;
      let requestData: CreateUserResetPasswordDto;
      beforeAll(async () => {
        requestData = {
          email: 'bart@gmail.com',
          flow: 'SMS'
        };

        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        const otp = authRoute.authController.authService.otp;

        users.findUnique = jest.fn().mockResolvedValue({
          id: 'c753ee7c-b684-48f6-bee1-c460f7689fc4',
          phone_number: '+541199887766',
          status_id: UserStatus.ACTIVE,
          otp_id: 1
        });

        otp.update = jest.fn().mockResolvedValue({
          code: '112233'
        });

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(requestData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should have login correct', () => {
        expect(response.status).toBe(STATUS_CODES.OK);
      });
      test('Should return token', () => {
        expect(response.body.message).toBe('OTP code sent');
      });
    });
    describe('User do not exists', () => {
      let response: request.Response;
      let requestData: CreateUserResetPasswordDto;
      beforeAll(async () => {
        requestData = {
          email: 'bart@gmail.com',
          flow: 'EMAIL'
        };

        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        users.findUnique = jest.fn().mockResolvedValue(null);

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(requestData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should have login correct', () => {
        expect(response.status).toBe(STATUS_CODES.NOT_FOUND);
      });
      test('Should return token', () => {
        expect(response.body.message).toBe("You're not a register user");
      });
    });
    describe('User not active', () => {
      let response: request.Response;
      let requestData: CreateUserResetPasswordDto;
      beforeAll(async () => {
        requestData = {
          email: 'bart@gmail.com',
          flow: 'EMAIL'
        };

        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        users.findUnique = jest.fn().mockResolvedValue({
          id: 'c753ee7c-b684-48f6-bee1-c460f7689fc4',
          status_id: UserStatus.INACTIVE
        });

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(requestData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should have login correct', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
      });
      test('Should return token', () => {
        expect(response.body.message).toBe("You're not an active user");
      });
    });
    describe('User without phone number', () => {
      let response: request.Response;
      let requestData: CreateUserResetPasswordDto;
      beforeAll(async () => {
        requestData = {
          email: 'bart@gmail.com',
          flow: 'SMS'
        };

        const authRoute = new AuthRoute();
        const users = authRoute.authController.authService.users;
        users.findUnique = jest.fn().mockResolvedValue({
          id: 'c753ee7c-b684-48f6-bee1-c460f7689fc4',
          status_id: UserStatus.ACTIVE
        });

        const app = new App([authRoute]);
        response = await request(app.getServer())
          .post(`${authRoute.path}${endpoint}`)
          .send(requestData)
          .set({'x-api-version': '1.0.0'});
      });
      test('Should have login correct', () => {
        expect(response.status).toBe(STATUS_CODES.CONFLICT);
      });
      test('Should return token', () => {
        expect(response.body.message).toBe(
          'The user do not have a phone number registered'
        );
      });
    });
  });
});

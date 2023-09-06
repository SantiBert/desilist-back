import config from '../../config';
import {STATUS_CODES} from '../../constants';
import PublicController from '../../controllers/public.controller';
import {SendGridService} from '../../services/sendgrid.service';
import interceptors from '../interceptors';

jest.mock('@/services/sendgrid.service');

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Public Controller', () => {
  let req: any, res: any, next: any;
  const publicController = new PublicController();
  const sendgrid = new SendGridService();
  describe('Contact us', () => {
    let reqBody: any;
    describe('Send email', () => {
      beforeAll(async () => {
        reqBody = {
          'g-recaptcha-response': '',
          email: 'bart@gmail.com',
          name: 'Bart Simpson',
          message: ''
        };
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.body = reqBody;

        publicController.reCaptcha.validate = jest.fn().mockResolvedValue(null);
        sendgrid.contactUs = jest.fn().mockResolvedValue(null);

        await publicController.contactUs(req, res, next);
      });
      test('should return OK', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Message sent'
        });
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        publicController.reCaptcha.validate = jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Server Error');
          });

        await publicController.contactUs(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });
});

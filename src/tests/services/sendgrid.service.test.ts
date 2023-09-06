import config from '../../config';
import {SendGridService} from '../../services';
import {Mailer, MailerProvider} from '../../utils/mailer';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

jest.mock('@/utils/mailer');

describe('Sendgrid Service Testing', () => {
  let ret: any;
  const sendgridService = new SendGridService();
  const mailer = new Mailer({provider: MailerProvider.SENDGRID});
  describe('Send the email', () => {
    describe('Send activate account email OK', () => {
      beforeAll(async () => {
        mailer.sendMail = jest.fn().mockResolvedValue(null);
      });
      test('should send the email successfuly', () => {
        expect(
          async (): Promise<void> =>
            await sendgridService.activateAccount(
              'bart@gmail.com',
              'asdfghjkl12345'
            )
        ).not.toThrow();
      });
    });

    describe('Send restore password email OK', () => {
      beforeAll(async () => {
        mailer.sendMail = jest.fn().mockResolvedValue(null);
      });
      test('should send the email successfuly', () => {
        expect(
          async (): Promise<void> =>
            (ret = await sendgridService.restorePassword(
              'bart@gmail.com',
              'asdfghjkl12345'
            ))
        ).not.toThrow();
        expect(ret).toBe(undefined);
      });
    });

    describe('Send contact us email OK', () => {
      beforeAll(async () => {
        mailer.sendMail = jest.fn().mockResolvedValue(null);
      });
      test('should send the email successfuly', () => {
        expect(
          async (): Promise<void> =>
            await sendgridService.contactUs(
              'bart@gmail.com',
              {email: '', name: '', message: ''}
            )
        ).not.toThrow();
      });
    });
  });
});

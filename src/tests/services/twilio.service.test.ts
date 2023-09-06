import config from '../../config';
import {TwilioService} from '../../services';
import {Telephony} from '../../utils/telephony';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

jest.mock('@/utils/telephony');

describe('Twilio Service Testing', () => {
  const twilioService = new TwilioService();
  const telephony = new Telephony();
  describe('Send the sms', () => {
    describe('Send sms OK', () => {
      beforeAll(async () => {
        telephony.sendSMS = jest.fn().mockResolvedValue(null);
      });
      test('should send the sms successfuly', () => {
        expect(
          async (): Promise<void> =>
            await twilioService.restorePassword('bart@gmail.com', '1234567')
        ).not.toThrow();
      });
    });
  });
});

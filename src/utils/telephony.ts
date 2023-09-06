// eslint-disable-next-line @typescript-eslint/no-require-imports
const twilio = require('twilio');
import config from '@/config';

const accountSid = config.telephony.twilio.account_sid;
const authToken = config.telephony.twilio.token;
const defaultSender = config.telephony.default_sender;

export class Telephony {
  public constructor(from: string = defaultSender) {
    this.client = twilio(accountSid, authToken);
    this.from = from;
  }
  private client: any;
  private from: string;
  private message: string;

  public setMessage(message: string): void {
    this.message = message;
  }

  public async sendSMS(recipent: string): Promise<void> {
    try {
      const message = await this.client.messages.create({
        to: recipent,
        from: this.from,
        body: this.message || ''
      });
      console.log(`Message SID ${message.sid}`);
    } catch (err) {
      console.error(err);
    }
  }
}

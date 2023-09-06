import {Telephony} from '@/utils/telephony';

export class TwilioService {
  public constructor() {
    this.telephony = new Telephony();
  }
  private telephony: any;

  public async restorePassword(recipent: string, otp: string): Promise<void> {
    this.telephony.setMessage(
      `Hello! This is the otp code ${otp} to recover your password.`
    );
    await this.telephony.sendSMS(recipent);
  }
}

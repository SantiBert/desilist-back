import sgMail from '@sendgrid/mail';

export enum MailerProvider {
  NODEMAILER,
  SENDGRID
}

export interface MailerOpts {
  host: string;
  port?: number;
  secure?: boolean;
  auth?: Record<string, any>;
  tls?: Record<string, any>;
}

export interface MailerAttachment {
  filename?: string;
  content?: string;
  contentType?: string;
  path: string;
  encoding?: string;
  raw?: string;
}

export interface MailerText {
  to: string;
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  replyTo?: string;
  text?: string;
  html?: string;
  attachments?: MailerAttachment[];
}

export interface MailerTransporter {
  provider: MailerProvider;
  config?: MailerOpts;
}

export class Mailer {
  public constructor(transporter: MailerTransporter, apiKey?: string) {
    if (transporter.provider === MailerProvider.SENDGRID) {
      this.mailer = sgMail;
      if (apiKey) {
        this.mailer.setApiKey(apiKey);
      }
    } else {
      // nodemailer
    }
  }
  private mailer: any;
  private text: MailerText;

  public setMessage(text: MailerText): void {
    this.text = text;
  }

  public addAttachment(attachment: MailerAttachment[]): void {
    this.text.attachments = attachment;
  }

  public async sendMail(): Promise<void> {
    try {
      await this.mailer.send(this.text);
    } catch (err) {
      console.error(err);

      if (err.response) {
        console.error(err.response.body);
      }
    }
  }
}

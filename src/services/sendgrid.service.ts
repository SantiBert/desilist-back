import config from '@/config';
import {ContactUsDto} from '@/dtos/public.dto';
import {Mailer, MailerProvider} from '@utils/mailer';

const FE_URL = config.frontend.url;
const AA_ENDP = config.frontend.endpoints.activate_account;
const CP_ENDP = config.frontend.endpoints.change_password;
const RA_ENDP = config.frontend.endpoints.restore_account;
const SENDGRID_API_KEY = config.mailer.sendgrid.api_key;
const DEFAULT_SENDER = config.mailer.default_sender;
const DEFAULT_SENDER_NAME = config.mailer.default_sender_name;
const DEFAULT_REPLY_TO = config.mailer.default_reply_to;
const ACTIVATE_ACCOUNT_TEMPLATE_ID = config.mailer.sendgrid.activate_account;
const CONTACT_US_TEMPLATE_ID = config.mailer.sendgrid.contact_us;
const NEW_CHAT_MESSAGE_TEMPLATE_ID = config.mailer.sendgrid.new_chat_mesage;
const RESTORE_ACCOUNT_TEMPLATE_ID = config.mailer.sendgrid.restore_account;
const RESTORE_PASSWORD_TEMPLATE_ID = config.mailer.sendgrid.restore_password;
const LISTING_TO_EXPIRE_TEMPLATE_ID = config.mailer.sendgrid.listing_expire;
const ADMIN_LISTING_REPORTED = config.mailer.sendgrid.listing_reported;
const LISTING_FLAGGED = config.mailer.sendgrid.listing_flagged;
const ADMIN_LISTING_UPDATED = config.mailer.sendgrid.listing_updated;
const LISTING_UPDATE_DENIED = config.mailer.sendgrid.listing_denied;
const LISTING_DELETED = config.mailer.sendgrid.listing_deleted;
const LISTING_FLAGGED_APPROVED =
  config.mailer.sendgrid.listing_flagged_approved;
const ACCOUNT_DELETED = config.mailer.sendgrid.account_deleted;
const BUY_EVENT_TICKETS = config.mailer.sendgrid.buy_event_ticket;
const EVENT_APPROVED = config.mailer.sendgrid.event_approved;
const EVENT_REPROVED = config.mailer.sendgrid.event_need_changes;
const EVENT_REPORTED = config.mailer.sendgrid.event_reported;
const EVENT_DENIED = config.mailer.sendgrid.event_denied;

const EVENT_PAUSED = config.mailer.sendgrid.event_denied;
const EVENT_UPDATED = config.mailer.sendgrid.event_updated;
const NEW_EVENT_PENDING = config.mailer.sendgrid.new_event_pending;
const EVENT_FLAGGED_APPROVED = config.mailer.sendgrid.event_flagged_approved;
const EVENT_FLAGGED = config.mailer.sendgrid.event_has_been_flaged;
const EVENT_FLAGGED_UPDATE_DENIED = config.mailer.sendgrid.event_update_flaged_denied;
const EVENT_EXPIRED = config.mailer.sendgrid.event_expired;
const CHECK_YOUR_DASHBOARD = config.mailer.sendgrid.check_your_dashboard;
export class SendGridService {
  public constructor() {
    this.mailer = new Mailer(
      {provider: MailerProvider.SENDGRID},
      SENDGRID_API_KEY
    );
  }

  private mailer: any;

  public async activateAccount(to: string, token: string): Promise<void> {
    await this.sendMail(to, ACTIVATE_ACCOUNT_TEMPLATE_ID, {
      subject: 'Confirm Account',
      redirectUrl: `${FE_URL}/${AA_ENDP}?data=${token}`
    });
  }

  public async restorePassword(to: string, token: string): Promise<void> {
    await this.sendMail(to, RESTORE_PASSWORD_TEMPLATE_ID, {
      subject: 'Restore Password',
      redirectUrl: `${FE_URL}/${CP_ENDP}?data=${token}`
    });
  }

  public async restoreAccount(to: string, token: string): Promise<void> {
    await this.sendMail(to, RESTORE_ACCOUNT_TEMPLATE_ID, {
      subject: 'Restore Account',
      redirectUrl: `${FE_URL}/${RA_ENDP}?data=${token}`
    });
  }

  public async contactUs(to: string, contactData: ContactUsDto): Promise<void> {
    await this.sendMail(to, CONTACT_US_TEMPLATE_ID, {
      subject: 'Contact Us',
      email: contactData.email,
      name: contactData.name,
      message: contactData.message
    });
  }

  public async listingReported(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, ADMIN_LISTING_REPORTED, {
      subject: 'Listing Reported',
      card,
      redirectUrl,
      unsubscribe
    });
  }

  public async listingFlagged(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, LISTING_FLAGGED, {
      subject: 'Your listing has been Flagged!',
      card,
      redirectUrl,
      unsubscribe
    });
  }

  public async listingFlaggedUpdated(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, ADMIN_LISTING_UPDATED, {
      subject: 'Updated in a flagged listing: Vendor waiting approval',
      card,
      redirectUrl,
      unsubscribe
    });
  }

  public async listingFlaggedDenied(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, LISTING_UPDATE_DENIED, {
      subject: 'Update in your flagged listing',
      card,
      redirectUrl,
      unsubscribe
    });
  }

  public async newChatMessage(
    to: string,
    fullname: string,
    image: string,
    message: string,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, NEW_CHAT_MESSAGE_TEMPLATE_ID, {
      subject: 'Desilist: You have a new message!',
      fullname,
      image,
      message,
      redirectUrl,
      unsubscribe
    });
  }

  public async listingExpire(
    to: string,
    title: string,
    category: string,
    days: number,
    image: string[],
    redirectUrl: string
  ): Promise<void> {
    await this.sendMail(to, LISTING_TO_EXPIRE_TEMPLATE_ID, {
      subject: 'Your Listing is about to expire',
      title,
      category,
      days,
      image,
      redirectUrl
    });
  }

  private async sendMail(
    to: string,
    template_id: string,
    dynamic_template_data: any = new Object()
  ): Promise<void> {
    this.mailer.setMessage({
      from: {
        email: DEFAULT_SENDER,
        name: DEFAULT_SENDER_NAME
      },
      replyTo: DEFAULT_REPLY_TO,
      to,
      template_id,
      dynamic_template_data
    });
    await this.mailer.sendMail();
  }

  public async listingDeleted(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, LISTING_DELETED, {
      subject: 'Your listing has been deleted!',
      card,
      redirectUrl,
      unsubscribe
    });
  }

  public async listingFlaggedApproved(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, LISTING_FLAGGED_APPROVED, {
      subject: 'Your listing is active again!',
      card,
      redirectUrl,
      unsubscribe
    });
  }

  public async accountDeleted(
    to: string,
    fullname: string,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, ACCOUNT_DELETED, {
      subject: 'Account deleted!',
      fullname,
      redirectUrl,
      unsubscribe
    });
  }
  
  public async buyEventTickets(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event: any
  ): Promise<void> {
    await this.sendMail(to, BUY_EVENT_TICKETS, {
      subject: 'Event Tickets',
      redirectUrl,
      unsubscribe,
      event
    });
  }

  public async eventApproved(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event: any,
  ): Promise<void> {
    await this.sendMail(to, EVENT_APPROVED, {
      subject: 'Your event has been approved!',
      redirectUrl,
      unsubscribe,
      event
    });
  }
  
  public async eventReproved(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event: any,
  ): Promise<void> {
    await this.sendMail(to, EVENT_REPROVED, {
      subject: 'Your event need changes!',
      redirectUrl,
      unsubscribe,
      event,
    });
  }

  public async eventReported(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event: any,
  ): Promise<void> {
    await this.sendMail(to, EVENT_REPORTED, {
      subject: 'Your event need changes!',
      redirectUrl,
      unsubscribe,
      event,
    });
  }

  public async eventDenied(
    to: string,
    event: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, EVENT_DENIED, {
      subject: 'Your event has been denied.',
      event,
      redirectUrl,
      unsubscribe
    });
  }

  public async eventPaused(
    to: string,
    event: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, EVENT_PAUSED, {
      subject: 'Your event has been paused.',
      event,
      redirectUrl,
      unsubscribe
    });
  }

  public async eventExpired(
    to: string,
    event: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, EVENT_EXPIRED, {
      subject: 'Your event has already finished.',
      event,
      redirectUrl,
      unsubscribe
    });
  }

  public async eventUpdated(
    to: string,
    event: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, EVENT_UPDATED, {
      subject: 'Updated in a pending event: Vendor waiting approval',
      event,
      redirectUrl,
      unsubscribe
    });
  }

  public async eventFlagged(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event: any,
  ): Promise<void> {
    await this.sendMail(to, EVENT_FLAGGED, {
      subject: 'Your event has been Flagged!',
      redirectUrl,
      unsubscribe,
      event
    });
  }

  public async eventFlaggedAproved(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event:any,
  ): Promise<void> {
    await this.sendMail(to, EVENT_FLAGGED_APPROVED, {
      subject: 'Your event is active again!',
      redirectUrl,
      unsubscribe,
      event
    });
  }

  public async eventFlaggedDenied(
    to: string,
    redirectUrl: string,
    unsubscribe: string,
    event: any,
  ): Promise<void> {
    await this.sendMail(to, EVENT_FLAGGED_UPDATE_DENIED, {
      subject: 'Update in your flagged event',
      redirectUrl,
      unsubscribe,
      event,
    });
  }

  public async checkYourDashboard(
    to: string,
    card: any,
    redirectUrl: string,
    unsubscribe: string,
    value:string
  ): Promise<void> {
    await this.sendMail(to, CHECK_YOUR_DASHBOARD, {
      subject: `There are ${value} days left for the end of your event`,
      card,
      redirectUrl,
      unsubscribe
    });
  }
  
  public async adminNewEventApproval(
    to: string,
    event: any,
    redirectUrl: string,
    unsubscribe: string
  ): Promise<void> {
    await this.sendMail(to, NEW_EVENT_PENDING, {
      subject: 'New event requires approval.',
      event,
      redirectUrl,
      unsubscribe
    });
  }
}

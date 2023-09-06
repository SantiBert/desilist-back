import config from '@/config';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {Notification} from '@prisma/client';
import {NotificationWs} from './notificationWs.service';

const URI = config.notification_service.uri;
const ADMIN_CHANNEL = 'desilist-admin';

export class NotificationEmitter {
  public constructor(enabled = true) {
    this.enabled = enabled;
    if (enabled) {
      this.channel = new NotificationWs(URI);
    }
  }

  private channel: NotificationWs;
  private enabled: boolean;

  public listingAboutToExpire(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.LISTING_ABOUT_TO_EXPIRE,
      JSON.stringify(notification)
    );
  }
  public listingPromotedAboutToExpire(
    notification: Partial<Notification>
  ): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.LISTING_PROMOTE_ABOUT_TO_EXPIRE,
      JSON.stringify(notification)
    );
  }

  public listingEdited(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.LISTING_EDITED,
      JSON.stringify(notification)
    );
  }

  public listingPromoted(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.LISTING_PROMOTED,
      JSON.stringify(notification)
    );
  }

  public listingReported(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.LISTING_PROMOTED,
      JSON.stringify(notification)
    );
  }

  public userCreated(notification: Partial<Notification>): void {
    this.event(
      ADMIN_CHANNEL,
      NOTIFICATION_TYPE.USER_CREATED,
      JSON.stringify(notification)
    );
  }

  public userNotification(
    userId: string,
    notification: Partial<Notification>
  ): void {
    this.event(
      userId,
      notification.type as NOTIFICATION_TYPE,
      JSON.stringify(notification)
    );
  }

  public newMessage(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.NEW_MESSAGE,
      JSON.stringify(notification)
    );
  }

  public eventApproved(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.EVENT_APPROVED,
      JSON.stringify(notification)
    );
  }
  
  public ticketsPartiallySoldOut(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.TICKET_PARTIALLY_SOLD_OUT,
      JSON.stringify(notification)
    );
  }

  public eventReproved(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.EVENT_REPROVED,
      JSON.stringify(notification)
    );
  }

  public ticketsSoldOut(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.TICKET_SOLD_OUT,
      JSON.stringify(notification)
    );
  }

  public eventDenied(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.EVENT_DENIED,
      JSON.stringify(notification)
    );
  }
  
  public ticketPurchased(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.TICKET_PURCHASED,
      JSON.stringify(notification)
    );
  }

  public ticketRedeemed(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.TICKET_REDEEMED,
      JSON.stringify(notification)
    );
  }

  private event(
    channel: string,
    type: NOTIFICATION_TYPE,
    message: string
  ): void {
    if (this.enabled) {
      this.channel.sendNotification(channel, type, message);
    }
  }

  public eventPaused(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.EVENT_PAUSED,
      JSON.stringify(notification)
    );
  }

  public eventPromoted(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.LISTING_PROMOTED,
      JSON.stringify(notification)
    );
  }

  public eventCheckDashboard(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.CHECK_YOUR_DASHBOARD,
      JSON.stringify(notification)
    );
  }

  public adminNewEventApproval(notification: Partial<Notification>): void {
    this.event(
      notification.user_id,
      NOTIFICATION_TYPE.NEW_EVENT_FOR_APPROVAL,
      JSON.stringify(notification)
    );
  }
}

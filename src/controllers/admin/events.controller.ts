import {NextFunction, Request, Response} from 'express';
import {Listing} from '@prisma/client';
import {STATUS_CODES, UserRoles} from '@/constants';
import {CreateListingDto, UpdateListingDto} from '@/dtos/listings.dto';
import {ListingService} from '@/services/admin/listings.service';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {
  listingNotFoundException,
  listingTooManyImagesException
} from '@/errors/listings.error';
import {ISOtoCron, getISONow, isFutureDate} from '@/utils/time';
import {EventsService, S3, SendGridService, EventFlagService} from '@/services';
import config from '@/config';
import {GetAllListing} from '@/interfaces/listing.interface';
import {ListingPackageService} from '@/services/admin/listingPackage.service';
import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {ImageFormat, ImageManip} from '@/utils/imageManip';
import {ListingFlagService} from '@/services/admin/listingFlag.service';
import {
  eventNotFoundException,
  highlightWithoutPromoteException,
  invalidFlagReasonsException
} from '@/errors/event.error';
import {EventApprovalService} from '@/services/admin/eventApproval.service';
import {AdminEventsService} from '@/services/admin/events.service';
import {DateTime} from 'luxon';
import prisma from '@/db';
import {schedule} from 'node-cron';
import {GetAllEvent} from '@/interfaces/events.interface';
import {getEventStatus} from '@/utils/salesStatus';
import {EventPackageService} from '@/services/eventPackage.service';

const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const NOTIFICATION_ENABLED = config.notification_service.enabled;
const MAILER_ENABLED = config.mailer.enabled;
const LISTING_PATH = 'Listing';
const ENV = config.environment;
const FE_URL = config.frontend.url;
const FE_UNSUSCRIBE_ENDP = config.frontend.endpoints.unsuscribe;
const FE_FLAGGED = config.frontend.endpoints.flagged;
const FE_DASHBOARD = config.frontend.endpoints.dashboard;
const EVENTS_PATH = 'Event';

const $ListingEdited = {
  title: 'Your listing has been edited',
  message: 'We made some changes on your listing, click to see more!'
};
const $ListingFlaged = {
  title: 'Your listing has been flagged',
  message:
    'One of your listings has been flagged as not appropriate, click on View More to find out more.'
};

const $ListingDeleted = {
  title: 'Your listing has been deleted',
  message: 'One of your listings has been deleted by an Admin'
};
const $ListingFlagedApproved = {
  title: 'Your flagged listing is active again',
  message: 'A listing that was flagged has been approved and is back online!'
};
const $EventApproved = {
  title: 'Your event has been approved.',
  message: 'Congrats! Your event has been approved.'
};
const $EventReproved = {
  title: 'Your event need corrections.',
  message: 'Admin feedback: Corrections needed for event approval.'
};
const $EventDenied = {
  title: 'Your event has been denied.',
  message: 'We regret to inform you that your event has been denied.'
};
const $TicketSaleEnd = {
  title: 'Ticket sales ended.',
  message: 'The ticket sales for your event have ended.'
};

const $EventFlaged = {
  title: 'Your event has been flagged',
  message: 'Your event has been flagged for review.'
};

const $EventFlagedApproved = {
  title: 'Your flagged event is active again',
  message: 'A event was Paused'
};
const $EventPaused = {
  title: 'Your Event was Paused',
  message: 'Event temporarily paused.'
};

const $CheckDashboard = {
  title: 'Your Event is about to Expire',
  message: 'Your Event is about to Expire'
};

class EventsController {
  public listings = new ListingService();
  public listingsPackages = new ListingPackageService();
  public listingsFlag = new ListingFlagService();
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public imageManip = new ImageManip();
  private MAX_NUMBER_FILES = 6;
  private notifications = new NotificationService();
  private sendgrid = new SendGridService();
  public events = new AdminEventsService();
  public eventFlag = new EventFlagService();
  public eventPackages = new EventPackageService();

  private EventApproval = new EventApprovalService();

  public getEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;

      const eventsData: Partial<GetAllEvent> = await this.events.find(params);

      const {events, total, cursor, pages} = eventsData;

      // fix: remove promoted property
      for (let i = 0; i < events.length; ++i) {
        events[i]['sales_status'] = await getEventStatus(events[i]);
        if (
          events[i].eventPackage &&
          events[i].eventPackage.filter(
            (eventPackage) =>
              eventPackage.active &&
              eventPackage.paused_at === null &&
              eventPackage.promote_package_id
          ).length > 0
        ) {
          events[i]['promoted'] = true;
        } else {
          events[i]['promoted'] = false;
        }

        /* images */
        /*
        const files = await this.s3.getObjectslistFromFolder(
          `${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}/static_`
        );
        events[i]['images'] = files.Contents.map(
          (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
        );
        */
        /* banner */
        /*
        if (events[i].has_banner) {
          const banner = await this.s3.getObjectslistFromFolder(
            `${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}/banner`
          );
          events[i]['banner'] = files.Contents.map(
            (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
          );
        }
        */
        if (events[i].has_banner) {
          events[i]['banner'] = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}/banner`;
        }

        events[i]['sales_status'] = await getEventStatus(events[i]);
        if (events[i].status.id === LISTING_STATUS.PENDING) {
          const reviews = await this.EventApproval.getReportByEventId(events[i].id);
          if (reviews.length > 0) {
            events[i]['pending_status'] = {
              first_review: reviews.length === 1 && reviews[0].reason === null,
              new_changes: reviews[0].new_changes,
              data: reviews
            }
          }
        }
      }

      res.status(STATUS_CODES.OK).json({
        data: {events, total, cursor, pages},
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getEventById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findEvent: any = await this.events.findById(id);
      if (!findEvent) {
        throw eventNotFoundException('Event not found');
      }

      // promoted
      if (
        findEvent.eventPackage &&
        findEvent.eventPackage.filter(
          (eventPackage) =>
            eventPackage.active &&
            eventPackage.paused_at === null &&
            eventPackage.promote_package_id
        ).length > 0
      ) {
        findEvent['promoted'] = true;
      } else {
        findEvent['promoted'] = false;
      }

      // banner and images
      const files = await this.s3.getObjectslistFromFolder(
        `${ENV}/${findEvent.publisher.id}/${EVENTS_PATH}/${findEvent.id}`
      );
      const images = files.Contents.filter((file) =>
        file.Key.includes('static_')
      );
      if (images.length > 0) {
        findEvent['images'] = images.map(
          (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
        );
      }
      if (findEvent.has_banner) {
        const banner = files.Contents.filter((file) =>
          file.Key.includes('banner')
        );
        if (banner.length > 0) {
          findEvent['banner'] = banner.map(
            (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
          );
        }
      }

      // pending status
      if (findEvent.status.id === LISTING_STATUS.PENDING) {
        const reviews = await this.EventApproval.getReportByEventId(findEvent.id);
        if (reviews.length > 0) {
          findEvent['pending_status'] = {
            first_review: reviews.length === 1 && reviews[0].reason === null,
            new_changes: reviews[0].new_changes,
            data: reviews
          }
        }
      }
      // sale status
      findEvent['sales_status'] = await getEventStatus(findEvent);
      res.status(STATUS_CODES.OK).json({data: findEvent, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public createListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const listingData: CreateListingDto = req.body;
      const images = [];
      const data = {
        ...listingData,
        user_id: req.user.id,
        status_id: LISTING_STATUS.DRAFT
      };
      const createdListing = await this.listings.create(data as any);
      if (!createdListing) {
        throw new Error('Server Error');
      }

      if (listingData.images.length > this.MAX_NUMBER_FILES) {
        throw listingTooManyImagesException('Too many files');
      }

      if (listingData.images.length > 0) {
        let i = 0;
        for await (const image of listingData.images) {
          const imageUrl = await this.uploadImage(
            image,
            `${ENV}/${createdListing.user_id}/${LISTING_PATH}/${createdListing.id}/`,
            `static_${i++}`
          );
          images.push(imageUrl);
        }
        await this.listings.updateById(createdListing.id, {images: images});
      }

      res.status(STATUS_CODES.CREATED).json({message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public updateListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: UpdateListingDto = req.body;
      // sin esto, los listings pasan a ser del Admin, no borrar
      delete updateData.user_id;
      const listingToUpdate: any = await this.listings.findById(id);
      if (!listingToUpdate) {
        throw listingNotFoundException('Listing not found');
      }

      updateData.images = await this.checkPhotosByMetadata(
        listingToUpdate,
        updateData
      );

      await this.listings.updateById(id, updateData);

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToUpdate.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_EDITED,
          seen: false,
          title: $ListingEdited.title,
          // message: `Listing ${listingToUpdate.id} was edited by admin`
          message: $ListingEdited.message,
          data: {listing: listingToUpdate.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        notifications.listingEdited(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToDelete: any = await this.listings.findById(id);
      if (!listingToDelete) {
        throw listingNotFoundException('Listing not found');
      }

      await this.listings.updateById(id, {
        highlighted: false,
        status_id: LISTING_STATUS.INACTIVE,
        deleted_at: getISONow()
      });

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: listingToDelete.user.id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_DELETE,
          seen: false,
          title: $ListingDeleted.title,
          // message: `Listing ${listingToFlag.id} flagged for user: ${listingToFlag.user_id}`
          message: $ListingDeleted.message,
          data: {listing: listingToDelete.id}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        if (MAILER_ENABLED) {
          const card = {
            title: listingToDelete.title,
            category: `${listingToDelete.subcategory.category.name} > ${listingToDelete.subcategory.name}`
          };
          const redirectUrl = `${FE_URL}/contact-us`;
          const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
          await this.sendgrid.listingDeleted(
            listingToDelete.user.email,
            card,
            redirectUrl,
            unsubscribe
          );
        }
        /* check name of the method */
        notifications.listingPromoted(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public pauseEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const eventToPause: any = await this.events.findById(id);
      if (!eventToPause) {
        throw eventNotFoundException('Event not found');
      }

      await this.events.pauseById(id);
      /* send email */
      if (MAILER_ENABLED) {
        let image =
          'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
        const file = await this.s3.getObjectslistFromFolder(
          `${ENV}/${eventToPause.publisher_id}/${EVENTS_PATH}/${eventToPause.id}/banner`
        );
        if (file && file.Contents.length > 0) {
          image = `https://${S3_BUCKET}.s3.amazonaws.com/${file.Contents[0].Key}`;
        }

        const event = {
          title: eventToPause.title,
          image
        };
        const redirectUrl = `${FE_URL}/app/event?tab=pending`;
        const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
        await this.sendgrid.eventPaused(
          eventToPause.publisher.email,
          event,
          redirectUrl,
          unsubscribe
        );
        const notification: any = {
          user_id: eventToPause.publisher_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.EVENT_PAUSED,
          seen: false,
          title: $EventPaused.title,
          message: $EventPaused.message,
          data: {event: eventToPause.id}
        };
        await this.notifications.create(notification as any);
        notifications.ticketRedeemed(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Paused'});
    } catch (error) {
      next(error);
    }
  };

  public unpauseListing = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const listingToUnpause = await this.listings.findById(id);
      if (!listingToUnpause) {
        throw listingNotFoundException('Event not found');
      }

      await this.listings.unpauseById(id);

      res.status(STATUS_CODES.OK).json({message: 'Event Unpaused'});
    } catch (error) {
      next(error);
    }
  };

  public highlightEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const eventToHighlight: any = await this.events.findById(id);
      if (!eventToHighlight) {
        throw eventNotFoundException('Event not found');
      }

      // check if was promoted
      if (
        eventToHighlight.eventPackage &&
        eventToHighlight.eventPackage.filter(
          (eventPackage) =>
            eventPackage.active &&
            eventPackage.paused_at === null &&
            eventPackage.promote_package
        ).length > 0
      ) {
        await this.events.highlightById(id);
      } else {
        throw highlightWithoutPromoteException(
          'Cannot highlight a not promoted Event'
        );
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Highlighted'});
    } catch (error) {
      next(error);
    }
  };

  public cancelHighlightEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const eventToCancelHighlight = await this.events.findById(id);
      if (!eventToCancelHighlight) {
        throw eventNotFoundException('Event not found');
      }

      await this.events.cancelhighlightById(id);

      res.status(STATUS_CODES.OK).json({message: 'Event Highlight removed'});
    } catch (error) {
      next(error);
    }
  };

  public promoteEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser = req.user;
      const promoteData = req.body;

      const eventToPromote = await this.events.findById(id);
      if (!eventToPromote) {
        throw listingNotFoundException('Event not found');
      }

      const eventActivePackage = await this.eventPackages.findActivePackage(id);

      const data: any = {
        event_id: id,
        promote_package_id: promoteData.promote_package_id,
        created_by: currentUser.id,
        updated_at: null,
        updated_by: null,
        paused_at: null
      };

      if (eventActivePackage) {
        await this.eventPackages.create({
          ...data,
          active: false,
          activated_at: null
        });
      } else {
        await this.eventPackages.create({
          ...data,
          active: true,
          activated_at: getISONow()
        });
      }
      /*
      if (NOTIFICATION_ENABLED) {
        const notification = {
          user_id: listingToPromote.user_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.LISTING_PROMOTED,
          seen: false,
          message: `Listing ${listingToPromote.id} promoted for user: ${listingToPromote.user_id}`
        };
        await this.notifications.create(notification as any);
        notifications.listingPromoted(notification);
      }
      */
      res.status(STATUS_CODES.OK).json({message: 'Event Promoted'});
    } catch (error) {
      next(error);
    }
  };

  public approveEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = req.body;
      const daysOfWaiting = [30, 60];

      const eventToApprove: any = await this.events.findById(id);  
      if (!eventToApprove) {
        throw eventNotFoundException('Event not found');
      }

      // delete previous Flags, only 1 active at the moment
      const eventApproveUpdated =
        await this.EventApproval.updateReportsByEventId(id, {
          deleted_at: getISONow()
        });

      await this.events.approveEvent(id);

      let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
      if (eventToApprove.has_banner) {
        image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToApprove.publisher.id}/${EVENTS_PATH}/${eventToApprove.id}/banner`;
      }

      /* cron to unpublish the event */
      const endDate = DateTime.fromJSDate(eventToApprove.end_at, {zone: 'utc'})
        .plus({hours: Number(eventToApprove.timezone.utc_offset)})
        .plus({minutes: 15})
        .toISO()
      const cronTime: string = ISOtoCron(endDate);
      schedule(cronTime, async () => {
        try {
          await prisma.event.update({
            data: {
              status_id: LISTING_STATUS.INACTIVE
            },
            where: {
              id: eventToApprove.id
            }
          });      
          /*
          await this.events.updateById(id, {
            status_id: LISTING_STATUS.INACTIVE
          });
          */
          console.log(`Event ${id} unpublished`);
        } catch (error) {
          console.error('Error on unpublish:', error);
        }
      });

      /* cron to send check u dashboard notification 30/60 days */

      for (const day of daysOfWaiting) {
        if (isFutureDate(eventToApprove.start_at)) {
          const cronTimeThirtyDaysNotification = DateTime.fromJSDate(
              eventToApprove.end_at,
              {zone: 'utc'}
            )
            .minus({days: day})
            .toISO();
          const cronNotificationThirtyDays: string = ISOtoCron(
            cronTimeThirtyDaysNotification
          );
        
          schedule(cronNotificationThirtyDays, async () => {
            try {
              if (NOTIFICATION_ENABLED) {
                const thirtyDaysNotification: any = {
                  user_id: eventToApprove.publisher_id,
                  scope: UserRoles.USER,
                  type: NOTIFICATION_TYPE.CHECK_YOUR_DASHBOARD,
                  seen: false,
                  title: $CheckDashboard.title,
                  message: $CheckDashboard.message,
                  data: {event: eventToApprove.id, banner: image}
                };
                await prisma.notification.create({
                  data: thirtyDaysNotification
                });
                notifications.eventCheckDashboard(thirtyDaysNotification);
              }
              /* send email */
              if (MAILER_ENABLED) {
                const event = {
                  title: eventToApprove.title,
                  value: day,
                  image
                };
                const redirectUrl = `${FE_URL}/event-detail/${eventToApprove.id}`;
                const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
                await this.sendgrid.checkYourDashboard(
                  eventToApprove.publisher.email,
                  event,
                  redirectUrl,
                  unsubscribe,
                  day.toString()
                );
              }
            } catch (error) {
              console.error('Error on eventCheckDashboard:', error);
            }
          });
        }
      }
      /* cron for sales end date */
      if (eventToApprove.ticket_close_time) {
        const cronTimeCloseTicket = DateTime.fromJSDate(
          eventToApprove.ticket_close_time,
          {zone: 'utc'}
        )
        .toISO();

        const cronTimeSalesEnd: string = ISOtoCron(
          cronTimeCloseTicket
        );
        if (NOTIFICATION_ENABLED) {
          schedule(cronTimeSalesEnd, async () => {
            try {
              const notification: any = {
                user_id: eventToApprove.publisher_id,
                scope: UserRoles.USER,
                type: NOTIFICATION_TYPE.TICKET_SALE_ENDEND,
                seen: false,
                title: $TicketSaleEnd.title,
                // message: `Listing ${pack.listing.id} will expire in ${daysToExpire} day${daysToExpire > 1 ? 's' : ''}`
                message: $TicketSaleEnd.message,
                data: {event: eventToApprove.id, banner: image }
              };
              const notificationId = await prisma.notification.create({
                data: notification
              });
              notification.id = notificationId.id;
              notification.created_at = notificationId.created_at;
              notifications.listingAboutToExpire(notification);

              // email

              const event = {
                title: eventToApprove.title,
                image
              };
              const redirectUrl = `${FE_URL}/app/event`;
              const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
              await this.sendgrid.eventExpired(
                eventToApprove.publisher.email,
                event,
                redirectUrl,
                unsubscribe
              );
            } catch (error) {
              console.error('Error on salesEnded:', error);
            }
          });
        }
      }

      /* create notification */
      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: eventToApprove.publisher_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.EVENT_APPROVED,
          seen: false,
          title: $EventApproved.title,
          message: $EventApproved.message,
          data: {event: eventToApprove.id, banner: image}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;

        notifications.eventApproved(notification);
      }
      /* send email */
      if (MAILER_ENABLED) {
        if (eventToApprove.has_banner){
          image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToApprove.publisher.id}/${EVENTS_PATH}/${eventToApprove.id}/banner`; 
        }else{
          image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG'
        }

        const event = {
          title: eventToApprove.title,
          image
        };
        const redirectUrl = `${FE_URL}/event-detail/${eventToApprove.id}`;
        const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
        await this.sendgrid.eventApproved(
          eventToApprove.publisher.email,
          redirectUrl,
          unsubscribe,
          event,
        );
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Approved'});
    } catch (error) {
      next(error);
    }
  };

  public reproveEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const eventToReprove: any = await this.events.findById(id);
      if (!eventToReprove) {
        throw eventNotFoundException('Event not found');
      }

      // delete previous Flags, only 1 active at the moment
      const eventReproveUpdated =
        await this.EventApproval.updateReportsByEventId(id, {
          deleted_at: getISONow()
        });

      await this.events.reproveEvent(id);
      for (const reason of data.reasons) {
        await this.EventApproval.createPending({
          event_id: id,
          reason_id: reason,
          explanation: data.explanation,
          new_changes: false,
        });
      }

      let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
      if (eventToReprove.has_banner) {
        image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToReprove.publisher.id}/${EVENTS_PATH}/${eventToReprove.id}/banner`;
      }
      /* create notification */
      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: eventToReprove.publisher_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.EVENT_REPROVED,
          seen: false,
          title: $EventReproved.title,
          message: $EventReproved.message,
          data: {event: eventToReprove.id, banner: image}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;

        notifications.eventReproved(notification);
      }
      /* send email */
      if (MAILER_ENABLED) {
        const event = {
          title: eventToReprove.title,
          image
        };
        const redirectUrl = `${FE_URL}/event-detail/${eventToReprove.id}`;
        const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
        await this.sendgrid.eventReproved(
          eventToReprove.publisher.email,
          redirectUrl,
          unsubscribe,
          event
        );
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Reproved'});
    } catch (error) {
      next(error);
    }
  };

  public denyEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const eventToDeny: any = await this.events.findById(id);
      if (!eventToDeny) {
        throw eventNotFoundException('Event not found');
      }

      if (data.reasons.length <= 0) {
        throw invalidFlagReasonsException('Invalid Deny Reasons');
      }
      // delete previous Flags, only 1 active at the moment
      const eventDenyUpdated = await this.EventApproval.updateReportsByEventId(
        id,
        {
          approved: false,
          deleted_at: getISONow()
        }
      );

      for (const reason of data.reasons) {
        await this.EventApproval.createPending({
          event_id: id,
          approved: false,
          reason_id: reason,
          explanation: data.explanation,
          denied_at: getISONow()
        });
      }

      /* change event status */
      await this.events.denyEvent(eventToDeny.id);

      let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
      if (eventToDeny.has_banner) {
        image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToDeny.publisher.id}/${EVENTS_PATH}/${eventToDeny.id}/banner`;
      }

      /* create notification */
      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: eventToDeny.publisher_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.EVENT_DENIED,
          seen: false,
          title: $EventDenied.title,
          message: $EventDenied.message,
          data: {event: eventToDeny.id, banner: image}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;

        notifications.eventDenied(notification);
      }
      /* send email */
      if (MAILER_ENABLED) {
        const event = {
          title: eventToDeny.title,
          image
        };
        const redirectUrl = `${FE_URL}/app/event?tab=pending_events`;
        const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
        await this.sendgrid.eventDenied(
          eventToDeny.publisher.email,
          event,
          redirectUrl,
          unsubscribe
        );
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Denied'});
    } catch (error) {
      next(error);
    }
  };

  public flagEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const data = req.body;

      const eventToFlag: any = await this.events.findById(id);
      if (!eventToFlag) {
        throw eventNotFoundException('Event not found');
      }

      // todo: add control if any reason_id does not exist in listing_flag_report_reason, throw exception
      if (data.reasons.length <= 0) {
        throw invalidFlagReasonsException('Invalid Flag Reasons');
      }
      // delete previous Flags, only 1 active at the moment
      const flagsUpdated = await this.eventFlag.updateFlagged(id, {
        deleted_at: getISONow(),
        dismissed: true
      });

      await this.eventFlag.createFlagged({
        event_id: id,
        reasons_id: data.reasons,
        explanation: data.explanation,
        dismissed: false,
        new_changes: false
      });

      await this.events.flagById(id);

      let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
      if (eventToFlag.has_banner) {
        image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToFlag.publisher.id}/${EVENTS_PATH}/${eventToFlag.id}/banner`;
      }

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: eventToFlag.publisher_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.EVENT_FLAGGED,
          seen: false,
          title: $EventFlaged.title,
          // message: `Listing ${listingToFlag.id} flagged for user: ${listingToFlag.user_id}`
          message: $EventFlaged.message,
          data: {event: eventToFlag.id, banner: image}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        if (MAILER_ENABLED) {
          const card = {
            title: eventToFlag.title,
            category: `${eventToFlag.subcategory.category.name} > ${eventToFlag.subcategory.name}`,
            vendor: eventToFlag.publisher.full_name,
            link: `${FE_URL}/event-detail/${eventToFlag.id}`,
            changes: 'Need Corrections'
          };
          const redirectUrl = `${FE_URL}/${FE_FLAGGED}`;
          const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
          if (flagsUpdated.count > 1) {
            await this.sendgrid.eventFlaggedDenied(
              eventToFlag.publisher.email,
              redirectUrl,
              unsubscribe,
              card
            );
          } else {
            await this.sendgrid.eventFlagged(
              eventToFlag.publisher.email,
              redirectUrl,
              unsubscribe,
              card
            );
          }
        }
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Flagged'});
    } catch (error) {
      next(error);
    }
  };

  public unflagEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const eventToUnpause: any = await this.events.findById(id);
      if (!eventToUnpause) {
        throw eventNotFoundException('Event not found');
      }

      await this.eventFlag.updateFlagged(id, {
        deleted_at: getISONow(),
        dismissed: true
      });

      await this.eventFlag.updateReportsByEventId(id, {
        dismissed: true
      });

      await this.events.unflagById(id);

      let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
      if (eventToUnpause.has_banner) {
        image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToUnpause.publisher.id}/${EVENTS_PATH}/${eventToUnpause.id}/banner`;
      }

      if (NOTIFICATION_ENABLED) {
        const notification: any = {
          user_id: eventToUnpause.publisher_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.EVENT_FLAG_APPROVED,
          seen: false,
          title: $EventFlagedApproved.title,
          // message: `Listing ${listingToUnpause.id} flagged for user: ${listingToUnpause.user_id}`
          message: $EventFlagedApproved.message,
          data: {listing: eventToUnpause.id, banner: image}
        };
        const notificationId = await this.notifications.create(
          notification as any
        );
        notification.id = notificationId.id;
        notification.created_at = notificationId.created_at;
        if (MAILER_ENABLED) {
          const card = {
            title: eventToUnpause.title,
            category: `${eventToUnpause.subcategory.category.name} > ${eventToUnpause.subcategory.name}`,
            vendor: eventToUnpause.publisher.full_name,
            link: `${FE_URL}/event-detail/${eventToUnpause.id}`
          };
          const redirectUrl = `${FE_URL}/${FE_DASHBOARD}`;
          const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
          await this.sendgrid.eventFlaggedAproved(
            eventToUnpause.publisher.email,
            redirectUrl,
            unsubscribe,
            card
          );
        }
      }

      res.status(STATUS_CODES.OK).json({message: 'Event Unflagged'});
    } catch (error) {
      next(error);
    }
  };

  private checkPhotosByMetadata = async (
    listing: Partial<Listing>,
    updateListingData: Partial<any>
  ): Promise<string[]> => {
    const newImages = [];
    const updateImages = updateListingData.images;

    let i = 0;
    for await (const image of updateImages) {
      //if image it's new
      if (image.data) {
        const position = image.position;
        const imageUrl = await this.uploadImage(
          image.data,
          `${ENV}/${listing.user_id}/${LISTING_PATH}/${listing.id}/`,
          `static_${i++}`
        );
        newImages[position] = imageUrl;
      } else if (image.url) {
        //if image already exist
        const url = image.url;
        const position = image.position;
        newImages[position] = url;
      }
    }
    //check if any of the listings images was deleted
    for await (const image of listing.images) {
      if (!newImages.includes(image)) {
        this.s3.remove(image);
      }
    }
    return newImages;
  };

  private uploadImage = async (
    image: string,
    path: string,
    name: string
  ): Promise<string> => {
    const imgFmt = ImageFormat.webp;
    this.imageManip.setImage(
      Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    await this.imageManip.convert(imgFmt);
    const processed = this.imageManip.getProcessed();
    const url = await this.s3.upload(path, name, processed.converted, {
      contentEncoding: 'base64',
      contentType: imgFmt
    });
    return url;
  };
}

export default EventsController;

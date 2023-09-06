import fs from 'fs';
import {NextFunction, Request, Response} from 'express';
import {Event, EventTermsEvents, User} from '@prisma/client';
import prisma from '@/db';
import {DateTime} from 'luxon';
import {STATUS_CODES, UserRoles} from '@/constants';
import {CreateEventsDto, UpdateEventDto} from '@/dtos/events.dto';
import {
  BookmarkService,
  EventsService,
  LiveStreamingService,
  SendGridService,
  TicketService,
  UserService,
  EventLocationService
} from '@/services';
import {ValidationService} from '@/services';
import {LISTING_STATUS} from '@/constants/listingStatus';
import {
  eventCantPublishException,
  eventNotFoundException,
  eventTooManyImagesException,
  eventUnathorizedException,
  eventCantEditException,
  eventStillInReviewException,
  ticketDuplicateNameException,
  invalidEventStatusException
} from '@/errors/event.error';
import {diffToNowForHumans, getISONow, isPastDate} from '@/utils/time';
import {S3} from '@/services';
import config from '@/config';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {EventFlagReportService} from '@/services';
import notifications from '@/notifications';
import {NotificationService} from '@/services/notification.service';
import {OrganizerService} from '@/services/organizers.service';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import {ListingPackageService} from '@/services/listingPackage.service';
import isbot from 'isbot';
import {ImageFormat, ImageManip} from '@/utils/imageManip';
import {ListingFlagService} from '@/services/admin/listingFlag.service';
import {GetAllEvent} from '@/interfaces/events.interface';
import {EventTermsService} from '@/services/eventTerms.service';
import {EventTicketTypeService} from '@/services/eventTicketType.services';
import {TICKET_CATEGORY} from '@/constants/ticketCategory';
import {EventPackageService} from '@/services/eventPackage.service';
import {EventApprovalService} from '@/services/admin/eventApproval.service';
import {getEventStatus} from '@/utils/salesStatus';
import {EVENT_MANAGEMENT_TYPE} from '@/constants/eventStatus';
import {isFutureDate} from '@/utils/time';

const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const NOTIFICATION_ENABLED = config.notification_service.enabled;
const MAILER_ENABLED = config.mailer.enabled;
const EVENTS_PATH = 'Event';
const ENV = config.environment;
const FE_URL = config.frontend.url;
const FE_UNSUSCRIBE_ENDP = config.frontend.endpoints.unsuscribe;
const FE_ADMIN_FLAGGED = config.frontend.endpoints.admin_flagged;
const PUBLISH_WITHOUT_APPROVAL = config.event.publishWithoutApproval;
const MAX_NUMBER_FILES = 6;

interface EventImages {
  position: number;
  data?: string;
  url?: string;
}
class EventsController {
  public events = new EventsService();
  public eventsPackages = new EventPackageService();

  public flagReport = new EventFlagReportService();
  public listingsFlag = new ListingFlagService();
  public bookmarks = new BookmarkService();
  public users = new UserService();
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public imageManip = new ImageManip();
  private validation = new ValidationService();
  private user = new UserService();
  private notifications = new NotificationService();
  private sendgrid = new SendGridService();
  private organizers = new OrganizerService();
  private termAndConditions = new EventTermsService();
  private eventTicketsService = new EventTicketTypeService();
  private liveStreamingService = new LiveStreamingService();
  private event_location = new EventLocationService();
  private event_approval = new EventApprovalService();

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
        events[i]['expiry'] = diffToNowForHumans(events[i].created_at);
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
        /*
        const files = await this.s3.getObjectslistFromFolder(
          `${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}`
        );
        const images = files.Contents.filter((file) =>
          file.Key.includes('static_')
        );

        if (images.length > 0) {
          events[i]['images'] = images.map(
            (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
          );
        }
        if (events[i].has_banner) {
          const banner = files.Contents.filter((file) =>
            file.Key.includes('banner')
          );
          if (banner.length > 0) {
            events[i]['banner'] = banner.map(
              (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
            );
          }
        }
        */
        if (events[i].has_banner) {
          events[i]['banner'] = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}/banner`;
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

  public getEventsMe = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const params = req.query;

      const eventsData: Partial<GetAllEvent> = await this.events.findByUser(
        user.id,
        params,
        true
      );
      const {events, highlighted, total, cursor, pages} = eventsData;

      // fix: remove promoted property
      for (let i = 0; i < events.length; ++i) {
        events[i]['expiry'] = diffToNowForHumans(events[i].created_at);
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

        const files = await this.s3.getObjectslistFromFolder(
          `${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}`
        );
        /*
        const images = files.Contents.filter((file) =>
          file.Key.includes('static_')
        );
        if (images.length > 0) {
          events[i]['images'] = images.map(
            (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
          );
        }
        if (events[i].has_banner) {
          const banner = files.Contents.filter((file) =>
            file.Key.includes('banner')
          );
          if (banner.length > 0) {
            events[i]['banner'] = banner.map(
              (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
            );
          }
        }
      
        */

        if (events[i].has_banner) {
          events[i]['banner'] = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${events[i].publisher.id}/${EVENTS_PATH}/${events[i].id}/banner`;
        }
        
        if (events[i].status.id === LISTING_STATUS.PENDING) {
          const reviews = await this.event_approval.getReportByEventId(events[i].id);
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
        data: {events, highlighted, total, cursor, pages},
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };

  public getEventById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findEvent: any = await this.events.findById(id);
      if (!findEvent) {
        throw eventNotFoundException('Event not found');
      }

      /*
      if (
        findEvent.listing_packages.length > 0 &&
        findEvent.listing_packages.filter(
          (listingPackage) =>
            listingPackage.active &&
            listingPackage.paused_at === null &&
            listingPackage.promote_package
        ).length > 0
      ) {
        findEvent['promoted'] = true;
      } else {
        findEvent['promoted'] = false;
      }
      */
      /*
      if (findEvent.images) {
        for await (const image of findEvent.images) {
          const key = findEvent.images.indexOf(image);
          const imageName = image.split('.com/');
          const metadata = await this.s3.getMetaData(imageName[1]);
          findEvent.images[key] = {
            position: key,
            url: image,
            metadata
          };
        }
      }
      */
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

      if (!req.user && findEvent.contact) {
        Object.keys(findEvent.contact).map((key) => {
          findEvent.contact[key] = findEvent.contact[key].replace(/./g, '*');
        });
      }
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
      
      findEvent['sales_status'] = await getEventStatus(findEvent);
      res.status(STATUS_CODES.OK).json({data: findEvent, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public createEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventData: CreateEventsDto = req.body;
      const images = [];
      
      const data = {
        subcategory: {
          connect: {
            id: eventData.subcategory_id
          }
        },
        start_at: new Date(eventData.schedule.start_date),
        end_at: new Date(eventData.schedule.end_date),
        timezone: {
          connect: {
            id: eventData.schedule.timezone_id
          }
        },
        title: eventData.title,
        description: eventData.description,
        has_banner: false,
        has_ticket: eventData.has_ticket,
        contact_information: {
          email: eventData.email,
          phone: eventData.phone,
          full_name_contact: eventData.full_name_contact
        },
        website: eventData.website,
        // venue_location: {},
        highlighted: false,
        publisher: {
          connect: {
            id: req.user.id
          }
        },
        status: {
          connect: {
            id: LISTING_STATUS.DRAFT
          }
        }
      };

      const createdEvent:any = await this.events.create(data as any);
      if (!createdEvent) {
        throw new Error('Server Error');
      }

      // organizers
      if (eventData.organizers) {
        for (const organizerInfo of eventData.organizers) {
          const organizerData = {
            ...organizerInfo,
            event_id: createdEvent.id
          };
          await this.organizers.create(organizerData as any);
        }
      }
      if (eventData.live_streaming) {
        for (const liveStream of eventData.live_streaming) {
          await this.liveStreamingService.create({
            event_id: createdEvent.id,
            media_id: liveStream.media_id,
            url: liveStream.url,
            description: liveStream.description
          });
        }
      }
      // terms and Condition
      if (eventData.terms_and_conditions) {
        for (const termsAndCondition of eventData.terms_and_conditions) {
          const termsAndConditionData = {
            term: termsAndCondition.term
          };
          const lastCreated = await this.termAndConditions.create(
            termsAndConditionData as any
          );
          const data = {
            event_id: createdEvent.id,
            term_id: lastCreated.id
          };
          await prisma.eventTermsEvents.create({data});
        }
      }
      // tickets
      if (eventData.tickets_info) {
        // check if a ticket name, repeats
        const ticketsNames = eventData.tickets_info.tickets.map(
          (item) => item.name
        );
        let duplicateExist = false;
        duplicateExist = ticketsNames.some(
          (element, index) => ticketsNames.indexOf(element) !== index
        );
        if (duplicateExist) {
          throw ticketDuplicateNameException("Ticket name can't be duplicate");
        }

        await this.events.updateById(createdEvent.id, {
          ticket_close_time: new Date(eventData.tickets_info.close_date)
        });
        if (eventData.tickets_info?.tickets?.length > 0) {
          for (const ticketType of eventData.tickets_info.tickets) {
            await this.eventTicketsService.create({
              event_id: createdEvent.id,
              type_id: ticketType.paid
                ? TICKET_CATEGORY.PAID
                : TICKET_CATEGORY.FREE,
              name: ticketType.name,
              quantity_avaible: ticketType.quantity,
              unit_price: ticketType.paid ? ticketType.price : 0,
              max_quantity_order: ticketType.maxOrder,
              description: ticketType.description,
              valid_for: ticketType.valid_for.map((date) => new Date(date)),
              active: true
            });
          }
        }
      }
      // banner
      if (eventData.banner) {
        const i = 0;
        await this.uploadBanner(createdEvent, eventData.banner);
        await this.events.updateById(createdEvent.id, {has_banner: true});
      }

      // locations
      if (eventData.location) {
        const data: any = eventData.location;
        await this.event_location.create({
          ...data,
          event_id: createdEvent.id
        });
      }

      // images
      if (eventData.images.length > MAX_NUMBER_FILES) {
        throw eventTooManyImagesException('Too many files');
      }

      if (eventData.images.length > 0) {
        for await (const image of eventData.images) {
          const imageUrl = await this.uploadImage(
            createdEvent,
            image.data,
            image.position
          );
          images.push(imageUrl);
        }
        await this.events.updateById(createdEvent.id, {has_banner: true});
      }
      
      res
        .status(STATUS_CODES.CREATED)
        .json({data: {id: createdEvent.id}, message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public updateEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: any = req.body;
      const currentUser: User = req.user;

      // controls
      const eventToUpdate: any = await this.events.findById(id);
      if (!eventToUpdate) {
        throw eventNotFoundException('Event not found');
      }

      if (eventToUpdate.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }

      const expirationDate = isPastDate(eventToUpdate.end_at);

      if (eventToUpdate.status.id === LISTING_STATUS.ACTIVE || expirationDate) {
        throw eventCantEditException("Can't edit this event");
      }

      // if the event is still in review by an Admin, it won't be updated
      const report = await this.event_approval.getReportByEventId(id);
      if (report.length > 0) {
        if (report.some((value) => value.new_changes === true)) {
          throw eventStillInReviewException(
            "Can't edit this event, still in review"
          );
        }
      }

      // data
      const data = {
        start_at: new Date(updateData.schedule.start_date),
        end_at: new Date(updateData.schedule.end_date),
        timezone: {
          connect: {
            id: updateData.schedule.timezone_id
          }
        },
        title: updateData.title,
        description: updateData.description,
        has_banner: false,
        has_ticket: updateData.has_ticket,
        contact_information: {
          email: updateData.email,
          phone: updateData.phone,
          full_name_contact: updateData.full_name_contact
        },
        website: updateData.website,
        highlighted: false,
        publisher: {
          connect: {
            id: req.user.id
          }
        }
      };
      // organizers
      if (updateData.organizers) {
        const existingOrganizers = await eventToUpdate.event_organizer.map(
          (organizer) => organizer.id
        );
        for (const organizerInfo of updateData.organizers) {
          if (organizerInfo.id) {
            await this.organizers.updateById(organizerInfo.id, organizerInfo);
            if (
              existingOrganizers.length > 0 &&
              existingOrganizers.includes(organizerInfo.id)
            ) {
              const deleteItem = existingOrganizers.indexOf(organizerInfo.id);
              existingOrganizers.splice(deleteItem, 1);
            }
          } else {
            const organizerData = {
              ...organizerInfo,
              event_id: id
            };
            await this.organizers.create(organizerData as any);
          }
        }
        // remove if any organizer was deleted
        if (existingOrganizers.length > 0) {
          for (const deleteOrganizer of existingOrganizers) {
            await this.organizers.delete(deleteOrganizer);
          }
        }
      }
      // liveStreaming
      if (updateData.live_streaming) {
        const existingLiveStreams = await eventToUpdate.LiveStreaming.map(
          (liveStream) => liveStream.id
        );
        for (const liveStream of updateData.live_streaming) {
          if (liveStream.id) {
            await this.liveStreamingService.updateById(
              liveStream.id,
              liveStream
            );
            if (
              existingLiveStreams.length > 0 &&
              existingLiveStreams.includes(liveStream.id)
            ) {
              const deleteItem = existingLiveStreams.indexOf(liveStream.id);
              existingLiveStreams.splice(deleteItem, 1);
            }
          } else {
            await this.liveStreamingService.create({
              event_id: updateData.id,
              media_id: liveStream.media_id,
              url: liveStream.url,
              description: liveStream.description
            });
          }
        }
        // remove if any liveStream was deleted
        if (existingLiveStreams.length > 0) {
          for (const deleteLiveStream of existingLiveStreams) {
            await this.liveStreamingService.delete(deleteLiveStream);
          }
        }
      }

      // terms and Condition
      if (updateData.terms_and_conditions) {
        const existingTermsAndCondition = await eventToUpdate.terms_event.map(
          (term) => term.event_term.id
        );
        for (const termsAndCondition of updateData.terms_and_conditions) {
          if (termsAndCondition.id) {
            await this.termAndConditions.updateById(termsAndCondition.id, {
              term: termsAndCondition.term
            });
            if (
              existingTermsAndCondition.length > 0 &&
              existingTermsAndCondition.includes(termsAndCondition.id)
            ) {
              const deleteItem = existingTermsAndCondition.indexOf(
                termsAndCondition.id
              );
              existingTermsAndCondition.splice(deleteItem, 1);
            }
          } else {
            const termsAndConditionData = {
              term: termsAndCondition.term
            };
            const lastCreated = await this.termAndConditions.create(
              termsAndConditionData as any
            );
            const termData = {
              event_id: id,
              term_id: lastCreated.id
            };
            await prisma.eventTermsEvents.create({data: termData});
          }
        }
        // remove if any term was deleted
        if (existingTermsAndCondition.length > 0) {
          for (const deleteTerm of existingTermsAndCondition) {
            await prisma.eventTermsEvents.delete({
              where: {
                event_id_term_id: {
                  event_id: id,
                  term_id: deleteTerm
                }
              }
            });
            await this.termAndConditions.delete(deleteTerm);
          }
        }
      }

      // tickets
      if (updateData.tickets_info) {
        // check if a ticket name, repeats
        const ticketsNames = updateData.tickets_info.tickets.map(
          (item) => item.name
        );
        let duplicateExist = false;
        duplicateExist = ticketsNames.some(
          (element, index) => ticketsNames.indexOf(element) !== index
        );
        if (duplicateExist) {
          throw ticketDuplicateNameException("Ticket name can't be duplicate");
        }

        await this.events.updateById(id, {
          ticket_close_time: new Date(updateData.tickets_info.close_date)
        });
        if (updateData.tickets_info?.tickets?.length > 0) {
          for (const ticketType of updateData.tickets_info.tickets) {
            if (ticketType.id) {
              await this.eventTicketsService.updateById(ticketType.id, {
                event_id: id,
                type_id: ticketType.paid
                  ? TICKET_CATEGORY.PAID
                  : TICKET_CATEGORY.FREE,
                name: ticketType.name,
                quantity_avaible: ticketType.quantity,
                unit_price: ticketType.paid ? ticketType.price : 0,
                max_quantity_order: ticketType.maxOrder,
                description: ticketType.description,
                valid_for: ticketType.valid_for.map((date) => new Date(date))
              });
            } else {
              await this.eventTicketsService.create({
                event_id: id,
                type_id: ticketType.paid
                  ? TICKET_CATEGORY.PAID
                  : TICKET_CATEGORY.FREE,
                name: ticketType.name,
                quantity_avaible: ticketType.quantity,
                unit_price: ticketType.paid ? ticketType.price : 0,
                max_quantity_order: ticketType.maxOrder,
                description: ticketType.description,
                valid_for: ticketType.valid_for.map((date) => new Date(date)),
                active: true
              });
            }
          }
        }

        // tODO: add control to delete tickets if any was sold
      }

      // locations
      if (updateData.location) {
        const locationData: any = updateData.location;
        await this.event_location.updateByEventId(id, {
          ...locationData,
          event_id: id
        });
      }

      // check banner and photos
      if (updateData.banner) {
        await this.uploadBanner(updateData, updateData.banner);
        data.has_banner = true;
      } else {
        // if the banner wasn't in updateDate, remove the banner in the bucket
        if (eventToUpdate.has_banner) {
          const fileKey = `${ENV}/${updateData.publisher.id}/${EVENTS_PATH}/${updateData.id}/banner`;
          await this.s3.remove(fileKey);
          data.has_banner = false;
        }
      }

      // image gallery
      await this.checkImages(eventToUpdate, updateData.images);
      await this.events.updateById(id, data);
      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      const eventToDelete: any = await this.events.findById(id);
      if (!eventToDelete) {
        throw eventNotFoundException('Event not found');
      }

      if (eventToDelete.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }

      const expirationDate = isPastDate(eventToDelete.end_at);

      if (eventToDelete.status.id === LISTING_STATUS.ACTIVE || expirationDate) {
        throw eventCantEditException("Can't delete this event");
      }

      await this.events.updateById(id, {
        // highlighted: false,
        status_id: LISTING_STATUS.INACTIVE,
        deleted_at: getISONow()
      });
      // await this.bookmarks.deleteByListing(id);
      await this.event_approval.updateReportsByEventId(id, {
        deleted_at: getISONow()
      });

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public publishEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      const eventToPublish: any = await this.events.findById(id);
      if (!eventToPublish) {
        throw eventNotFoundException('Event not found');
      }

      if (eventToPublish.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }

      if (
        eventToPublish.status.id !== LISTING_STATUS.DRAFT &&
        eventToPublish.status.id !== LISTING_STATUS.INACTIVE
      ) {
        throw eventCantPublishException('You cannot publish the event');
      }

      /*
      if (!eventToPublish.listing_packages) {
        throw eventWithoutActivePackageException(
          'The listing does not have an active package assigned'
        );
      }

      let activePackage = false;
      for (let i = 0; i < eventToPublish.listing_packages.length; ++i) {
        if (eventToPublish.listing_packages[i].active) {
          activePackage = true;
          break;
        }
      }

      if (!activePackage) {
        throw eventWithoutActivePackageException(
          'The listing does not have an active package assigned'
        );
      }
      */

      if (PUBLISH_WITHOUT_APPROVAL) {
        await this.events.updateById(id, {
          status_id: LISTING_STATUS.ACTIVE
        });
        res.status(STATUS_CODES.OK).json({message: 'Event published'});
      } else {
        await this.events.updateById(id, {
          status_id: LISTING_STATUS.PENDING
        });
        await this.event_approval.createPending({
          event_id: id,
          reason_id: null,
          explanation: null,
          new_changes: true,
          approved: false,
          deleted_at: null
        });

        const admins = await this.users.findAdmins();
        let notification: any;

        if (admins.length && NOTIFICATION_ENABLED) {
          for (const admin of admins) {
            notification = {
              user_id: admin.id,
              scope: UserRoles.ADMIN,
              type: NOTIFICATION_TYPE.NEW_EVENT_FOR_APPROVAL,
              seen: false,
              title:'New event for approval',
              message:'New event requires approval',
              data: {event: eventToPublish.id}
            };
            await this.notifications.create(notification as any);
            if (MAILER_ENABLED) {
              const event = {
                title: eventToPublish.title,
                category: `${eventToPublish.subcategory.category.name} > ${eventToPublish.subcategory.name}`,
                vendor: eventToPublish.publisher.full_name,
                link: `${FE_URL}/event-detail/${eventToPublish.id}`
              };
              const redirectUrl = `${FE_URL}/${FE_ADMIN_FLAGGED}`;
              const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
              await this.sendgrid.adminNewEventApproval(
                admin.email,
                event,
                redirectUrl,
                unsubscribe,
              );
            }
            notifications.adminNewEventApproval(notification);
          }
        }

        res.status(STATUS_CODES.OK).json({message: 'Event sent to revision'});
      }
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
      const currentUser: User = req.user;
      const promoteData = req.body;

      const eventToPromote: any = await this.events.findById(id);
      if (!eventToPromote) {
        throw eventNotFoundException('Event not found');
      }

      if (eventToPromote.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }

      const eventPackage = await this.eventsPackages.findActivePackage(id);
      await this.eventsPackages.promoteById(
        eventPackage.id,
        promoteData.promote_package_id,
        req.user.id
      );

      res.status(STATUS_CODES.OK).json({message: 'Event promoted'});
    } catch (error) {
      next(error);
    }
  };

  public reportEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = req.user;
      const report = req.body;

      const eventToReport: any = await this.events.findById(id);
      if (!eventToReport) {
        throw eventNotFoundException('Event not found');
      }

      const existingReports = await this.flagReport.findByUserId(user.id);
      const alreadyReported = !!existingReports.find((i) => i.event_id === id);

      await this.flagReport.create({
        user_id: user.id,
        event_id: id,
        reason_id: report.reason_id,
        explanation: report.explanation || ''
      } as any);

      let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
      if (eventToReport.has_banner) {
        image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${eventToReport.publisher.id}/${EVENTS_PATH}/${eventToReport.id}/banner`;
      }
      const admins = await this.users.findAdmins();
      let notification: any;
      if (admins.length && NOTIFICATION_ENABLED && !alreadyReported) {
        for (const admin of admins) {
          notification = {
            user_id: admin.id,
            scope: UserRoles.ADMIN,
            type: NOTIFICATION_TYPE.EVENT_REPORTED,
            seen: false,
            message: `Event "${eventToReport.title}" has been reported`,
            data: {event: eventToReport.id, banner: image}
          };
          await this.notifications.create(notification as any);
          if (MAILER_ENABLED) {
            const event = {
              title: eventToReport.title,
              category: `${eventToReport.subcategory.category.name} > ${eventToReport.subcategory.name}`,
              vendor: eventToReport.publisher.full_name,
              link: `${FE_URL}/event-detail/${eventToReport.id}`
            };
            const redirectUrl = `${FE_URL}/${FE_ADMIN_FLAGGED}`;
            const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
            await this.sendgrid.eventReported(
              admin.email,
              redirectUrl,
              unsubscribe,
              event
            );
          }
        }
        notifications.eventReproved(notification);
      }

      res.status(STATUS_CODES.OK).json({message: 'Event reported'});
    } catch (error) {
      next(error);
    }
  };

  public isReportedEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const user = req.user;
      let reported = false;

      const eventToReport: any = await this.events.findById(id);
      if (!eventToReport) {
        throw eventNotFoundException('event not found');
      }
      const existingReports = await this.flagReport.findByUserId(user.id);
      const alreadyReported = existingReports.find((i) => i.event_id === id);
      if (alreadyReported) {
        reported = true;
      }

      res.status(STATUS_CODES.OK).json({
        data: {reported},
        message: 'event is reported'
      });
    } catch (error) {
      next(error);
    }
  };

  /*
  private checkPhotosByMetadata = async (
    event: Partial<CreateEventsDto>,
    updateEventData: Partial<any>
  ): Promise<string[]> => {
    const newImages = [];
    const updateImages = updateEventData.images;
    let i = 0;

    for await (const image of updateImages) {
      //if image it's new
      if (image.data) {
        const position = image.position;
        const imageUrl = await this.uploadImage(event, image.data, i++);
        newImages[position] = imageUrl;
      } else if (image.url) {
        //if image already exist
        const url = image.url;
        const position = image.position;
        newImages[position] = url;
      }
    }
    //check if any of the listings images was deleted
    for await (const image of event.images) {
      if (!newImages.includes(image)) {
        this.s3.remove(image);
      }
    }

    return newImages;
  };
  */
  private checkImages = async (
    event: Partial<Event>,
    imageData: Partial<EventImages[]>
  ): Promise<void> => {
    //get data already uploaded
    const files = await this.s3.getObjectslistFromFolder(
      `${ENV}/${event.publisher_id}/${EVENTS_PATH}/${event.id}/static_`
    );

    const images = files.Contents;
    

    let filesToDelete = []; 
    if (imageData.length > 0) {
      const incomingFiles = imageData.filter((file) => file.url && file.url.includes('static_')).map((file) => file.url);
      for (const image of images) {
        if (!incomingFiles.includes(image.Key)) {
          filesToDelete.push(image);
        }
      }
    } else if (imageData.length <= 0 && images.length > 0) {
      filesToDelete = images;
    }
       
    for (const image of imageData) {
      // new images
      if (image.data) {
        await this.uploadImage(event, image.data, image.position);
      }

      // update images
      if (image.url ) {
        const name = image.url.split('static_');
        const lastPos = name[1].slice(0, 1);
        const dir = `${ENV}/${event.publisher_id}/${EVENTS_PATH}/${event.id}/`;
        const newName = `static_${name[1].replace(
          lastPos,
          String(image.position)
        )}`;
        
        if (lastPos !== String(image.position)) {
          this.s3.renameFile(image.url, dir + newName);
        }
      }
    }
    for (const fileToDelete of filesToDelete) {
      this.s3.remove(fileToDelete.Key);
    }
  };

  private uploadBanner = async (
    event: Partial<Event>,
    image: string
  ): Promise<string> => {
    const imgFmt = ImageFormat.webp;
    this.imageManip.setImage(
      Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    await this.imageManip.convert(imgFmt);
    const processed = this.imageManip.getProcessed();
    const url = await this.s3.upload(
      `${ENV}/${event.publisher_id}/${EVENTS_PATH}/${event.id}/`,
      `banner`,
      processed.converted,
      {
        contentEncoding: 'base64',
        contentType: imgFmt
      }
    );
    return url;
  };

  private uploadImage = async (
    event: Partial<Event>,
    image: string,
    idx: number
  ): Promise<string> => {
    const imgFmt = ImageFormat.webp;
    this.imageManip.setImage(
      Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64')
    );
    await this.imageManip.convert(imgFmt);
    const processed = this.imageManip.getProcessed();
    const timestamp = Date.now();
    const url = await this.s3.upload(
      `${ENV}/${event.publisher_id}/${EVENTS_PATH}/${event.id}/`,
      `static_${idx}_${timestamp}`,
      processed.converted,
      {
        contentEncoding: 'base64',
        contentType: imgFmt
      }
    );
    return url;
  };

  public shareEventById = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findListing: any = await this.events.findById(id);
      if (!findListing) {
        throw eventNotFoundException('Listing not found');
      }

      if (
        findListing.listing_packages.length > 0 &&
        findListing.listing_packages.filter(
          (listingPackage) =>
            listingPackage.active &&
            listingPackage.paused_at === null &&
            listingPackage.promote_package
        ).length > 0
      ) {
        findListing['promoted'] = true;
      } else {
        findListing['promoted'] = false;
      }

      if (findListing.images) {
        for await (const image of findListing.images) {
          const key = findListing.images.indexOf(image);
          const imageName = image.split('.com/');
          const metadata = await this.s3.getMetaData(imageName[1]);
          findListing.images[key] = {
            position: key,
            url: image,
            metadata
          };
        }
      }

      if (isbot(req.get('user-agent'))) {
        res.status(STATUS_CODES.OK).send(`
        <html>
          <head>
            <meta property="og:type" content="website" />
            <meta property="og:site_name" content="Desilist" />
            <meta property="og:url" content="${
              config.frontend.url
            }/api/listings/${id}/share" />
            <meta property="og:title" content="${findListing?.title}" />
            <meta property="og:description" content="${findListing?.description?.substring(
              0,
              50
            )}" />
            <meta property="og:image" content="${
              findListing?.images?.[0]
                ? findListing?.images?.[0]?.url
                : 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG'
            }"/>
            <meta property="og:image:type" content="image/webp" />
            <meta property="og:image:width" content="400"/>
            <meta property="og:image:height" content="300"/>
          </head>
          <body></body>
        </html>`);
      } else {
        res.redirect(
          STATUS_CODES.MOVED_PERMANENTLY,
          `${config.frontend.url}/listing-detail/${id}`
        );
      }
    } catch (error) {
      next(error);
    }
  };

  public updatePendingEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: any = req.body;
      const currentUser: User = req.user;

      const eventToUpdate: any = await this.events.findById(id);
      if (!eventToUpdate) {
        throw eventNotFoundException('Event not found');
      }

      if (eventToUpdate.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }

      const expirationDate = isPastDate(eventToUpdate.end_at);

      if (eventToUpdate.status.id === LISTING_STATUS.ACTIVE || expirationDate) {
        throw eventCantEditException("Can't edit this event");
      }

      // update data
      // data
      const data = {
        start_at: new Date(updateData.schedule.start_date),
        end_at: new Date(updateData.schedule.end_date),
        timezone: {
          connect: {
            id: updateData.schedule.timezone_id
          }
        },
        title: updateData.title,
        description: updateData.description,
        has_banner: false,
        has_ticket: updateData.has_ticket,
        contact_information: {
          email: updateData.email,
          phone: updateData.phone,
          full_name_contact: updateData.full_name_contact
        },
        website: updateData.website,
        highlighted: false,
        publisher: {
          connect: {
            id: req.user.id
          }
        }
      };
      // organizers
      if (updateData.organizers) {
        const existingOrganizers = await eventToUpdate.event_organizer.map(
          (organizer) => organizer.id
        );
        for (const organizerInfo of updateData.organizers) {
          if (organizerInfo.id) {
            await this.organizers.updateById(organizerInfo.id, organizerInfo);
            if (
              existingOrganizers.length > 0 &&
              existingOrganizers.includes(organizerInfo.id)
            ) {
              const deleteItem = existingOrganizers.indexOf(organizerInfo.id);
              existingOrganizers.splice(deleteItem, 1);
            }
          } else {
            const organizerData = {
              ...organizerInfo,
              event_id: id
            };
            await this.organizers.create(organizerData as any);
          }
        }
        // remove if any organizer was deleted
        if (existingOrganizers.length > 0) {
          for (const deleteOrganizer of existingOrganizers) {
            await this.organizers.delete(deleteOrganizer);
          }
        }
      }
      // liveStreaming
      if (updateData.live_streaming) {
        const existingLiveStreams = await eventToUpdate.LiveStreaming.map(
          (liveStream) => liveStream.id
        );
        for (const liveStream of updateData.live_streaming) {
          if (liveStream.id) {
            await this.liveStreamingService.updateById(
              liveStream.id,
              liveStream
            );
            if (
              existingLiveStreams.length > 0 &&
              existingLiveStreams.includes(liveStream.id)
            ) {
              const deleteItem = existingLiveStreams.indexOf(liveStream.id);
              existingLiveStreams.splice(deleteItem, 1);
            }
          } else {
            await this.liveStreamingService.create({
              event_id: updateData.id,
              media_id: liveStream.media_id,
              url: liveStream.url,
              description: liveStream.description
            });
          }
        }
        // remove if any liveStream was deleted
        if (existingLiveStreams.length > 0) {
          for (const deleteLiveStream of existingLiveStreams) {
            await this.liveStreamingService.delete(deleteLiveStream);
          }
        }
      }

      // terms and Condition
      if (updateData.terms_and_conditions) {
        const existingTermsAndCondition = await eventToUpdate.terms_event.map(
          (term) => term.event_term.id
        );
        for (const termsAndCondition of updateData.terms_and_conditions) {
          if (termsAndCondition.id) {
            await this.termAndConditions.updateById(termsAndCondition.id, {
              term: termsAndCondition.term
            });
            if (
              existingTermsAndCondition.length > 0 &&
              existingTermsAndCondition.includes(termsAndCondition.id)
            ) {
              const deleteItem = existingTermsAndCondition.indexOf(
                termsAndCondition.id
              );
              existingTermsAndCondition.splice(deleteItem, 1);
            }
          } else {
            const termsAndConditionData = {
              term: termsAndCondition.term
            };
            const lastCreated = await this.termAndConditions.create(
              termsAndConditionData as any
            );
            const data = {
              event_id: id,
              term_id: lastCreated.id
            };
            await prisma.eventTermsEvents.create({data});
          }
        }
        // remove if any term was deleted
        if (existingTermsAndCondition.length > 0) {
          for (const deleteTerm of existingTermsAndCondition) {
            await prisma.eventTermsEvents.delete({
              where: {
                event_id_term_id: {
                  event_id: id,
                  term_id: deleteTerm
                }
              }
            });
            await this.termAndConditions.delete(deleteTerm);
          }
        }
      }

      // tickets
      if (updateData.tickets_info) {
        // check if a ticket name, repeats
        const ticketsNames = updateData.tickets_info.tickets.map(
          (item) => item.name
        );
        let duplicateExist = false;
        duplicateExist = ticketsNames.some(
          (element, index) => ticketsNames.indexOf(element) !== index
        );
        if (duplicateExist) {
          throw ticketDuplicateNameException("Ticket name can't be duplicate");
        }

        await this.events.updateById(id, {
          ticket_close_time: new Date(updateData.tickets_info.close_date)
        });
        if (updateData.tickets_info?.tickets?.length > 0) {
          for (const ticketType of updateData.tickets_info.tickets) {
            if (ticketType.id) {
              await this.eventTicketsService.updateById(ticketType.id, {
                event_id: id,
                type_id: ticketType.paid
                  ? TICKET_CATEGORY.PAID
                  : TICKET_CATEGORY.FREE,
                name: ticketType.name,
                quantity_avaible: ticketType.quantity,
                unit_price: ticketType.paid ? ticketType.price : 0,
                max_quantity_order: ticketType.maxOrder,
                description: ticketType.description,
                valid_for: ticketType.valid_for.map((date) => new Date(date))
              });
            } else {
              await this.eventTicketsService.create({
                event_id: id,
                type_id: ticketType.paid
                  ? TICKET_CATEGORY.PAID
                  : TICKET_CATEGORY.FREE,
                name: ticketType.name,
                quantity_avaible: ticketType.quantity,
                unit_price: ticketType.paid ? ticketType.price : 0,
                max_quantity_order: ticketType.maxOrder,
                description: ticketType.description,
                valid_for: ticketType.valid_for.map((date) => new Date(date)),
                active: true
              });
            }
          }
        }

        // tODO: add control to delete tickets if any was sold
      }

      // locations
      if (updateData.location) {
        const data: any = updateData.location;
        const existingLocation:any = await this.event_location.findByEvenId(id)

        if (!existingLocation){
          await this.event_location.create({
            ...data,
            event_id:id
          });
        } else {
          await this.event_location.updateByEventId(id, {
            ...data,
            event_id: id
          });
        }
        
      }
      // check banner and photos
      if (updateData.banner) {
        await this.uploadBanner(updateData, updateData.banner);
        data.has_banner = true;
      } else {
        // if the banner wasn't in updateDate, remove the banner in the bucket
        if (eventToUpdate.has_banner) {
          const fileKey = `${ENV}/${updateData.publisher.id}/${EVENTS_PATH}/${updateData.id}/banner`;
          await this.s3.remove(fileKey);
          data.has_banner = false;
        }
      }
      // image gallery
      await this.checkImages(eventToUpdate, updateData.images);

      await this.events.updateById(id, data as any);

      // if the event is in approval process, update the status
      /*
      if (eventToUpdate.status_id === LISTING_STATUS.PENDING) {
        await this.event_approval.updateNewChanges(id, true);
      }
      */

      const hasPending = await this.event_approval.getReportByEventId(id);
      if (hasPending.length) {
        await this.event_approval.updateNewChanges(id, true);
        const admins = await this.users.findAdmins();
        let notification: any;
        if (admins.length) {
          let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
          if (eventToUpdate.has_banner) {
            const file = await this.s3.getObjectslistFromFolder(
              `${ENV}/${eventToUpdate.publisher.id}/${EVENTS_PATH}/${eventToUpdate.id}/banner`
            );
            /*
            const banner = files.Contents.filter((file) =>
              file.Key.includes('banner')
            );
            if (banner.length > 0) {
              image = banner.map(
                (file) => `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
              );
            }
            */
            if (file && file.Contents.length > 0) {
              image = `https://${S3_BUCKET}.s3.amazonaws.com/${file.Contents[0].Key}`;
            }
          }
          // notify the admins of the changes
          for (const admin of admins) {
            if (admins.length && NOTIFICATION_ENABLED) {
              for (const admin of admins) {
                notification = {
                  user_id: admin.id,
                  scope: UserRoles.ADMIN,
                  type: NOTIFICATION_TYPE.EVENT_NEW_CHANGES,
                  seen: false,
                  message: `Event "${eventToUpdate.title}" has new changes`,
                  data: {event: eventToUpdate.id, banner: image}
                };
                await this.notifications.create(notification as any);
                if (MAILER_ENABLED) {
                  const event = {
                    title: eventToUpdate.title,
                    image
                  };
                  const redirectUrl = `${FE_URL}/app/event`;
                  const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
                  await this.sendgrid.eventUpdated(
                    admin.email,
                    event,
                    redirectUrl,
                    unsubscribe
                  );
                }
              }
              notifications.listingReported(notification);
            }
            if (MAILER_ENABLED) {
              const event = {
                title: eventToUpdate.title,
                category: `${eventToUpdate.subcategory.category.name} > ${eventToUpdate.subcategory.name}`,
                vendor: eventToUpdate.publisher.full_name,
                link: `${FE_URL}/event-detail/${eventToUpdate.id}`
              };
              const redirectUrl = `${FE_URL}/${FE_ADMIN_FLAGGED}`;
              const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
              await this.sendgrid.eventUpdated(
                admin.email,
                event,
                redirectUrl,
                unsubscribe
              );
            }
          }
        }
      }

      res.status(STATUS_CODES.OK).json({message: 'Sent for review'});
    } catch (error) {
      next(error);
    }
  };

  public getEventWhitAvaliableTickets = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {take} = req.query;

      const params = req.query;

      const eventsData: Partial<GetAllEvent> = await this.events.find(params);

      const {events} = eventsData;

      const eventsResult = [];

      let fromTake = 10;

      if (take) {
        fromTake = Number(take);
      }
      for (const event of events) {
        // const sales_status = await getEventStatus(event);
        // event['sales_status'] = sales_status;
        event['sales_status'] = await getEventStatus(event);
        let validateDate
        if (event.ticket_close_time){
          validateDate = isFutureDate(event.ticket_close_time);
        }else{
          validateDate = isFutureDate(event.end_date);
        }
      
        if (
          event['sales_status'] === EVENT_MANAGEMENT_TYPE.TICKETS_AVAILABLE &&
          validateDate
        ) {
          eventsResult.push(event);
        }
      }

      const data = {
        events: eventsResult,
        total: eventsResult.length,
        pages: Math.ceil(Number(eventsResult.length / fromTake))
      };
      res.status(STATUS_CODES.OK).json({
        data,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public getEventsAndListing = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;

      const data: Partial<any> = await this.events.findEventsAndListing(params);

      const list = data.list

      for (const item of list) {
        if(item.type == "event"){
          let eventPackages = item.event_package;
          if (
            eventPackages &&
            eventPackages.filter(
              (eventPackage) =>
                eventPackage.active &&
                eventPackage.paused_at === null &&
                eventPackage.promote_package_id
            ).length > 0
          ) {
            item['promoted'] = true;
          } else {
            item['promoted'] = false;
          }
          
  
          if (item.has_banner) {
            item['banner'] = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${item.user_id}/${EVENTS_PATH}/${item.id}/banner`;
          }else{
            item['banner'] = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
          }

          if(item.live_streaming_ids.length > 0){
            item['live_streaming'] = true;
            item['location'] = false;
          }else{
            item['live_streaming'] = false;
            item['location'] = true;
          }


        }else{
          let listingPackages = item.listing_package;
          if (
            listingPackages &&
            listingPackages.filter(
              (listingPackage) =>
                listingPackage.active &&
                listingPackage.paused_at === null &&
                listingPackage.promote_package
            ).length > 0
          ) {
            item['promoted'] = true;
          } else {
            item['promoted'] = false;
          }
          if(item.images.length > 0){
            item['banner'] = item.images[0]
          }
        }
      }

      res.status(STATUS_CODES.OK).json({
        data,
        message: 'findAll'
      });
    } catch (error) {
      next(error);
    }
  };

  public duplicateEvent = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const currentUser: User = req.user;

      // controls
      const eventToDuplicate: any = await this.events.findById(id);
      if (!eventToDuplicate) {
        throw eventNotFoundException('Event not found');
      }

      if (eventToDuplicate.publisher.id !== currentUser.id) {
        throw eventUnathorizedException('Insufficient Permissions');
      }

      if (eventToDuplicate.status_id !== LISTING_STATUS.DENIED) {
        throw invalidEventStatusException('Can\'t move to Draft, event is not Denied');
      }

      const images = [];
      const data = {
        subcategory: {
          connect: {
            id: eventToDuplicate.subcategory.id
          }
        },
        start_at: new Date(eventToDuplicate.start_at),
        end_at: new Date(eventToDuplicate.end_at),
        timezone: {
          connect: {
            id: eventToDuplicate.timezone.id
          }
        },
        title: eventToDuplicate.title,
        description: eventToDuplicate.description,
        has_banner: eventToDuplicate.has_banner,
        has_ticket: eventToDuplicate.has_ticket,
        contact_information: {
          email: eventToDuplicate.contact_information.email,
          phone: eventToDuplicate.contact_information.phone,
          full_name_contact: eventToDuplicate.contact_information.full_name_contact
        },
        website: eventToDuplicate.website,
        // venue_location: {},
        highlighted: false,
        publisher: {
          connect: {
            id: req.user.id
          }
        },
        status: {
          connect: {
            id: LISTING_STATUS.DRAFT
          }
        },
        ticket_close_time: eventToDuplicate.ticket_close_time,
      };

      const createdEvent:any = await this.events.create(data as any);
      if (!createdEvent) {
        throw new Error('Server Error');
      }

      // organizers
      if (eventToDuplicate.event_organizer) {
        for (const organizerInfo of eventToDuplicate.event_organizer) {
          const organizerData = {
            organization_name: organizerInfo.organization_name,
            hosted_by: organizerInfo.hosted_by,
            contact_number: organizerInfo.contact_number,
            email: organizerInfo.email,
            event_id: createdEvent.id
          };
          await this.organizers.create(organizerData as any);
        }
      }
      if (eventToDuplicate.LiveStreaming) {
        for (const liveStream of eventToDuplicate.LiveStreaming) {
          const data = {
            Event: {
              connect: {
                id: createdEvent.id
              }
            },
            media: {
              connect:{
                id: liveStream.media.id
              }
            },
            url: liveStream.url,
            description: liveStream.description
          }
          await this.liveStreamingService.create(data as any);
        }
      }
      // terms and Condition
      if (eventToDuplicate.terms_event) {
        for (const termsAndCondition of eventToDuplicate.terms_event) {
          const termsAndConditionData = {
            term: termsAndCondition.event_term.term
          };
          const lastCreated = await this.termAndConditions.create(
            termsAndConditionData as any
          );
          const data = {
            event_id: createdEvent.id,
            term_id: lastCreated.id
          };
          await prisma.eventTermsEvents.create({data});
        }
      }
      // tickets
      if (eventToDuplicate.Ticket_type) {
        // check if a ticket name, repeats
        /*
        const ticketsNames = eventToDuplicate.Ticket_type.map(
          (item) => item.name
        );
        let duplicateExist = false;
        duplicateExist = ticketsNames.some(
          (element, index) => ticketsNames.indexOf(element) !== index
        );
        if (duplicateExist) {
          throw ticketDuplicateNameException("Ticket name can't be duplicate");
        }
        */
        if (eventToDuplicate.Ticket_type > 0) {
          for (const ticketType of eventToDuplicate.Ticket_type) {
            await this.eventTicketsService.create({
              event_id: createdEvent.id,
              type_id: ticketType.type.id,
              name: ticketType.name,
              quantity_avaible: ticketType.quantity,
              unit_price: ticketType.paid ? ticketType.price : 0,
              max_quantity_order: ticketType.maxOrder,
              description: ticketType.description,
              valid_for: ticketType.valid_for,
              active: ticketType.active,
            });
          }
        }
      }

      // locations
      if (eventToDuplicate.venue_location?.[0]) {
        const data: any = {
          geometry_point: eventToDuplicate.venue_location?.[0].geometry_point,
          address_description: eventToDuplicate.venue_location?.[0].address_description,
          venue_name: eventToDuplicate.venue_location?.[0].venue_location,
          srid: eventToDuplicate.venue_location?.[0].srid,
          place_id: eventToDuplicate.venue_location?.[0].place_id,
          city: eventToDuplicate.venue_location?.[0].city,
          state: eventToDuplicate.venue_location?.[0].state,
          zipcode: eventToDuplicate.venue_location?.[0].zipcode,
          country: eventToDuplicate.venue_location?.[0].country,
          address: eventToDuplicate.venue_location?.[0].address,

        }; eventToDuplicate.venue_location;
        await this.event_location.create({
          ...data,
          event_id: createdEvent.id
        });
      }

      // banner and images
      /*
      if (eventData.images.length > MAX_NUMBER_FILES) {
        throw eventTooManyImagesException('Too many files');
      }

      if (eventData.images.length > 0) {
        for await (const image of eventData.images) {
          const imageUrl = await this.uploadImage(
            createdEvent,
            image.data,
            image.position
          );
          images.push(imageUrl);
        }
        await this.events.updateById(createdEvent.id, {has_banner: true});
      }
      */
      const files = await this.s3.getObjectslistFromFolder(
        `${ENV}/${eventToDuplicate.publisher.id}/${EVENTS_PATH}/${eventToDuplicate.id}`
      );    
      if (files.Contents.length){
        for (const file of files.Contents) {
          const origin  = `https://${S3_BUCKET}.s3.amazonaws.com/${file.Key}`
          const destiny = `${ENV}/${createdEvent.publisher.id}/${EVENTS_PATH}/${createdEvent.id}/${file.Key.split('/').slice(-1)[0]}`
          await this.s3.copyFile(origin, destiny);
        };
      }
     
      res
        .status(STATUS_CODES.CREATED)
        .json({data: {id: createdEvent.id}, message: 'Event moved to Draft'});
    } catch (error) {
      next(error);
    }
  };
}

export default EventsController;

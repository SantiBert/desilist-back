import {NextFunction, Request, Response} from 'express';
import {
  StripeService,
  CustomerService,
  EventPaymentService,
  EventPriceService,
  EventSubCategoryService,
  EventsService,
  SendGridService,
  TicketService
} from '@/services';
import { NotificationService } from '@/services/notification.service';
import {STATUS_CODES} from '@/constants';
import config from '@/config';
import {S3} from '@/services';
import {
  CancelEventPaymentDto,
  CreateCardEventPaymentDto,
  ConfirmCardEventTicketPaymentDto,
  CreateEventTicketPaymentDto,
  ConfirmEventPaymentDto
} from '@/dtos/eventTicketPayment.dto';
import {
  PAYMENT_CURRENCY,
  PAYMENT_METHOD_TYPE,
  PAYMENT_STATUS,
  PAYMENT_TYPE
} from '@/constants/payments';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {IdempotencyService} from '@/services/idempotency.service';
import {PromotePricingPackageService} from '@/services/promotePricingPackage';
import {
  paymentAlreadyProcessedException,
  paymentNotFoundException
} from '@/errors/payments.error';
import {dateTimeFormat, diffToNowInDays, getISONow} from '@/utils/time';
import {
  EventPrice,
  EventSubcategory,
  Prisma,
  PromotePricingPackage,
  Ticket,
  TicketPaymentTickets
} from '@prisma/client';
import prisma from '@/db';
import {Decimal} from '@prisma/client/runtime';
import {EventPackageService} from '@/services/eventPackage.service';
import { 
  eventInvalidTicketException,
  eventNotFoundException, 
  exceedBuyDateException, 
  maxOrderExceedException, 
  noActiveTicketsException,
  quantityNotAvailableException,
  ticketNotBelongException
} from '@/errors/eventTickets.error';
import { EventTicketTypeService } from '@/services/eventTicketType.services';
import { TICKET_CATEGORY } from '@/constants/ticketCategory';
import { TicketPaymentService } from '@/services/ticketPayment.service';
import { TicketPaymentTicketsService } from '@/services/ticketPaymentTicket.service';
import {DateTime, Duration} from 'luxon';
import { EventTicketService } from '@/services/eventTickets.service';
import { getUUIDv4, zeroPadding } from '@/utils/math';
import { image, imageSync} from 'qr-image'
import { compare, hash } from 'bcrypt';
import { Event } from '@prisma/client';
import { ImageFormat, ImageManip } from '@/utils/imageManip';
import { TICKET_STATUS } from '@/constants/ticketStatus';
import { UserRoles } from '@/constants/user.constants';
import {NOTIFICATION_TYPE} from '@/constants/notifications';
import notifications from '@/notifications';

const STRIPE_API_KEY = config.payment_gateway.stripe.api_key;
const FE_REDEEM = config.frontend.endpoints.redeem_qr;
const FE_URL = config.frontend.url;
const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;
const EVENTS_PATH = 'Event';
const ENV = config.environment;
const MAILER_ENABLED = config.mailer.enabled;
const FE_UNSUSCRIBE_ENDP = config.frontend.endpoints.unsuscribe;
// const FE_DASHBOARD_ENDPOINT = config.frontend.endpoints.dashboard;
const FE_MY_TICKET = config.frontend.endpoints.my_tickets;
class Tickets {
  id: number;
  quantity: number;
}

class EventTicketsPaymentsController {
  public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
  public stripe = new StripeService(STRIPE_API_KEY, {apiVersion: '2020-08-27'});
  public customers = new CustomerService();
  public idempotency = new IdempotencyService();
  public payment = new TicketPaymentService();
  public subcategoryPricing = new EventPriceService();
  public promotePackage = new PromotePricingPackageService();
  public eventPackage = new EventPackageService();
  public subCategory = new EventSubCategoryService();
  public event = new EventsService();
  public eventTicket = new EventTicketTypeService();
  public ticketPaymentTicket = new TicketPaymentTicketsService();
  public ticket = new EventTicketService();
  public ticketService = new TicketService();
  public imageManip = new ImageManip();
  private notification = new NotificationService();
  private sendgrid = new SendGridService();
  
  private sendNotifications = async (payment_id:string): Promise<any>  =>{
    const paymentedTickets:any = await this.ticketService.findAllByPaymentId(payment_id);
    const event: any = await this.event.findById(paymentedTickets[0].Ticket_type.event_id);
    const ticketPartiallySold = config.event_tickets.ticketPartiallySold
    const ticketPartiallySoldpercentage = ticketPartiallySold * 0.01
    const ticketTypesMap = new Map();

    for (const ticket of paymentedTickets) {
      const ticketTypeId = ticket.ticket_type_id;
  
      if (!ticketTypesMap.has(ticketTypeId)) {
        ticketTypesMap.set(ticketTypeId, {
          ticket_type_id: ticketTypeId,
          name: ticket.Ticket_type.name,
          quantity_avaible: ticket.Ticket_type.quantity_avaible,
          tickets: [ticket],
        });
      } else {
        const ticketType = ticketTypesMap.get(ticketTypeId);
        const existingTicketIndex = ticketType.tickets.findIndex((t) => t.id === ticket.id);
        if (existingTicketIndex === -1) {
          ticketType.tickets.push(ticket);
        }
      }
    }
    
    const groupedByTypesTickets = Array.from(ticketTypesMap.values());

    let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
    if (event.has_banner) {
      image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${event.publisher.id}/${EVENTS_PATH}/${event.id}/banner`;
    }

    let notificationdPartiallySoldOut:any = {
      user_id: event.publisher_id,
      scope: UserRoles.USER,
      type: NOTIFICATION_TYPE.TICKET_PARTIALLY_SOLD_OUT,
      seen: false,
      title: `Tickets ${ticketPartiallySold} % Sold Out`,
      data: {banner: image}
    };

    let notificationdSoldOut:any = {
      user_id: event.publisher_id,
      scope: UserRoles.USER,
      type: NOTIFICATION_TYPE.TICKET_SOLD_OUT,
      seen: false,
      title: "One of your event's tickets has sold out.",
      message: "Ticket sold out for your event.",
      data: {banner: image}
    };

    for (const ticketType of groupedByTypesTickets) {
      const ticketsAmount = await this.ticketService.findByTicketTypeCount(ticketType.ticket_type_id);
      const quantityAvaible = ticketType.quantity_avaible;
      const quantityPartially = Math.floor(quantityAvaible * ticketPartiallySoldpercentage);

      if(ticketsAmount >= quantityPartially){
        const notificationData =  {ticket_type_id: ticketType.ticket_type_id }
        notificationdPartiallySoldOut = {
          ...notificationdPartiallySoldOut,
          message: `${ticketPartiallySold}% of ${ticketType.name} tickets have been sold`,
          data: notificationData
        }
        const isNotificationExist = await this.notification.findNotificationByType(
          NOTIFICATION_TYPE.TICKET_PARTIALLY_SOLD_OUT,
          notificationData
        );
        if(!isNotificationExist){
          await this.notification.create(notificationdPartiallySoldOut as any);
          notifications.ticketsPartiallySoldOut(notificationdPartiallySoldOut);
        }
      }

      if(ticketsAmount >= quantityAvaible){
        notificationdSoldOut = {
          ...notificationdSoldOut,
          data: {ticket_type_id: ticketType.ticket_type_id }
        }
        await this.notification.create(notificationdSoldOut as any);
        notifications.ticketsSoldOut(notificationdSoldOut);
      }
    }
  }

  public createPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const paymentData: CreateEventTicketPaymentDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      let customerId: string;
      if (!customer) {
        customerId = await this.stripe.createCustomer(user);
        await this.customers.createCustomer(customerId, user.id);
      }

      // conditions to prevent further purchase
      const event: any = await this.event.findById(paymentData.event_id);
      if (!event) {
        throw eventNotFoundException('Event not found');
      }

      if (event.ticket_close_time < getISONow()) {
        throw exceedBuyDateException('Buy Date Exceeded')
      }

      if (event.Ticket_type.length < 1) {
        throw noActiveTicketsException('Event don\'t have active tickets');
      }

      for (const checkTicket of paymentData.tickets) {
        // for every ticket requested, check active
        const ticket = await this.eventTicket.findById(checkTicket.id);
        if (!ticket.active) {
          throw eventInvalidTicketException(`Can't buy a inactive ticket`);
        }
      }
      
      paymentData.tickets.map((checkTicket) => {
        if (!event.Ticket_type.some((validTicket) => checkTicket.id === validTicket.id)) {
          throw ticketNotBelongException(`Ticket id ${checkTicket.id} not belong to Event`);
        }
      });
      // avaible tickets
      const limitDate = DateTime.now().minus({seconds: config.event_tickets.buyTime}).toISO();
      for (const checkTicket of paymentData.tickets) {
        // for every ticket requested, check availability
        const available = await this.eventTicket.findById(checkTicket.id);
        // max order exceed
        if(available.max_quantity_order < checkTicket.quantity && available.max_quantity_order !== -1) {
          throw maxOrderExceedException(`Max order quantity exceed for ticket id ${checkTicket.id}`);
        }

        const buyed = await this.ticketPaymentTicket.findTicketTypeAvailability(
          checkTicket.id,
          limitDate
        );      
        // quantity availble for every ticket
        if (buyed.lenght > 0 && buyed[0]._sum.quantity + checkTicket.quantity > available.quantity_avaible) {
          throw quantityNotAvailableException(`Quantity not available for ticket id ${checkTicket.id}`);
        }

      };

      // calculate amount of all tickets
      let paymentInfo = {
        amount: 0,
        currency: PAYMENT_CURRENCY.USD,
        items: []
      };

      paymentInfo = await this.paymentInformation(
        event.subcategory.id,
        paymentData.base_price,
        paymentData.tickets,
      );

      /* if the tickets are all free, create a custom payment id */
      let service_fee = 0;
      const createPaymentData = {
        id: '',
        user:{
          connect: {
            id: req.user.id,
          }
        },
        amount: paymentInfo.amount,
        service_fee
      };
      if (paymentInfo.amount > 0) {
        const createdPaymentData = await this.stripe.createPayment(
          paymentInfo.amount,
          paymentInfo.currency,
          paymentData.method_type as PAYMENT_METHOD_TYPE[],
          customer ? customer.customer_id : customerId,
          paymentData.method_options
        );
  
        const service_fee_item = paymentInfo.items.find((i) => i.name === 'Service Fee');
        if (service_fee_item) {
          service_fee = service_fee_item.total;
        }
        createPaymentData.id = createdPaymentData.paymentId;
        createPaymentData.service_fee = service_fee;
      } else {
        var RandExp = require('randexp'); 
        let paymentId = new RandExp(/cpi_[a-zA-Z0-9]{24}/).gen();
        let alreadyExist = false;
        do {
          const result = await this.payment.find(paymentId);
          if(result) {
            paymentId = new RandExp(/cpi_[a-zA-Z0-9]{24}/).gen();
            alreadyExist = true;
          } else {
            alreadyExist = false;
          }
        } while (alreadyExist)

        createPaymentData.id = paymentId;
      }
      
      const createdPayment = await this.payment.create(
        createPaymentData as any
      );
      // create tickets associated to the payments
      for (const ticket of paymentData.tickets)
      await prisma.ticketPaymentTickets.create({
        data: {
          ticket_type_id: ticket.id,
          quantity: ticket.quantity,
          payment_id: createPaymentData.id
        }
      });

      res
        .status(STATUS_CODES.CREATED)
        .json({data: {
          payment: createdPayment,
          items: paymentInfo.items
        }, message: 'Payment created'});
    } catch (error) {
      next(error);
    }
  };

  public getPaymentHistory = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user.id;
      const params = req.query;

      const payementHistory = await this.payment.findFinishedByUserId(
        userId,
        params
      );

      res
        .status(STATUS_CODES.OK)
        .json({data: payementHistory, message: 'History retrieved'});
    } catch (error) {
      next(error);
    }
  };

  public createCardPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const user = req.user;
      const paymentData: CreateCardEventPaymentDto = req.body;

      const customer = await this.customers.findCustomerByUser(user.id);
      let customerId: string;
      if (!customer) {
        customerId = await this.stripe.createCustomer(user);
        await this.customers.createCustomer(customerId, user.id);
      }

      const createdPaymentData = await this.stripe.createCardPayment(
        customer.customer_id,
        paymentData.amount,
        paymentData.currency,
        paymentData.method_options
      );

      res
        .status(STATUS_CODES.CREATED)
        .json({data: createdPaymentData, message: 'Payment created'});
    } catch (error) {
      next(error);
    }
  };

  public confirmCardPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.payment_intent_id;
      const user = req.user;
      const paymentData: ConfirmCardEventTicketPaymentDto = req.body;

      const paymentMethodOpts = {
        card: {cvc_token: paymentData.method_options.cvc_token_id}
      };

      await this.stripe.confirmCardPayment(
        id,
        paymentData.payment_method_id,
        user,
        paymentMethodOpts
      );

      res.status(STATUS_CODES.OK).json({message: 'Payment confirmed'});
    } catch (error) {
      next(error);
    }
  };

  public confirmPayment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const user = req.user;
      const paymentData: ConfirmEventPaymentDto = req.body;

      const payment = await this.payment.find(id);
      if (!payment) {
        throw paymentNotFoundException('Payment not found');
      }

      if (payment.status !== PAYMENT_STATUS.PENDING) {
        throw paymentAlreadyProcessedException(
          'Cannot confirm a payment already processed'
        );
      }

      // todo: add payment_intent - idempotency key validation
      let paymentMethodOpts = {};

      if (paymentData.method_type) {
        paymentMethodOpts = {
          card: {cvc_token: paymentData.method_options.cvc_token_id}
        };
      }

      // check if the payment is a custom (FREE TICKETS)
      
      const REGEXP = /cpi_[a-zA-Z0-9]{24}/;
      if(!REGEXP.test(id)) {
        await this.stripe.confirmPayment(
          id,
          paymentData.payment_method_id,
          user,
          paymentMethodOpts,
        );
      }
      
      //create QrCodes for Tickets      
      const tickets: any = await this.ticketPaymentTicket.findByTicketPaymentId(id);
      const purchase_order_number =  await this.createPurchaseOrder();
      const eventInfo = {
        tickets:[]
      };
      let index = 1;
      for (const ticket of tickets) {
        for (let i = 0;i < ticket.quantity;i++) {
          const ticket_number = await hash(`${purchase_order_number}#${zeroPadding(index,3)}`,0);
          const url = `${FE_URL}/${FE_REDEEM}/${ticket_number}`;
          const qr_status_array = [];

          ticket.ticket.valid_for.map((date) => {
            qr_status_array.push({
              valid_for: date,
              status: TICKET_STATUS.PENDING,
              redeem: null
            })
          });
          const qr_status = qr_status_array as Prisma.JsonArray;

          await this.ticket.create({
            payment_id: id,
            buyer_id: payment.user_id,
            qr_code: ticket_number,
            qr_status,
            purchase_order_number,
            ticket_type_id:ticket.ticket_type_id
          });
  
          const qrUrl = await this.uploadQrCode(
            user.id,
            ticket.ticket.event_id,
            url,
            ticket_number
          );

          eventInfo.tickets.push({
            index,
            type: ticket.ticket.name,
            order_number: `${purchase_order_number}#${zeroPadding(index,3)}`,
            qr: qrUrl
          });
          index++;
        }
      }
      // email with tickets and event summary
      if (MAILER_ENABLED) {
        const event: any = await this.event.findById(tickets[0].ticket.event_id);
        const start = dateTimeFormat(event.start_at,'MMMM d yyyy');
        const end = dateTimeFormat(event.end_at,'MMMM d yyyy');
        const date = end ? `${start} to ${end}` : start;
        const venue_name = event.venue_location[0]?.venue_name;  
        const address = event.venue_location[0]?.address;
        const city = `${event.venue_location[0]?.city}, ${event.venue_location[0]?.state}, ${event.venue_location[0]?.zipcode}`
        // tickets
        const paymentTickets:any = await this.ticketPaymentTicket.findByTicketPaymentId(id);
        
        const subtotal = (Number(payment.amount) - Number(payment.service_fee)) / 100;
        const service_fee = Number(payment.service_fee) / 100;
        const total = Number(payment.amount) / 100;
        
        const purchase = [];
        for (const ticket of paymentTickets) {
          const subtotal = (Number(ticket.ticket.unit_price) * Number(ticket.quantity)) / 100;
          purchase.push({
            type: ticket.ticket.name,
            quantity: ticket.quantity,
            subtotal: subtotal.toFixed(2)
          });
        }

        let image = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/ListingPlaceHolderChico.PNG';
        if (event.has_banner) {
          image = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${event.publisher.id}/${EVENTS_PATH}/${event.id}/banner`;
        }
        const eventData = {
          image,
          title: event.title,
          dates: date,
          venue_name: venue_name,
          address: `${address}<br>${city}`,
          order: {
              id: purchase_order_number,
              // date: dateTimeFormat(DateTime.now(),'MMMM d yyyy'),
              date: DateTime.now().toFormat('MMMM d yyyy'),
              by: user.full_name
          },
          purchase,
          subtotal: `$ ${subtotal.toFixed(2)}`,
          service_fee: `$ ${service_fee.toFixed(2)}`,
          total: `$ ${total.toFixed(2)}`,
          tickets: eventInfo.tickets
        };
        const redirectUrl = `${FE_URL}/${FE_MY_TICKET}`;
        const unsubscribe = `${FE_URL}/${FE_UNSUSCRIBE_ENDP}`;
        await this.sendgrid.buyEventTickets(
          user.email,
          redirectUrl,
          unsubscribe,
          eventData
        );

        const notificationPayment:any = {
          user_id:payment.user_id,
          scope: UserRoles.USER,
          type: NOTIFICATION_TYPE.TICKET_PURCHASED,
          seen: false,
          title: "You just purchase a Ticket!",
          message: '"Click “View More” to view it in “My Tickets”',
          data: {payment_id: id, event: event.id, banner: image}
        };
    
        await this.notification.create(notificationPayment as any);
        notifications.ticketPurchased(notificationPayment);
      }

      await this.payment.update(id,PAYMENT_STATUS.FINISHED,getISONow());

      await this.sendNotifications(id)

      res.status(STATUS_CODES.OK).json({
        data:{
          purchase_order_number
        },
        message: 'Payment confirmed'});
    } catch (error) {
      next(error);
    }
  };

  public cancelPayment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const paymentData: CancelEventPaymentDto = req.body;

      const payment = await this.payment.find(id);
      if (!payment) {
        throw paymentNotFoundException('Payment not found');
      }

      // todo: add cancel validations

      await this.stripe.cancelPayment(id);
      await this.payment.update(id, PAYMENT_STATUS.CANCELED, getISONow());

      res.status(STATUS_CODES.OK).json({message: 'Payment canceled'});
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  private async paymentInformation(
    subcategory_id: number,
    basePrice: number,
    tickets: Tickets[],
  ): Promise<any> {
    let subtotal: number = 0;
    let amount: number = 0;
    const items = [];
    const subCategory = await this.subCategory.findById(subcategory_id);

    for (const ticket of tickets) {
      const data = await this.eventTicket.findById(ticket.id);
      const price: number = data.type_id === TICKET_CATEGORY.FREE ? 0 : data.unit_price * ticket.quantity;
      // check if fee is applied to every ticket or just in the total
      // const fee = price * (subCategory.service_fee / 100);
      
      // total_fee += fee;
      // amount += price;
      subtotal += price;
      // amount += price + fee;

      items.push({
        name: data.name,
        quantity: ticket.quantity,
        unit_price: data.type_id === TICKET_CATEGORY.FREE ? 'FREE' : data.unit_price,
        total: data.type_id === TICKET_CATEGORY.FREE ? 0 : data.unit_price * ticket.quantity,
      });
    }

    const total_fee = Math.floor(subtotal * (subCategory.service_fee / 100));
    if (subCategory.service_fee > 0) {
      amount = subtotal + total_fee;
    } else {
      amount = subtotal;
    }
    

    if (subCategory.service_fee > 0) {
      items.push({
        name: 'Subtotal',
        quantity: 1,
        unit_price: subtotal,
        total: subtotal
      });
    }
    if (subCategory.service_fee > 0) {
      items.push({
        name: 'Service Fee',
        quantity: 1,
        unit_price: total_fee,
        total: total_fee
      });
    }

    // calculate the diference if exist
    /*
    let difference = Math.ceil(amount) - (subtotal + total_fee);
    while (difference !== 0) {
      if (difference > 0) {
        difference = Math.floor(amount) - (subtotal + total_fee);
      } else {
        amount = Math.ceil(amount + difference);
        difference = amount - (subtotal + total_fee);
      }
    }
    */
    return {
      // amount: Math.ceil(basePrice + amount),
      amount: basePrice + amount,
      currency: PAYMENT_CURRENCY.USD,
      items
    };
  }

  private async createPurchaseOrder(){
    var RandExp = require('randexp'); 
    const purchase_order_number = new RandExp(/([A-Z]{3})-([0-9]{8})/).gen();
    return purchase_order_number;
  }
  
  private uploadQrCode = async (
    userId: string,
    eventId: string | number,
    qrUrl: string,
    qrCode: string
  ): Promise<string> => {
    const imgFmt = ImageFormat.webp;
    const generatedQr = await imageSync(qrUrl);
    // this.imageManip.setImage(generatedQr);
    // await this.imageManip.convert(imgFmt);
    // const processed = this.imageManip.getProcessed();
   
    const url =await this.s3.upload(
      `${ENV}/${userId}/${EVENTS_PATH}/${eventId}/QR/`,
      `${qrCode}.png`,
      // processed.converted,
      generatedQr,
      {
        contentEncoding: 'base64',
        contentType: imgFmt
      }
    );
    return url;
  };
}

export default EventTicketsPaymentsController;


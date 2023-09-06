import {NextFunction, Request, Response} from 'express';
import {Media, Ticket} from '@prisma/client';
import {DateTime} from 'luxon';
import {STATUS_CODES, UserRoles} from '@/constants';
import {
  CreateMediaDto,
  UpdateMediaDto,
  GetMediaDto,
  DeleteMediaDto
} from '@/dtos/media.dto';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { TicketService } from '@/services/ticket.service';
import { GetAllTickets } from '@/interfaces/tickets.interface';
import { ticketNotFoundException, ticketUnathorizedException } from '@/errors/ticket.error';
import config from '@/config';
import PDFDocument from 'pdfkit'
import fs from 'fs';
import { EventTicketService, EventsService, S3 } from '@/services';
import { dateTimeFormat } from '@/utils/time';
import { TicketPaymentTicketsService } from '@/services/ticketPaymentTicket.service';
import axios from 'axios';
import { zeroPadding } from '@/utils/math';
import { TicketPaymentService } from '@/services/ticketPayment.service';
import { TICKET_CATEGORY } from '@/constants/ticketCategory';
import addTextbox from "textbox-for-pdfkit";

const EVENTS_PATH = 'Event';
const ENV = config.environment;
const S3_BUCKET = config.aws.s3.bucket;
const S3_ACCESS_KEY_ID = config.aws.s3.access_key_id;
const S3_SECRET_ACCESS_KEY = config.aws.s3.secret_access_key;

class EventTicketController {
    
    public ticket = new EventTicketService();
    public event = new EventsService();
    public ticketPayment = new TicketPaymentService();
    public ticketPaymentTicket = new TicketPaymentTicketsService();
    public s3 = new S3(S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY);
    // public getTicketByEvent = async (
    //   req: Request,
    //   res: Response,
    //   next: NextFunction
    // ): Promise<void> => {
    //   try {
    //     const tickets: Partial<Ticket>[] = await this.ticket.find();
  
    //     res.status(STATUS_CODES.OK).json({data: liveStreamingData, message: 'findAll'});
    //   } catch (error) {
    //     next(error);
    //   }
    // };

    public getTicketById = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const id = Number(req.params.id);
        const user = req.user;
        const ticket: any = await this.ticket.findById(id);
          
        if (!ticket) {
          res
          .status(STATUS_CODES.NOT_FOUND)
          .json({message: 'ticket not found'});
        } 
        
        if (ticket.buyer_id !== user.id || user.role_id !== UserRoles.ADMIN) {
            throw ticketUnathorizedException("Insufficient Permission");
        }
        ticket.image_url = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${user.id}/${EVENTS_PATH}/${ticket.Ticket_type.event_id}/QR/${ticket.qr_code}.png`
        
        res.status(STATUS_CODES.OK).json({data: ticket, message: 'findOne'});
      } catch (error) {
        next(error);
      }
    };

    public getTicketsMe = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const user = req.user;
        const params = {
          ...req.query
        };
        params.order_by = 'ticket_type_id';
        params.order = 'asc';
        const ticketsData: Partial<GetAllTickets> =
          await this.ticket.findByUser(user.id, params);
        const {tickets: ticketData, total, cursor, pages} = ticketsData;
        const tickets = ticketData.map((ticket) => {
          const data = {...ticket};
          data.image_url = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${user.id}/${EVENTS_PATH}/${ticket.Ticket_type.event_id}/QR/${ticket.qr_code}.png`
          return data;
          });
        res.status(STATUS_CODES.OK).json({
          data: {tickets, total, cursor, pages},
          message: 'OK'
        });
      } catch (error) {
        next(error);
      }
    };
    public getTicketsMeByPurchaseOrder = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const user = req.user;
        const orderNumber = req.params.orderNumber;

        const ticketsData: any = await this.ticket.findByPurchaseOrderNumber(orderNumber);
        // const {tickets: ticketData, total, cursor, pages} = ticketsData;
        const tickets = ticketsData.map((ticket) => {
          const data = {...ticket};
          data.image_url = `https://${S3_BUCKET}.s3.amazonaws.com/${ENV}/${user.id}/${EVENTS_PATH}/${ticket.Ticket_type.event_id}/QR/${ticket.qr_code}.png`
          return data;
          });
        res.status(STATUS_CODES.OK).json({
          data: { tickets },
          message: 'OK'
        });
      } catch (error) {
        next(error);
      }
    };

    public getPDFByOrderPurchase = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction) => {
      try {
        const user = req.user;
        const orderNumber = req.params.orderNumber;
        const year = DateTime.now().toFormat('yyyy');

        if (!orderNumber) {
          
        }
        const dir = './temp';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
  
        const tickets = await this.ticket.findByPurchaseOrderNumber(orderNumber);
        if (tickets.length <= 0) {
          throw ticketUnathorizedException("Purchase Order not Found");
        }
        if (tickets[0].buyer_id !== user.id && user.role_id !== UserRoles.ADMIN) {
          throw ticketUnathorizedException("Lack of Permissions");
        }

        const event: any = await this.event.findById(tickets[0].Ticket_type.event_id);
        
        // create a file in ./temp named like the purchaseOrderNumber
        const doc = new PDFDocument({size: 'A4', margin: 30});
        let output = await fs.createWriteStream(`${dir}/${orderNumber}.pdf`, doc);
        doc.pipe(output);
        // write PDF content
        doc.registerFont('Bold', './src/pdf/font/Outfit-Bold.ttf');
        doc.registerFont('SemiBold', './src/pdf/font/Outfit-SemiBold.ttf');
        doc.registerFont('Regular', './src/pdf/font/Outfit-Regular.ttf');
        doc.registerFont('Light', './src/pdf/font/Outfit-Light.ttf');
        // set page margins
        // doc.page.margins.top = 30;
        // doc.page.margins.bottom = 30;
        const usableWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right);
        const usableHeight = doc.page.height - (doc.page.margins.top + doc.page.margins.bottom);
        // title
        doc.font('Bold');
        doc.text(
          'Order Confirmation: Tickets Purchase',
          {
            size: 10,
            align: 'center'
          }
        );

        doc.moveDown();
        // Event name
        doc.font('Regular');
        doc.fillColor('#575A63');
        doc.text(
          event.title,
          (doc.page.width/2-5)-100,
          doc.y,
          {
            underline: true,
            size: 10,
            align: 'center',
            width: 200,
          }
        );
        doc.moveDown();
        doc.font('SemiBold');
        doc.text('EVENT INFO',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left'
        });
        // event data
        doc.moveDown();
 

        doc.rect(doc.x, doc.y - 4, usableWidth, doc.heightOfString('Dates(s)') + 8).strokeColor('#E3E3E3').stroke();
        doc.text(' Date(s)',
        {
          align: 'left',
          width: 100,
        });

        doc.moveUp();

        const start = dateTimeFormat(event.start_at,'MMMM d yyyy');
        const end = dateTimeFormat(event.end_at,'MMMM d yyyy');
        const date = end ? `${start} to ${end}` : start;
        doc.font('Light');
        doc.text(date,
        doc.page.margins.left + 100,
        doc.y,
        {
          align: 'left',
          width: doc.page.width - 200,
        }).moveDown(0.5);;

        // venue name
        const venue_name = event.venue_location[0]?.venue_name ? `${event.venue_location[0]?.venue_name}` : ' ';
        doc.rect(
          doc.page.margins.left, 
          doc.y - 4, 
          usableWidth, 
          doc.heightOfString(venue_name) + 8)
        .strokeColor('#E3E3E3')
        .stroke();
        doc.font('Bold');
        doc.text(' Venue Name',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 100
        });

        doc.moveUp();
        doc.font('Light');
        doc.text(venue_name,
        doc.page.margins.left + 100,
        doc.y,
        {
          align: 'left',
          width: doc.page.width - 200,
        }).moveDown(0.5);

        // adrress
        const city = `${event.venue_location[0]?.city}, ${event.venue_location[0]?.state}, ${event.venue_location[0]?.zipcode}`
        doc.rect(
          doc.page.margins.left, 
          doc.y - 4, 
          usableWidth, 
          doc.heightOfString(`${event.venue_location[0]?.address}\n${city}`) + 8)
        .strokeColor('#E3E3E3')
        .stroke();
        doc.font('Bold');
        doc.text(' Address',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 100
        });

        doc.moveUp();
        doc.font('Light');
        doc.text(`${event.venue_location[0]?.address}\n${city}`,
        doc.page.margins.left + 100,
        doc.y,
        {
          align: 'left',
          width: doc.page.width - 200,
        });
      
        // ORDER SUMMARY
        doc.moveDown();
        doc.font('SemiBold');
        doc.text('ORDER SUMMARY',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left'
        });
        doc.moveDown();

        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        .text(' Order ID',
        
        {
          align: 'left',
          width: 100,
        });
        doc.moveUp();
        doc.font('Light').text(orderNumber,
        doc.page.margins.left + 100,
        doc.y,
        {
          align: 'left',
          width: doc.page.width - 200,
        }).moveDown(0.5);

        const orderdate = dateTimeFormat(tickets[0].payment.created_at, 'MMMM d, yyyy HH:mm');
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        .text(' Order Date',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 100,
        });
        doc.moveUp();
        doc.font('Light').text(orderdate,
        doc.page.margins.left + 100,
        doc.y,
        {
          align: 'left',
          width: doc.page.width - 200,
        }).moveDown(0.5);

        
        const buyerName = tickets[0].Buyer.full_name;
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        .text(' Order By',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 100,
        });
        doc.moveUp();
        doc.font('Light').text(buyerName,
        doc.page.margins.left + 100,
        doc.y,
        {
          align: 'left',
          width: doc.page.width - 200,
        }).moveDown(0.5);

        doc.moveDown();
        // TICKETS SUMMARY
        // tittles
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.rect(usableWidth + doc.page.margins.left - 80, doc.y - 4, 80, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.rect(usableWidth + doc.page.margins.left - 160, doc.y - 4, 80, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        .text(' TYPE',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 400,
        });
        doc.moveUp();
        doc.font('Bold')
        .text(' QTY',
        usableWidth + doc.page.margins.left - 160,
        doc.y,
        {
          align: 'center',
          width: 80,
        });
        doc.moveUp();
        doc.font('Bold')
        .text(' PRICE',
        usableWidth + doc.page.margins.left - 80,
        doc.y,
        {
          align: 'center',
          width: 80,
        });
        doc.moveDown(0.5);

        // tickets
        const paymentTickets:any = await this.ticketPaymentTicket.findByTicketPaymentId(tickets[0].payment_id);
        
        const payment = tickets[0].payment;
        const subtotal = (Number(payment.amount) - Number(payment.service_fee)) / 100;
        const service_fee = Number(payment.service_fee) / 100;
        const total = Number(payment.amount) / 100;
        
        for ( const ticket of paymentTickets) {
          const subtotal = (Number(ticket.ticket.unit_price) * Number(ticket.quantity)) / 100;
          const name =  ticket.ticket.name;
          const quantity = ticket.quantity;
          
          doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
          doc.rect(usableWidth + doc.page.margins.left - 80, doc.y - 4, 80, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
          doc.rect(usableWidth + doc.page.margins.left - 160, doc.y - 4, 80, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();

          doc.font('Light')
          .text(' ' + name,
          doc.page.margins.left,
          doc.y,
          {
            align: 'left',
            width: 400,
          });
          doc.moveUp();
          doc.font('Light')
          .text(quantity,
          usableWidth + doc.page.margins.left - 160,
          doc.y,
          {
            align: 'center',
            width: 80,
          });
          doc.moveUp();
          doc.font('Light')
          .text(`$ ${subtotal.toFixed(2)}`,
            usableWidth + doc.page.margins.left - 80,
          doc.y,
          {
            align: 'right',
            width: 70,
          });
          doc.moveDown(0.5);
        }
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        // subtotal
        .text(' Subtotal',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 400,
        });
        doc.moveUp();
        doc.font('Bold')
        .text(`$ ${subtotal.toFixed(2)}`,
        usableWidth + doc.page.margins.left - 80,
        doc.y,
        {
          align: 'right',
          width: 70,
        });
        doc.moveDown(1.5);
        // Desilist Fee
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        // subtotal
        .text(' Desilist Service Fees (non-refundable)',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 400,
        });
        doc.moveUp();
        doc.font('Regular')
        .text(`$ ${service_fee.toFixed(2)}`,
        usableWidth + doc.page.margins.left - 80,
        doc.y,
        {
          align: 'right',
          width: 70,
        });
        doc.moveDown(1.5);

        // TOTAL
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.heightOfString('Order ID') + 8).strokeColor('#E3E3E3').stroke();
        doc.font('Bold')
        .text(' TOTAL',
        doc.page.margins.left,
        doc.y,
        {
          align: 'left',
          width: 400,
        });
        doc.moveUp();
        doc.font('Bold')
        .text(`$ ${total.toFixed(2)}`,
        usableWidth + doc.page.margins.left - 80,
        doc.y,
        {
          align: 'right',
          width: 70,
        });
        doc.moveDown(1.5);

        // QR codes
        doc.rect(doc.page.margins.left, doc.y - 4, usableWidth, doc.page.height - doc.y - doc.page.margins.bottom - 30).strokeColor('#E3E3E3').stroke();
        for (const [index,ticket] of tickets.entries()) {

          const fileName = `${dir}/${orderNumber}#${zeroPadding(index + 1,3)}.png`;
          const file = await this.s3.downloadFile(`${ENV}/${ticket.buyer_id}/${EVENTS_PATH}/${ticket.Ticket_type.event_id}/QR/${ticket.qr_code}.png`);
          await fs.promises.writeFile(fileName, file.Body);
          
          // check if the cursor + image height is bigger than the page height
          // if so, add a new Page
          if (doc.y + 80 > doc.page.height - doc.page.margins.bottom)
          {
            doc.font('Bold')
            .fillColor('black')
            .text(`©${year} Desilist. All rights reserved.`,
            doc.page.margins.left,
            usableHeight + doc.page.margins.top - 16,
            {
              size: 6,
              width: usableWidth,
              align: 'center',
              baseline: 'top'
            });
            doc.addPage({size: 'A4', margin: 30});
            doc.rect(
              doc.page.margins.left, 
              doc.page.margins.top, 
              usableWidth, 
              usableHeight - 30)
            .strokeColor('#E3E3E3')
            .stroke();
          }
          doc.image(fileName, (usableWidth +doc.page.margins.left) - 100, doc.y, {width: 80});
          doc.font('Bold')
          .fillColor('#BB275C')
          .text(
            `#${index + 1}`,
            doc.page.margins.left + 10,
            doc.y - 40,
            {
              continued: true,
              baseline: 'bottom',
            }
          )
          .font('SemiBold')
          .fillColor('#2B303E')
          .text(' ' + ticket.Ticket_type.name,
            {
              continued: false
            });

          doc.font('Regular')
          .fillColor('#E3E3E3')
          .text(`${orderNumber}#${zeroPadding(index + 1,3)}`,
          {
            baseline: 'bottom',
          });     
          doc.moveDown(0.5);
        }
        doc.font('Bold')
        .fillColor('black')
        .text(`©${year} Desilist. All rights reserved.`,
        doc.page.margins.left,
        usableHeight + doc.page.margins.top - 16,
        {
          size: 6,
          width: usableWidth,
          align: 'center',
          baseline: 'top'
        });
        // end PDF and output to the pipe
        doc.end();
        const stream = fs.createReadStream(
          `${dir}/${orderNumber}.pdf`
        );
        res.set({
          'Content-Disposition': `attachment; filename='${orderNumber}.pdf'`,
          'Content-Type': 'application/pdf'
        });
        stream.pipe(res);
      } catch (error) {
        next(error);
      }
    };

    public getOrderSummary = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const user = req.user;
        const orderNumber = req.params.orderNumber;

        const ticketsData = await this.ticket.findByPurchaseOrderNumber(orderNumber);
        const paymentId = ticketsData[0].payment_id;


        const payment = await this.ticketPayment.find(paymentId);
        const tickets:any = await this.ticketPaymentTicket.findByTicketPaymentId(paymentId);
        const summary = [];

        for (const ticket of tickets) {
          summary.push({
            name: ticket.ticket.name,
            quantity: ticket.quantity,
            unit_price: ticket.type_id === TICKET_CATEGORY.FREE ? 'FREE' : ticket.ticket.unit_price,
            total: ticket.type_id === TICKET_CATEGORY.FREE ? 0 : ticket.ticket.unit_price * ticket.quantity,
          });
        }
        
        if (payment.service_fee) {
          // subtotal
          summary.push({
            name: 'Subtotal',
            quantity: 1,
            unit_price: Math.round(Number(payment.amount) - Number(payment.service_fee)),
            total: Math.round(Number(payment.amount) - Number(payment.service_fee))
          });

          // service fee
          summary.push({
            name: 'Service Fee',
            quantity: 1,
            unit_price: Math.round(Number(payment.service_fee)),
            total: Math.round(Number(payment.service_fee))
          });
        }
        // TOTAL
        summary.push({
          name: 'Total',
          quantity: 1,
          unit_price: Number(payment.amount),
          total: Number(payment.amount)
        });
       
        const purchase_date = payment.updated_at;
        res.status(STATUS_CODES.OK).json({
          data: {
            summary,
            purchase_date
          },
          message: 'Ok'
        });
      } catch (error) {
        next(error);
      }
    };

    public getTicketPDF = async (
      req: RequestWithUser,
      res: Response,
      next: NextFunction) => {
      try {
        const user = req.user;
        const id = Number(req.params.id);
        const year = DateTime.now().toFormat('yyyy');

        const dir = './temp';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
  
        const ticket: any = await this.ticket.findById(id);
        if (!ticket) {
          throw ticketNotFoundException("Ticket not Found");
        }

        if (ticket.buyer_id !== user.id && user.role_id !== UserRoles.ADMIN) {
          throw ticketUnathorizedException("Lack of Permissions");
        }

        const event: any = await this.event.findById(ticket.Ticket_type.event_id);
        
        const tickets = await this.ticket.findByPurchaseOrderNumber(ticket.purchase_order_number);

        const index = tickets.map((i) => i.id).indexOf(ticket.id);
        // create a file in ./temp named like the purchaseOrderNumber
        const doc = new PDFDocument({size: 'A6', margin: 30});
        let output = await fs.createWriteStream(`${dir}/${ticket.purchase_order_number}.pdf`, doc);
        doc.pipe(output);
        // write PDF content
        doc.registerFont('Bold', './src/pdf/font/Outfit-Bold.ttf');
        doc.registerFont('SemiBold', './src/pdf/font/Outfit-SemiBold.ttf');
        doc.registerFont('Regular', './src/pdf/font/Outfit-Regular.ttf');
        doc.registerFont('Light', './src/pdf/font/Outfit-Light.ttf');

        const usableWidth = doc.page.width - (doc.page.margins.left + doc.page.margins.right);
        const usableHeight = doc.page.height - (doc.page.margins.top + doc.page.margins.bottom);
        // title
        /*
        doc.font('Bold');
        doc.text(
          'Ticket',
          {
            size: 10,
            align: 'center'
          }
        );
        */
       
        const logo = 'https://desilist-1.s3.us-east-2.amazonaws.com/Assets/Website/logopenege.png';
        const imageLogo = await axios
          .get(logo, {
            responseType: 'arraybuffer'
          })
          .then(response => Buffer.from(response.data, 'binary'))
        doc.image(imageLogo, doc.page.margins.left , doc.y, {
          fit: [usableWidth , 30],
          align: 'center',
          valign: 'center',
        });
        // Desilist title

        // qr image
        // const url = 'local/c9cc29ec-f0c6-4f94-8c7c-48c74e36c81e/Event/40/QR/$2b$10$Eb/UQqbb9tSKYgTPioO5Nu9E5aQZ/PJYmrCMrdC6ovVacZ6TxRIay';
        const fileName = `${dir}/${ticket.purchase_order_number}#${zeroPadding(index + 1,3)}.png`;
        const file = await this.s3.downloadFile(`${ENV}/${ticket.buyer_id}/${EVENTS_PATH}/${ticket.Ticket_type.event_id}/QR/${ticket.qr_code}.png`);
        // const file = await this.s3.downloadFile(url);
        await fs.promises.writeFile(fileName, file.Body);


        doc.image(fileName, (doc.page.margins.left), doc.y, {width: usableWidth - 10});

        // order number
        const TextArray = [
          {
            text: `${index + 1}`,
            color: '#BB275C',
            font: 'Bold',
            fontsize: 16,
          },
          {
            text: ' ' + ticket.Ticket_type.name,
            color: '#2B303E',
            font: 'SemiBold',
            fontsize: 16,
          },
          
        ]
        addTextbox(TextArray, doc, doc.page.margins.left, doc.y, usableWidth, {
          align: "center",
        });

        doc.moveDown(0.5);
        doc.font('Regular')
        .fontSize(16)
        .fillColor('#A3A3A3')
        .text(`${ticket.purchase_order_number}#${zeroPadding(index + 1,3)}`,
        doc.page.margins.left,
        doc.y,
        {
          align: 'center',
          baseline: 'bottom',
        });     
        doc.moveDown(1);

        doc.font('SemiBold')
        .fontSize(12)
        .fillColor('#A3A3A3')
        .text(('Scan the QR code at the entrance to enter the event.').toUpperCase(), 
        doc.page.margins.left,
        doc.y,
        {
          align: 'center',
          baseline: 'bottom',
        });     
          

        // end PDF and output to the pipe
        doc.end();
        const stream = fs.createReadStream(
          `${dir}/${ticket.purchase_order_number}.pdf`
        );
        res.set({
          'Content-Disposition': `attachment; filename='${dir}/${ticket.purchase_order_number}#${zeroPadding(index + 1,3)}.pdf'`,
          'Content-Type': 'application/pdf'
        });
        stream.pipe(res);
      } catch (error) {
        next(error);
      }
    };


}
 
export default EventTicketController;

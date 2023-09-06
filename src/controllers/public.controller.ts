import {NextFunction, Request, Response} from 'express';
import config from '@/config';
import {ContactUsDto} from '@dtos/public.dto';
import {STATUS_CODES} from '@constants/statusCodes';
import reCaptcha from '@/utils/recaptcha';
import {LocationService, SendGridService} from '@/services';
import {locationNotFoundException} from '@/errors/public.error';

class PublicController {
  private sendgrid = new SendGridService();
  public reCaptcha = new reCaptcha();
  public location = new LocationService();

  public contactUs = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const {token, email, name, message} = req.body;
      await this.reCaptcha.validate(token);
      const contactData: ContactUsDto = {
        email,
        name,
        message
      };
      // fix
      const to = config.contact.to;
      await this.sendgrid.contactUs(to, contactData);

      res.status(STATUS_CODES.OK).json({message: 'Message sent'});
    } catch (error) {
      next(error);
    }
  };

  public locationByZipCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const zipCode = req.params.zip_code;
      const locations = await this.location.findByZipCode(zipCode);

      const locationsFormated = {};

      // format response
      if (locations.length > 0) {
        locationsFormated['country'] = locations[0].city.state.country;
        locationsFormated['state'] = [];
        locationsFormated['state'].push({
          name: locations[0].city.state.name,
          abbr: locations[0].city.state.abbr
        });

        for (let i = 0; i < locations.length; ++i) {
          for (let j = 0; j < locationsFormated['state'].length; ++j) {
            if (
              locationsFormated['state'][j].abbr !==
              locations[i].city.state.abbr
            ) {
              locationsFormated['state'].push({
                name: locations[i].city.state.name,
                abbr: locations[i].city.state.abbr
              });
            }
            locationsFormated['state'][j]['locations'] = [];
          }
        }

        for (let i = 0; i < locationsFormated['state'].length; ++i) {
          for (let j = 0; j < locations.length; ++j) {
            locationsFormated['state'][i]['locations'].push({
              id: locations[j].id,
              lat: locations[j].lat,
              lon: locations[j].lon,
              city: {
                id: locations[j].city.id,
                name: locations[j].city.name
              }
            });
          }
          locationsFormated['state'][i]['count'] =
            locationsFormated['state'][i]['locations'].length;
        }
      } else {
        throw locationNotFoundException('Invalid Zip Code');
      }

      res
        .status(STATUS_CODES.OK)
        .json({data: locationsFormated, message: 'Location retrieved'});
    } catch (error) {
      next(error);
    }
  };

  public validatePhoneNumber = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      res.status(STATUS_CODES.OK).json({
        message: 'Correct format'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default PublicController;

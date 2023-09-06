import {NextFunction, Request, Response} from 'express';
import {STATUS_CODES} from '@constants/statusCodes';
import {ZipcodesService} from '@/services/zipcodes.service';
import {locationNotFoundException} from '@/errors/zipcodes.error';

class ZipcodesController {
  public zipcode = new ZipcodesService();

  public locationByZipCode = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const zipCode = req.params.zip_code;
      const locations = await this.zipcode.findLocations(zipCode);

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
}

export default ZipcodesController;

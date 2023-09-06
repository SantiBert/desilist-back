import {NextFunction, Response, Request} from 'express';
import {STATUS_CODES} from '@/constants';
import { Client,PlaceAutocompleteType  } from '@googlemaps/google-maps-services-js';
import {getAdressData} from '@utils/googleMaps';

const apiKey = process.env.GOOGLE_MAP_API_KEY;
const client = new Client({});

class LocationController {
  public getSearchLocation = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input:any = req.query.value;
      
      const response = await client.placeAutocomplete({
        params: {
          key: apiKey,
          input: input,
          components:['country:us'],
          types:PlaceAutocompleteType.address
        },
        timeout: 1000, 
      });
  
      const predictions = response.data.predictions.map((prediction) => {
        return {
          place_id: prediction.place_id,
          description: prediction.description,
        };
      });
      
      res.status(STATUS_CODES.OK).json({
        data: predictions,
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };
  public getLocationDetails = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const address:any = req.query.value;

      const addressData = await getAdressData(address);
      
      res.status(STATUS_CODES.OK).json({
        data: addressData,
        message: 'OK'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default LocationController;

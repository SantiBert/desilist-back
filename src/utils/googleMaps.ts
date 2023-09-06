import { Client, GeocodeResult } from '@googlemaps/google-maps-services-js';

const apiKey = process.env.GOOGLE_MAP_API_KEY;


const client = new Client({});

interface AddressInfo {
  city: string;
  state: string;
  zipcode: string;
  country: string;
  address:string;
  venue_name:string;
  address_description:string;
  place_id:string;
  srid:number;
  geometry_point:any;
}

export async function getZipCode(latitude: number, longitude: number): Promise<string> {
  try {
    const response = await client.reverseGeocode({
      params: {
        latlng:`${latitude},${longitude}`,
        key: apiKey
      }
    });
    
    let zipcode = null
    const result = response.data.results[0];
    const addressComponents = result.address_components;
    
    for (const component of addressComponents) {
      const types:any = component.types;
      if (types.includes('postal_code')) {
        zipcode = component.long_name;
      }
    }
      
    return zipcode;
  } catch (error) {
    throw new Error('Error fetching reverse geocode results.');
  }
}

export async function getAdressData(address: string): Promise<any> {
  try {
    const response = await client.geocode({
      params: {
        address: address,
        key: apiKey
      }
    });

    const result = response.data.results[0] as any;

    let state:string = ''
    let city:string = ''        
    let zipcode:string = ''     
    let country:string = ''

    const addressComponents = result.address_components;
    for (const component of addressComponents) {
      const types = component.types;
      if (types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      }
      if (types.includes('postal_code')) {
        zipcode = component.long_name;
      }
      if (types.includes('country')) {
        country = component.long_name;
      }
    }

    if(!zipcode){
      const latitude = result.geometry.location.lat;
      const longitude = result.geometry.location.lng;

      zipcode = await getZipCode(latitude,longitude);
    }

    if(!city && state == "New York"){
      city = state
    }

    const addressInfo:AddressInfo = {
      city: city,
      state: state,
      zipcode: zipcode,
      country: country,
      place_id:result.place_id,
      address:result.formatted_address,
      venue_name:address,
      address_description:'',
      srid:4326,
      geometry_point:result.geometry.location
    };

    return addressInfo;
  } catch (error) {
    throw new Error('No geometry found for the provided address.');
  }
}

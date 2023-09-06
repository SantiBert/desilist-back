import { LISTING_STATUS } from '@/constants/listingStatus';
import prisma from '@/db';
import { Prisma } from '@prisma/client';


export class LandingService {
  public event = prisma.event;
  public listing = prisma.listing;

  
  public async getLandingHighlighted(): Promise<Partial<any>> {
    
    const listings = await this.listing.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            images: true,
            subcategory: {
              select: {
                id: true,
                name: true,
                category: {select: {id: true, name: true}}
              }
            },
            highlighted: true,
            listing_packages: {
              select: {
                id: true,
                basic_package: {
                  select: {id: true, name: true, duration: true}
                },
                promote_package: {
                  select: {id: true, name: true, duration: true}
                },
                created_at: true,
                paused_at: true,
                activated_at: true,
                active: true
              },
              orderBy: [{created_at: Prisma.SortOrder.asc}]
            },
            user: {
              select: {
                id: true,
                full_name: true,
                photo: true,
                photo_json: true
              }
            },
            created_at: true,
            paused_at: true,
            images_json: true // todo: remove this prop
        },
        where: {
            deleted_at: null, 
            paused_at: null,
            listing_packages: {
                some: {
                    promote_package_id: {not: null},
                    active: true,
                    paused_at: null
                }
            },
            status_id: LISTING_STATUS.ACTIVE,
            highlighted: true
        }
    });

    const events = await this.event.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            has_banner: true,
            start_at: true,
            end_at: true,
            timezone: {
              select: {
                id: true,
                abbreviation: true,
                name: true,
                utc_offset: true
              }
            },
            website: true,
            highlighted: true,
            event_organizer: true,
            subcategory: {
              select: {
                id: true,
                name: true,
                category: {select: {id: true, name: true}}
              }
            },
            publisher: {
              select: {
                id: true,
                full_name: true,
                photo: true,
                photo_json: true
              }
            },
            status: {
              select: {
                id: true,
                name: true
              }
            },
            contact_information: true,
            has_ticket: true,
            ticket_close_time: true,
            Ticket_type: {
              select: {
                id: true,
                type: {
                  select: {
                    id: true,
                    name: true
                  }
                },
                name: true,
                quantity_avaible: true,
                unit_price: true,
                max_quantity_order: true,
                description: true,
                valid_for: true
              }
            },
            LiveStreaming: {
              select: {
                id: true,
                url: true,
                description: true,
                media: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            EventBookmark:{
              select:{
                user_id:true,
                user:{
                  select:{
                    id:true,
                    full_name:true,
                    email:true
                  }
                }
              }
            },
            venue_location:{
              select:{
                geometry_point:true,
                address_description:true,
                venue_name:true,
                srid:true,
                place_id:true,
                city:true,
                state:true,
                zipcode:true,
                country:true,
                address:true
              }
            },
            terms_event: true,
            created_at: true,
            paused_at: true
        },
        where:{
            deleted_at: null, 
            paused_at: null,
            eventPackage: {
                some: {
                    promote_package_id: {not: null},
                    active: true,
                    paused_at: null
                }
            },
            status_id: LISTING_STATUS.ACTIVE,
            highlighted: true
        }
    });

    return { listings, events};
    }
}
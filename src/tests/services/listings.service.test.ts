import config from '../../config';
import {ListingService} from '../../services';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Listing Service Testing', () => {
  let ret: any;
  const listingsService = new ListingService();
  describe('Find Listings', () => {
    describe('Read all', () => {
      const params = {};
      const readListings = [
        {id: 1, title: 'Listing 1'},
        {id: 2, title: 'Listing 1'},
        {id: 6, title: 'Listing 1'}
      ];
      const expectedListingValues = {
        listings: readListings,
        highlighted: 3,
        total: 3,
        cursor: 6,
        pages: 1
      };
      beforeAll(async () => {
        listingsService.listing.findMany = jest
          .fn()
          .mockResolvedValue(readListings);
        listingsService.listing.count = jest.fn().mockResolvedValue(3);

        ret = await listingsService.find(params);
      });
      test('should return an object with a array of listings and data', () => {
        expect(ret).toStrictEqual(expectedListingValues);
      });
    });
  });

  describe('Find listing by id', () => {
    describe('Read listing', () => {
      const readListing = {
        id: 1,
        subcategory: {
          id: 1,
          name: "Subcategory",
          category: {
              id: 1,
              name: "Category"
          }
      },
        user: {
          id: 'c270b5ae-7326-478b-8a20-d18bbd028fda',
          full_name: 'Jonh Doe',
          photo: "",
          photo_json: {
              "32x32": "https://desilist-dev.s3.us-east-2.amazonaws.com/local/50ac05e8-41b6-454a-aad1-cb770edfa68d/Avatar/32x32",
              "128x128": "https://desilist-dev.s3.us-east-2.amazonaws.com/local/50ac05e8-41b6-454a-aad1-cb770edfa68d/Avatar/128x128"
          },
          role_id: 2
        },
        highlighted: false,
        title: 'Listing 1',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        listing_status: {
          id: 3,
          name: 'DRAFT'
        },
        bookmark: [],
        images: [],
        price: 10.0,
        location: {
          city: 'Santa Fe',
          state: 'Santa Fe',
          zip_code: '3000'
        },
        contact: {
          email: 'contact@example.com',
          phone: '+166487965421'
        },
        website: 'www.example.com',
        custom_fields: {
          question1: 'Answer'
        },
        listing_packages: [
          {
              id: 51,
              basic_package: {
                  id: 3,
                  name: '60 days package',
                  duration: 60
              },
              promote_package: null,
              active: false,
              created_at: "2023-01-01T19:51:52.442Z",
              activated_at: null,
              paused_at: null
          }
        ],
        created_at: "2023-01-01T19:50:19.428Z",
        paused_at: null,
        images_json: [
            {}
        ],
        promoted: false
      };
      beforeAll(async () => {
        listingsService.listing.findFirst = jest
          .fn()
          .mockResolvedValue(readListing);
        ret = await listingsService.findById(1);
      });
      test('should return a listing', () => {
        expect(ret).toBe(readListing);
      });
    });
  });

  describe('Create Listing', () => {
    describe('Create listing', () => {
      const createdListing = {
        id: 1,
        subcategory: {
          id: 1,
          name: 'Family'
        },
        user: {
          id: 'c270b5ae-7326-478b-8a20-d18bbd028fda',
          full_name: 'Jonh Doe'
        },
        title: 'Listing 1',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi finibus est at ante blandit bibendum. Ut metus felis, tempus et magna at, consectetur tempor eros.',
        listing_status: {
          id: 1,
          name: 'DRAFT'
        },
        images: [],
        price: 10.0,
        location: {
          city: 'Santa Fe',
          state: 'Santa Fe',
          zip_code: '3000'
        },
        contact: {
          email: 'contact@example.com',
          phone: '+166487965421'
        },
        website: 'www.example.com',
        custom_fields: {
          question1: 'Answer'
        }
      };
      beforeAll(async () => {
        listingsService.listing.create = jest
          .fn()
          .mockResolvedValue(createdListing);
        ret = await listingsService.create({} as any);
      });
      test('should return the created listing', () => {
        expect(ret).toBe(createdListing);
      });
    });
  });

  describe('Update listing by id', () => {
    describe('Update listing', () => {
      const updatedListing = {
        id: '1'
      };
      beforeAll(async () => {
        listingsService.listing.update = jest
          .fn()
          .mockResolvedValue(updatedListing);
        ret = await listingsService.updateById(1, {});
      });
      test('should return the updated listing id', () => {
        expect(ret).toBe(updatedListing);
      });
    });
  });

  describe('Delete listing by id', () => {
    describe('Delete listing', () => {
      beforeAll(async () => {
        listingsService.listing.delete = jest.fn().mockResolvedValue(null);
        ret = await listingsService.deleteById(1);
      });
      test('should delete the listing', () => {
        expect(
          async (): Promise<void> => await listingsService.deleteById(1)
        ).not.toThrow();
      });
    });
  });
});

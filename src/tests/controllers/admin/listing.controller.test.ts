import config  from '../../../config';
import {STATUS_CODES, UserRoles} from '../../../constants';
import ListingsController from '../../../controllers/admin/listings.controller';
import interceptors from '../../interceptors';

// workaround to load env vars from dotenv
beforeAll(async () => {
  const env = process.env
  env.NOTIFICATION_SERVICE_ENABLED="false";
  process.env = {...env}
  console.log(process.env);
  //config;
});


afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Testing Listing Controller', () => {
  let req: any, res: any, next: any;
  const listingController = new ListingsController();
  describe('getListings', () => {
    describe('Read all', () => {
      const readListings = {
        listings: [
          {
            id: 1,
            name: 'Listing 1',
            images: [],
            user: {
              id: 'd03b59e7-3fb8-4a0d-8546-8a5f0680b065',
              full_name: 'Angelica Turner',
              photo: null
            }
          },
          {
            id: 2,
            email: 'Listing 2',
            user: {
              id: '526f0848-eeeb-43ed-8170-e559864784c7',
              full_name: 'Morris Lubowitz',
              photo: null
            }
          }
        ],
        total: 2,
        cursor: 2,
        pages: 1
      };
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        listingController.listings.find = jest
          .fn()
          .mockResolvedValue(readListings);

        await listingController.getListings(req, res, next);
      });
      test('should return all listings', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          data: readListings,
          message: 'findAll'
        });
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        listingController.listings.find = jest.fn().mockImplementation(() => {
          throw new Error('Server Error');
        });

        await listingController.getListings(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });

  describe('getListingById', () => {
    let reqParams: any;
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
        listing_packages: [],
        created_at: "2023-01-01T19:50:19.428Z",
        paused_at: null,
        images_json: [
            {}
        ],
        promoted: false
      };
      beforeAll(async () => {
        reqParams = {id: 1};
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        listingController.listings.findById = jest
          .fn()
          .mockResolvedValue(readListing);

        await listingController.getListingById(req, res, next);
      });
      test('should return the listing', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          data: readListing,
          message: 'findOne'
        });
      });
    });

    describe('Listing do not exists', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        listingController.listings.findById = jest.fn().mockResolvedValue(null);

        await listingController.getListingById(req, res, next);
      });
      test('should throw user not found error', () => {
        expect(next).toBeCalledWith(new Error('Listing not found'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });

  describe('Create listing', () => {
    describe('create a listing', () => {
      beforeAll(async () => {
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        const reqBody = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
        req.body = reqBody;

        listingController.listings.create = jest
          .fn()
          .mockResolvedValue({id: 1});

        await listingController.createListing(req, res, next);
      });
      test('should return created listing', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.CREATED);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          message: 'created'
        });
      });
    });

    describe('Should throw too many files error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        const imgBase64 =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII=';

        const reqBody = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
          listing_status: {
            id: 1,
            name: 'DRAFT'
          },
          images: [
            imgBase64,
            imgBase64,
            imgBase64,
            imgBase64,
            imgBase64,
            imgBase64,
            imgBase64
          ],
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
        req.body = reqBody;

        listingController.listings.create = jest
          .fn()
          .mockResolvedValue({id: 1});

        res.status = jest.fn().mockImplementation(() => {
          throw new Error('Too many files');
        });

        await listingController.createListing(req, res, next);
      });
      test('should throw Too many files error', () => {
        expect(next).toBeCalledWith(new Error('Too many files'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        listingController.listings.create = jest.fn().mockResolvedValue(null);

        res.status = jest.fn().mockImplementation(() => {
          throw new Error('Server Error');
        });

        await listingController.createListing(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });

  describe('Update Listing', () => {
    let reqBody: any;
    let reqParams: any;
    describe('update user data', () => {
      beforeAll(async () => {
        reqParams = {id: 1};
        reqBody = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;
        req.body = reqBody;
        req.user = {
          id: 'c270b5ae-7326-478b-8a20-d18bbd028fda',
          name: 'Jhon Doe',
          role_id: UserRoles.ADMIN
        };

        listingController.listings.findById = jest
          .fn()
          .mockResolvedValue(reqBody);

        listingController.listings.updateById = jest
          .fn()
          .mockResolvedValue({id: 1});

        await listingController.updateListing(req, res, next);
      });
      test('should update the listing', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          message: 'updated'
        });
      });
    });

    describe('Listing do not exists', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequest();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        listingController.listings.findById = jest.fn().mockResolvedValue(null);

        await listingController.updateListing(req, res, next);
      });
      test('should throw Listing not found error', () => {
        expect(next).toBeCalledWith(new Error('Listing not found'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });

    // Managed by ACL middleware
    /*
    describe('User not authorized', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        req.user = {
          id: 'c270b5ae-7326-478b-8a20-d18bbd028fda',
          name: 'Jhon Doe',
          role_id: UserRoles.USER
        };

        const listingData = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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

        listingController.listings.findById = jest
          .fn()
          .mockResolvedValue(listingData);

        await listingController.updateListing(req, res, next);
      });
      test('should throw User lack permission of error', () => {
        expect(next).toBeCalledWith(new Error('Insufficient Permissions'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
    */
  });

  describe('Delete Listing', () => {
    let reqParams: any;
    describe('delete the listing', () => {
      beforeAll(async () => {
        reqParams = {id: 1};
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        req.user = {
          id: 'c270b5ae-7326-478b-8a20-d18bbd028fda',
          name: 'Jhon Doe',
          role_id: UserRoles.ADMIN
        };

        const listingData = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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

        listingController.listings.findById = jest
          .fn()
          .mockResolvedValue(listingData);

        listingController.listings.updateById = jest
          .fn()
          .mockResolvedValue({id: 1});

        await listingController.deleteListing(req, res, next);
      });
      test('should delete the listing', () => {
        expect(res.status).toHaveBeenCalledWith(STATUS_CODES.OK);
        expect(res.json).toHaveBeenCalledTimes(1);
        expect(res.json.mock.calls.length).toBe(1);
        expect(res.json).toHaveBeenCalledWith({
          message: 'deleted'
        });
      });
    });

    describe('Listing do not exists', () => {
      beforeAll(async () => {
        reqParams = {id: '12345'};
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        listingController.listings.findById = jest.fn().mockResolvedValue(null);

        await listingController.deleteListing(req, res, next);
      });
      test('should throw Listing not found error', () => {
        expect(next).toBeCalledWith(new Error('Listing not found'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });

    // Manage by ACL middleware
    /*
    describe('Insufficient Permissions', () => {
      beforeAll(async () => {
        reqParams = {id: 1};
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();
        req.params = reqParams;

        req.user = {
          id: 'd0c7dbcf-248b-4c18-a361-2b5ab7429405',
          name: 'NOT Jhon Doe',
          role_id: UserRoles.USER
        };

        const listingData = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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

        listingController.listings.findById = jest
          .fn()
          .mockResolvedValue(listingData);

        listingController.listings.updateById = jest
          .fn()
          .mockResolvedValue({id: 1});

        await listingController.deleteListing(req, res, next);
      });
      test('should throw Insufficient Permissions error', () => {
        expect(next).toBeCalledWith(new Error('Insufficient Permissions'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
    */

    describe('Should throw error', () => {
      beforeAll(async () => {
        req = interceptors.mockRequestWithUser();
        res = interceptors.mockResponse();
        next = interceptors.mockNext();

        req.user = {
          id: 'c270b5ae-7326-478b-8a20-d18bbd028fda',
          full_name: 'Jonh Doe',
          role_id: UserRoles.ADMIN
        };
        const listingData = {
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
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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

        listingController.listings.findById = jest
          .fn()
          .mockResolvedValue(listingData);
        listingController.listings.updateById = jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Server Error');
          });

        await listingController.deleteListing(req, res, next);
      });
      test('should throw an error', () => {
        expect(next).toBeCalledWith(new Error('Server Error'));
        expect(next).toHaveBeenCalledTimes(1);
        expect(next.mock.calls.length).toBe(1);
      });
    });
  });
});

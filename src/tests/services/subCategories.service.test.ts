import config from '../../config';
import {SubCategoryService} from '../../services';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Sub-Categories Service Testing', () => {
  let ret: any;
  const subCategoryService = new SubCategoryService();
  describe('Find Sub-Categories', () => {
    describe('Read all', () => {
      const readSubCategories = [
        {
          id: 1,
          name: 'subcategory_1',
          icon: '',
          image: '',
          category: {
            id: '12345',
            name: 'category_1'
          },
          _count: {
            listings: 2
          }
        },
        {
          id: 2,
          name: 'subcategory_2',
          icon: '',
          image: '',
          category: {
            id: '67890',
            name: 'category_2'
          },
          _count: {
            listings: 2
          }
        }
      ];
      const expectedValue = {
        subCategories: readSubCategories,
        total: 2,
        cursor: 2
      };
      beforeAll(async () => {
        subCategoryService.subcategory.findMany = jest
          .fn()
          .mockResolvedValue(readSubCategories);
        subCategoryService.subcategory.count = jest.fn().mockResolvedValue(2);
        subCategoryService.listing.count = jest.fn().mockResolvedValue(2);
        ret = await subCategoryService.find();
      });
      test('should return an array of sub-categories', () => {
        expect(ret).toStrictEqual(expectedValue);
      });
    });
  });

  describe('Find Sub-Category by id', () => {
    describe('Read sub-category', () => {
      const readSubCategory = {
        id: '12345',
        name: 'subcategory_1',
        icon: '',
        image: '',
        category: {
          id: '12345',
          name: 'category_1'
        }
      };
      beforeAll(async () => {
        subCategoryService.subcategory.findUnique = jest
          .fn()
          .mockResolvedValue(readSubCategory);
        ret = await subCategoryService.findById(1);
      });
      test('should return a sub-category', () => {
        expect(ret).toBe(readSubCategory);
      });
    });
  });

  describe('Find Sub-Category by category id', () => {
    describe('Read sub-category by category', () => {
      const readSubCategory = [
        {
          id: '12345',
          name: 'subcategory_1',
          icon: '',
          image: '',
          category: {
            id: '12345',
            name: 'category_1'
          }
        },
        {
          id: '67890',
          name: 'subcategory_2',
          icon: '',
          image: '',
          category: {
            id: '67890',
            name: 'category_2'
          }
        }
      ];
      beforeAll(async () => {
        subCategoryService.subcategory.findMany = jest
          .fn()
          .mockResolvedValue(readSubCategory);
        ret = await subCategoryService.findByCategoryId(1);
      });
      test('should return a sub-category array', () => {
        expect(ret).toBe(readSubCategory);
      });
    });
  });
});

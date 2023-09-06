import config from '../../config';
import {CategoryService} from '../../services';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Categories Service Testing', () => {
  let ret: any;
  const categoryService = new CategoryService();
  describe('Find Categories', () => {
    describe('Read all', () => {
      const readCategories = [
        {
          id: 1,
          name: 'Profesional Jobs',
          listings: 16
        },
        {
          id: 2,
          name: 'Professional Services',
          listings: 14
        }
      ];
      beforeAll(async () => {
        categoryService.findCategoriesQuery = jest
          .fn()
          .mockResolvedValue(readCategories);
        ret = await categoryService.find();
      });
      test('should return an array of categories', () => {
        expect(ret).toBe(readCategories);
      });
    });
  });

  describe('Find Category by id', () => {
    describe('Read category', () => {
      const readCategory = {
        id: '12345',
        name: 'category',
        icon: '',
        image: ''
      };
      beforeAll(async () => {
        categoryService.category.findUnique = jest
          .fn()
          .mockResolvedValue(readCategory);
        ret = await categoryService.findById(1);
      });
      test('should return a category', () => {
        expect(ret).toBe(readCategory);
      });
    });
  });
});

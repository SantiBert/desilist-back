import config from '../../../config';
import {CategoryService} from '../../../services/admin/categories.service';

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

  describe('Create Category', () => {
    describe('Create category', () => {
      const createdCategory = {
        id: '12345',
        name: 'category'
      };
      beforeAll(async () => {
        categoryService.category.create = jest
          .fn()
          .mockResolvedValue(createdCategory);
        ret = await categoryService.create({} as any);
      });
      test('should return the created category', () => {
        expect(ret).toBe(createdCategory);
      });
    });
  });

  describe('Update Category by id', () => {
    describe('Update category', () => {
      const updatedCategory = {
        id: '12345'
      };
      beforeAll(async () => {
        categoryService.category.update = jest
          .fn()
          .mockResolvedValue(updatedCategory);
        ret = await categoryService.updateById(1, {});
      });
      test('should return the updated category id', () => {
        expect(ret).toBe(updatedCategory);
      });
    });
  });

  describe('Delete Category by id', () => {
    describe('Delete category', () => {
      beforeAll(async () => {
        categoryService.category.delete = jest.fn().mockResolvedValue(null);
        ret = await categoryService.deleteById(1);
      });
      test('should delete the category', () => {
        expect(
          async (): Promise<void> => await categoryService.deleteById(1)
        ).not.toThrow();
      });
    });
  });
});

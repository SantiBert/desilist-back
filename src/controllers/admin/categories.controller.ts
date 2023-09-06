import {NextFunction, Request, Response} from 'express';
import {CategoryService} from '@/services/admin/categories.service';
import {STATUS_CODES} from '@/constants';
import {UpdateCategoryDto, UpdateCategoryOrderDto} from '@/dtos/categories.dto';
import {Category} from '@prisma/client';
import {categoryNotFoundException} from '@/errors/categories.error';

class AdminCategoriesController {
  public categories = new CategoryService();

  public getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const usersData: Partial<Category>[] = await this.categories.find();

      res.status(STATUS_CODES.OK).json({data: usersData, message: 'findAll'});
    } catch (error) {
      next(error);
    }
  };

  public getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findCategory: Partial<Category> = await this.categories.findById(
        id
      );
      if (!findCategory) {
        throw categoryNotFoundException('Category not found');
      }

      res
        .status(STATUS_CODES.OK)
        .json({data: findCategory, message: 'findOne'});
    } catch (error) {
      next(error);
    }
  };

  public createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const categoryData = req.body;
      await this.categories.create(categoryData);

      res.status(STATUS_CODES.CREATED).json({message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData: UpdateCategoryDto = req.body;

      await this.categories.updateById(id, updateData);

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.categories.deleteById(id);

      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public updateCategoryOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateOrderData: UpdateCategoryOrderDto = req.body;

      for (const categoryData of updateOrderData.categories) {
        await this.categories.updateById(categoryData.id, {
          order: categoryData.order
        });
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };
}

export default AdminCategoriesController;

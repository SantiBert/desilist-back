import {NextFunction, Request, Response} from 'express';
import {Category} from '@prisma/client';
import {CategoryService} from '@/services';
import {STATUS_CODES} from '@/constants';
import {categoryNotFoundException} from '@/errors/categories.error';

class CategoriesController {
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
}

export default CategoriesController;

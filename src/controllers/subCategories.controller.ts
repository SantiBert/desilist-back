import {NextFunction, Request, Response} from 'express';
import {Subcategory} from '@prisma/client';
import {SubCategoryService} from '@/services';
import {STATUS_CODES} from '@/constants';
import {categoryNotFoundException} from '@/errors/categories.error';
import {GetAllSubCategories} from '@/interfaces/subCategories.interface';

class SubCategoriesController {
  public subCategories = new SubCategoryService();

  public getSubCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const params = req.query;
      const subCategoriesData: Partial<GetAllSubCategories> =
        await this.subCategories.find(params);
      const {subCategories, total, cursor} = subCategoriesData;

      res
        .status(STATUS_CODES.OK)
        .json({data: {subCategories, total, cursor}, message: 'findAll'});
    } catch (error) {
      next(error);
    }
  };


  public getSubCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const findCategory: Partial<Subcategory> =
        await this.subCategories.findById(id);
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

export default SubCategoriesController;

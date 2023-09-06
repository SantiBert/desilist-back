import {NextFunction, Request, Response} from 'express';
import {SubCategoryService} from '@/services/admin/subCategories.service';
import {ListingService} from '@/services/admin/listings.service';
import {STATUS_CODES} from '@/constants';
import {GetAllSubCategories} from '@/interfaces/subCategories.interface';
import {SubcategoriesPricringService} from '@/services';
import {BasicPricingPackageService} from '@/services/basicPricingPackages';
import {
  pricingUndefinedException,
  subcategoryAlreadyExistsException,
  subcategoryWithActiveListingsException
} from '@/errors/subcategories.error';
import {Subcategory} from '@prisma/client';
import {UpdateSubCategoryOrderDto} from '@/dtos/subCategories.dto';

class SubCategoriesController {
  public subCategories = new SubCategoryService();
  public subCategoriesPricing = new SubcategoriesPricringService();
  public basicPricingPackages = new BasicPricingPackageService();
  public listings = new ListingService();

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

  public createSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subcategoryData = req.body;
      const subcategoryDataCopy = Object.assign({}, subcategoryData);
      const packages = ['basic_pricing_package', 'promote_pricing_package'];

      const subcategories = await this.subCategories.findByName(
        subcategoryData.name
      );

      for (let i = 0; i < subcategories.length; ++i) {
        if (!subcategories[i].deleted_at) {
          throw subcategoryAlreadyExistsException(
            'This subcategory already exists'
          );
        }
      }

      const packagesMax = (await this.basicPricingPackages.findAll()).length;
      const basicPackLen = !subcategoryData.free
        ? subcategoryData.basic_pricing_package.length
        : packagesMax;
      if (
        !subcategoryData.free &&
        (!basicPackLen || basicPackLen < packagesMax)
      ) {
        throw pricingUndefinedException(
          'You need to define the pricing for a non free subcategory'
        );
      }
      delete subcategoryDataCopy[packages[0]];
      delete subcategoryDataCopy[packages[1]];

      const subcategoriesOrder: Partial<GetAllSubCategories> =
        await this.subCategories.find({
          categoryId: subcategoryDataCopy.category_id,
          take: -1
        });

      // add order before create subcategory
      const lastOrder: Subcategory = subcategoriesOrder.subCategories.reduce(
        // eslint-disable-next-line no-confusing-arrow
        (prev: Subcategory, current: Subcategory) =>
          prev.order > current.order ? prev : current
      );
      subcategoryDataCopy.order = lastOrder.order + 1;

      const subcategory = await this.subCategories.create(subcategoryDataCopy);
      // if the subcategory is for free, create the basic packages pricing by hand
      if (subcategoryData.free) {
        // if basic_packages in req.body has at least 1 basic_per_day price defined
        if (subcategoryData.basic_pricing_package.length) {
          for (let i = 1; i <= packagesMax; ++i) {
            const basicPricePackage =
              subcategoryData.basic_pricing_package.find(
                (item) => item.id === i
              );
            if (basicPricePackage.basic_per_day === null) {
              basicPricePackage.basic_per_day = 10;
            }
          }
        } else {
          // if basic_packages in req.body is empty
          for (let i = 1; i <= packagesMax; ++i) {
            subcategoryData.basic_pricing_package.push({
              id: i,
              // basic_per_day: 0.1
              basic_per_day: 10 // need to be integer, price is in cents
            });
          }
        }
      }
      const subcategoryPricing = [];
      // if basicPackLen was empty in body, skip this part. Fixed with a default value for basicPackLen
      for (let i = 0; i < basicPackLen; ++i) {
        const sp = {};
        sp['subcategory_id'] = subcategory.id;
        sp['basic_pricing_id'] = subcategoryData[packages[0]][i].id;
        sp['promote_pricing_id'] = subcategoryData[packages[1]][i].id;
        sp['basic_per_day'] = subcategoryData[packages[0]][i].basic_per_day;
        sp['promote_per_day'] = subcategoryData[packages[1]][i].promote_per_day;
        subcategoryPricing.push(sp);
      }
      for (const subcp of subcategoryPricing) {
        await this.subCategoriesPricing.create(subcp);
      }

      res.status(STATUS_CODES.CREATED).json({message: 'created'});
    } catch (error) {
      next(error);
    }
  };

  public updateSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData = req.body;
      const subcategoryDataCopy = Object.assign({}, updateData);
      const packages = ['basic_pricing_package', 'promote_pricing_package'];

      delete subcategoryDataCopy[packages[0]];
      delete subcategoryDataCopy[packages[1]];

      await this.subCategories.updateById(id, subcategoryDataCopy);

      const subcategoryPricing = [];

      for (let i = 0; i < updateData.basic_pricing_package.length; ++i) {
        const sp = {};
        sp['subcategory_id'] = id;
        sp['basic_pricing_id'] = updateData[packages[0]][i].id;
        sp['promote_pricing_id'] = updateData[packages[1]][i].id;
        sp['basic_per_day'] = updateData[packages[0]][i].basic_per_day;
        sp['promote_per_day'] = updateData[packages[1]][i].promote_per_day;
        subcategoryPricing.push(sp);
      }

      for (const pricing of subcategoryPricing) {
        await this.subCategoriesPricing.updateById(
          id,
          pricing.basic_pricing_id,
          pricing.promote_pricing_id,
          {
            basic_per_day: pricing.basic_per_day,
            promote_per_day: pricing.promote_per_day
          }
        );
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const subCategoryToDelete: any = await this.subCategories.findById(id);
      const listings = await this.listings.findBySubcategoryId(id);
      if (listings.length) {
        throw subcategoryWithActiveListingsException(
          'This subcategory has listings'
        );
      }
      await this.subCategories.deleteById(id);

      if (subCategoryToDelete.category.id) {
        // after delete, re order subcategories
        const subCategoriesData: GetAllSubCategories =
          await this.subCategories.find({
            category_id: subCategoryToDelete.category.id
          });

        let order = 1;
        for (const subCategory of subCategoriesData.subCategories) {
          await this.subCategories.updateById(subCategory.id, {order});
          order += 1;
        }
      }
      res.status(STATUS_CODES.OK).json({message: 'deleted'});
    } catch (error) {
      next(error);
    }
  };

  public updateSubCategoryOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateOrderData: UpdateSubCategoryOrderDto = req.body;

      for (const subCategoryData of updateOrderData.subcategories) {
        await this.subCategories.updateById(subCategoryData.id, {
          order: subCategoryData.order,
          landing_show: subCategoryData.landingShow
        });
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };
}

export default SubCategoriesController;

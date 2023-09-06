import { NextFunction, Request, Response } from 'express';
import { EventSubcategory } from '@prisma/client';
import { EventSubCategoryService } from '@/services/eventSubCategories.service';
import { EventsService } from '@/services';
import { STATUS_CODES } from '@/constants';
import { GetAllEventsSubCategories } from '@/interfaces/eventSubCategories.interface';
import {
  CreateEventSubcategoryDto,
  UpdateEventSubCategoryOrderDto,
  UpdateEventSubcategoryDto
} from '@/dtos/eventSubCategories.dto';
import { pricingUndefinedException, subcategoryAlreadyExistsException } from '@/errors/eventsSubcategories.error';
import { PromotePricingPackageService } from '@/services/promotePricingPackage';
import { EventPriceService } from '@/services/eventPrice.service';
import { subcategoryNotFoundException, subcategoryWithActiveListingsException } from '@/errors/eventsSubcategories.error';

class AdminEventSubcategoryController {

  public event_subcategory = new EventSubCategoryService();
  public events = new EventsService();
  public promotePricinginPackages = new PromotePricingPackageService();
  public subCategoriesPricing = new EventPriceService();

  public createEventSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subcategoryData = req.body;
      const subcategoryDataCopy = Object.assign({}, subcategoryData);
      const packages = ['promote_pricing_package'];

      const subcategories = await this.event_subcategory.findByName(
        subcategoryData.name
      );

      for (let i = 0; i < subcategories.length; ++i) {
        if (!subcategories[i].deleted_at) {
          throw subcategoryAlreadyExistsException(
            'This subcategory already exists'
          );
        }
      }

      const packagesMax = (await this.promotePricinginPackages.findAll()).length;
      const promotePackLen = !subcategoryData.is_free
        ? subcategoryData.promote_pricing_package.length
        : packagesMax;
      // if (
      //   !subcategoryData.is_free &&
      //   (!basicPackLen || basicPackLen < packagesMax)
      // ) {
      if (!subcategoryData.is_free && !subcategoryData.event_publication_price) {
        throw pricingUndefinedException(
          'You need to define the pricing for a non free subcategory'
        );
      }
      delete subcategoryDataCopy[packages[0]];

      const subcategoriesOrder: Partial<GetAllEventsSubCategories> =
        await this.event_subcategory.find({
          categoryId: subcategoryDataCopy.category_id,
          take: -1
        });

      const emptySubCategories: EventSubcategory = {
        id: 0,
        category_id: 0,
        name: "empty",
        custom_fields: [],
        created_at: null,
        updated_at: null,
        deleted_at: null,
        is_free: false,
        list_order: 0,
        showed_landing: false,
        service_fee: null,
        event_publication_price: null
      }
      // add order before create subcategory
      const lastOrder: EventSubcategory = subcategoriesOrder.subCategories.reduce(
        // eslint-disable-next-line no-confusing-arrow
        (prev: EventSubcategory, current: EventSubcategory) =>
          prev.list_order > current.list_order ? prev : current
        , emptySubCategories
      );
      subcategoryDataCopy.list_order = lastOrder.list_order + 1;

      const subcategory = await this.event_subcategory.create(subcategoryDataCopy);
      
      const subcategoryPricing = [];
      // if basicPackLen was empty in body, skip this part. Fixed with a default value for basicPackLen
      for (let i = 0; i < promotePackLen; ++i) {
        const sp = {};
        sp['event_subcategory_id'] = subcategory.id;
        sp['promote_pricing_id'] = subcategoryData[packages[0]][i].id;
        sp['promote_per_day'] = subcategoryData[packages[0]][i].promote_per_day;
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

  public updateEventSubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const updateData = req.body;
      const subcategoryDataCopy = Object.assign({}, updateData);
      const packages = ['promote_pricing_package'];

      delete subcategoryDataCopy[packages[0]];

      await this.event_subcategory.updateById(id, subcategoryDataCopy);

      const subcategoryPricing = [];

      for (let i = 0; i < updateData.promote_pricing_package.length; ++i) {
        const sp = {};
        sp['event_subcategory_id'] = id;
        sp['promote_pricing_id'] = updateData[packages[0]][i].id;
        sp['promote_per_day'] = updateData[packages[0]][i].promote_per_day;
        subcategoryPricing.push(sp);
      }

      for (const pricing of subcategoryPricing) {
        await this.subCategoriesPricing.updateById(
          id,
          pricing.promote_pricing_id,
          {
            promote_per_day: pricing.promote_per_day
          }
        );
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };

  public deleteEventSubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const eventSubcategoryExist: Partial<EventSubcategory> = await this.event_subcategory.findById(id);

      if (!eventSubcategoryExist) {
        throw subcategoryNotFoundException("sub category not found")
      }

      const getActiveEvents = await this.events.findActivesBySubCategoryId(id);

      if(getActiveEvents > 0){
        throw subcategoryWithActiveListingsException("Subcategory with active events")
      }

      await this.event_subcategory.delete(
        id
      );
      
      res
      .status(STATUS_CODES.OK)
      .json({message: 'event subcategory deleted'});

    } catch (error) {
      next(error);
    }
  };

  public getEventSubcategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const eventSubcategoryData: Partial<EventSubcategory> =
        await this.event_subcategory.findById(id);
        
      if (!eventSubcategoryData) {
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'event subcategory not found'});
      } else {
        res
        .status(STATUS_CODES.OK)
        .json({data: eventSubcategoryData, message: 'findOne'});
      }
    } catch (error) {
      next(error);
    }
  };

  public getEventSubCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventSubCategoriesData: Partial<GetAllEventsSubCategories> = await this.event_subcategory.find();
      const {subCategories, total, cursor} = eventSubCategoriesData;
      res
      .status(STATUS_CODES.OK)
      .json({data: {subCategories, total, cursor}, message: 'findAll'});
    } catch (error) {
      next(error);
    }
  };

  public updateEventSubCategoryOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const updateOrderData: UpdateEventSubCategoryOrderDto = req.body;

      for (const subCategoryData of updateOrderData.subcategories) {
        await this.event_subcategory.updateById(subCategoryData.id, {
          list_order: subCategoryData.order,
          showed_landing: subCategoryData.landingShow
        });
      }

      res.status(STATUS_CODES.OK).json({message: 'updated'});
    } catch (error) {
      next(error);
    }
  };
}

export default AdminEventSubcategoryController;
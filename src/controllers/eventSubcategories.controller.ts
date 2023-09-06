import { NextFunction, Request, Response } from 'express';
import { EventSubcategory } from '@prisma/client';
import { EventSubCategoryService } from '@/services/eventSubCategories.service';
import { STATUS_CODES } from '@/constants';

import { EventSubcategoryRequest, GetAllEventsSubCategories } from '@/interfaces/eventSubCategories.interface';

import {
  CreateEventSubcategoryDto,
  UpdateEventSubcategoryDto
} from '@/dtos/eventSubCategories.dto';

class EventSubcategoryController {

  public event_subcategory = new EventSubCategoryService();

  public createEventSubCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const eventSubcategoryData: EventSubcategoryRequest = req.body;

      const createdEventSubcategory = await this.event_subcategory.create(
        eventSubcategoryData
      );
      res.status(STATUS_CODES.OK).json({ message: 'event subcategory created' });
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
      const eventSubcategoryData: EventSubcategoryRequest = req.body;

      const eventSubcategoryExist: Partial<EventSubcategory> = await this.event_subcategory.findById(id);

      if (!eventSubcategoryExist) {
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'event subcategory not found'});
      } else {
        const upDatedEventSubcategory = await this.event_subcategory.updateById(
          id,
          eventSubcategoryData
        );
        
        res
        .status(STATUS_CODES.OK)
        .json({message: 'event subcategory updated'});
      }
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
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'event subcategory not found'});
      } else {
        const deletedEventSubcategory= await this.event_subcategory.delete(
          id
        );
        
        res
        .status(STATUS_CODES.OK)
        .json({message: 'event subcategory deleted'});
      }
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
      const eventSubCategoriesData: GetAllEventsSubCategories = await this.event_subcategory.find();
      const {subCategories, total, cursor} = eventSubCategoriesData;

      res
        .status(STATUS_CODES.OK)
        .json({data: {subCategories, total, cursor}, message: 'findAll'});
    } catch (error) {
      next(error);
    }
  };
}

export default EventSubcategoryController;
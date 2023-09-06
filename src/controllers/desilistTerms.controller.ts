import { NextFunction, Request, Response } from 'express';
import { DesilistTerms } from '@prisma/client';
import { DesilistTermsService } from '@/services';
import { STATUS_CODES } from '@/constants';

import {
  CreateDesilistTermsDto,
  UpdateDesilistTermsDto
} from '@/dtos/desilistTerms.dto';

class DesilistTermsController {

  public desilist_terms = new DesilistTermsService();

  public getAllDesilistTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const desilistTermsData: Partial<DesilistTerms>[] = await this.desilist_terms.find();

      if (!desilistTermsData) {
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'desilist terms not found'});
      } else {
        res
        .status(STATUS_CODES.OK)
        .json({
          data: desilistTermsData,
          message: 'findAll'

        });
      }
    } catch (error) {
      next(error);
    }
  };
  public getDesilistTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const desilistTermsData: Partial<DesilistTerms> = await this.desilist_terms.findById(id);

      if (!desilistTermsData) {
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'desilist terms not found'});
      } else {
        res
        .status(STATUS_CODES.OK)
        .json({data: desilistTermsData});
      }
    } catch (error) {
      next(error);
    }
  };
  
}

export default DesilistTermsController;
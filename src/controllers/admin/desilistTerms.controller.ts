import { NextFunction, Request, Response } from 'express';
import { DesilistTerms } from '@prisma/client';
import { AdminDesilistTermsService } from '@/services';
import { STATUS_CODES } from '@/constants';

import {
  CreateDesilistTermsDto,
  UpdateDesilistTermsDto
} from '@/dtos/desilistTerms.dto';

class AdminDesilistTermsController {

  public desilist_terms = new AdminDesilistTermsService();

  public createDesilistTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const desilistTermsData: CreateDesilistTermsDto = req.body;

      const createdDesilistTerms = await this.desilist_terms.create(
        desilistTermsData
      );
      res.status(STATUS_CODES.OK).json({ message: 'desilist terms created' });
    } catch (error) {
      next(error);
    }
  };

  public updateDesilistTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const desilistTermsData: UpdateDesilistTermsDto = req.body;

      const desilistTermsExist: Partial<DesilistTerms> = await this.desilist_terms.findById(id);

      if (!desilistTermsExist) {
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'desilist terms not found'});
      } else {
        const updatedDesilistTerms: Partial<DesilistTerms> = await this.desilist_terms.updateById(
          id,
          desilistTermsData
        );
        
        res
        .status(STATUS_CODES.OK)
        .json({message: 'desilist terms updated'});
      }
    } catch (error) {
      next(error);
    }
  };

  public deleteDesilistTerm = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);

      const desilistTermsExist: Partial<DesilistTerms> = await this.desilist_terms.findById(id);

      if (!desilistTermsExist) {
        res
        .status(STATUS_CODES.NOT_FOUND)
        .json({message: 'desilist terms not found'});
      } else {
        const deletedDesilistTerms = await this.desilist_terms.delete(
          id
        );
        
        res
        .status(STATUS_CODES.OK)
        .json({message: 'desilist terms deleted'});
      }
    } catch (error) {
      next(error);
    }
  };

}

export default AdminDesilistTermsController;
import {NextFunction, Request, Response} from 'express';
import {SubcategoriesPricringService} from '@/services';

export class SubcategoriesPricingController {
  public subcategoryPricing = new SubcategoriesPricringService();

  public findPricingBySubcategory = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const subcategoryId = parseInt(req.params.id);

      const pricing = await this.subcategoryPricing.findPricingBySubcategory(
        subcategoryId
      );

      res.status(200).json({data: {pricing}, message: 'Pricing retrieved'});
    } catch (error) {
      next(error);
    }
  };
}

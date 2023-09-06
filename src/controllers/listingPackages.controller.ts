import {NextFunction, Response} from 'express';
import {STATUS_CODES} from '@/constants';
import {CreatePackageDto} from '@/dtos/listingPackages.dto';
import {RequestWithUser} from '@/interfaces/auth.interface';
import {ListingPackageService} from '@/services';
import {ListingService} from '@/services/admin/listings.service';
import {getISONow} from '@/utils/time';
import {SubCategoryService} from '@/services';
import {listingNotFoundException} from '@/errors/listings.error';
import {
  alreadyActivePackageException,
  freePackageMissmatchException,
  promoteNotFreeException,
  subcategoryNotFreeException
} from '@/errors/listingPackages.error';
import config from '@/config';

class ListingPackageController {
  private listingPackageService = new ListingPackageService();
  private listingService = new ListingService();
  private subcategoryService = new SubCategoryService();

  public create = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pack: CreatePackageDto = req.body;

      const findListing: any = await this.listingService.findById(
        pack.listing_id
      );
      if (!findListing) {
        throw listingNotFoundException('Listing not found');
      }

      const subcategory = await this.subcategoryService.findById(
        findListing.subcategory.id
      );
      if (!subcategory.free) {
        throw subcategoryNotFreeException(
          'Cannot add a package for free to this listing'
        );
      }

      if (subcategory.free && pack.promote_package_id !== null) {
        throw promoteNotFreeException('Cannot promote for free');
      }

      const activePackage = await this.listingPackageService.findActivePackage(
        pack.listing_id
      );

      if (activePackage) {
        throw alreadyActivePackageException(
          'Listing already has a FREE package active'
        );
      }
      if (
        pack.basic_package_id !== config.listings_packages.freeCategoryPackage
      ) {
        throw freePackageMissmatchException('Not a validate FREE package');
      }

      pack['active'] = activePackage ? false : true;
      pack['activated_at'] = activePackage ? null : getISONow();
      pack['created_by'] = req.user.id;
      const newPack = await this.listingPackageService.create(pack as any);

      await this.listingService.publishById(pack.listing_id);

      res
        .status(STATUS_CODES.OK)
        .json({data: {id: newPack.id}, message: 'created'});
    } catch (error) {
      next(error);
    }
  };
}

export default ListingPackageController;

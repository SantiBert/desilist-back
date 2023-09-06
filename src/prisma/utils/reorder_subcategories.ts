import config from '@/config';
import prisma from '@/db';
import { CategoryService } from '@/services/admin/categories.service';
import { SubCategoryService } from '@/services/admin/subCategories.service';

async function reOrderSubCategories(): Promise<void> {
    const categoryService = new CategoryService();
    const subCategoryService = new SubCategoryService();

    const categoriesData = await categoryService.find();

    let order = 0;
    for ( const category of categoriesData) {
        order = 1;
        const subCategoryData = await subCategoryService.find({
          category_id: category.id
        })
        for ( const subCategory of subCategoryData.subCategories) {
          await subCategoryService.updateById(subCategory.id, {order: order});
          order += 1;
        }
    };
}

reOrderSubCategories()
  .then(() => {
    console.log('Sub Categories were re arranged');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
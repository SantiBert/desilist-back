import config from '@/config';
import prisma from '@/db';
import { CategoryService } from '@/services/admin/categories.service';

async function reOrderCategories(): Promise<void> {
    const categoryService = new CategoryService();

    const categoriesData:any = await categoryService.find();

    let order = 1;
    for ( const category of categoriesData) {
        await categoryService.updateById(
            category.id,
            {
                order: order
            }
        )
        order += 1;
    };
}

reOrderCategories()
  .then(() => {
    console.log('Categories were re arranged');
    process.exit(0);
  })
  .catch((e) => {
    console.log(e);
    throw e;
  });
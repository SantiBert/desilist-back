import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function seedEventSubCategories() {
    const category =  await prisma.category.findUnique({where:{name:'Event'}})
    const promotePricingPackageIds = [
        {
            id:1,
            promote_per_day:4

        },
        {
            id:2,
            promote_per_day:3

        },
        {
            id:3,
            promote_per_day:2

        },
        {
            id:4,
            promote_per_day:1

        },
        
    ]

    const eventSubCategories = [
        {
            name:"Concert",
            category_id:category.id,
            event_publication_price:0,
            service_fee: 2.5,
            custom_fields:[],
            is_free:true,
            list_order:1,
            showed_landing:true,
        },
        {
            name:"Nightclub",
            category_id:category.id,
            event_publication_price:0,
            service_fee: 2.5,
            custom_fields:[],
            is_free:true,
            list_order:2,
            showed_landing:true
        },
        {
            name:"Comedy",
            category_id:category.id,
            service_fee: 2.5,
            custom_fields:[],
            is_free:true,
            list_order:3,
            showed_landing:true
        },
        {
            name:"Wedding",
            category_id:category.id,
            service_fee: 2.5,
            custom_fields:[],
            is_free:true,
            list_order:4,
            showed_landing:true
        },
        {
            name:"Festival",
            category_id:category.id,
            service_fee: 2.5,
            custom_fields:[],
            is_free:true,
            list_order:5,
            showed_landing:false
        },
        {
            name:"Business",
            category_id:category.id,
            service_fee: 2.5,
            custom_fields:[],
            is_free:true,
            list_order:6,
            showed_landing:false
        },
    ]
    const eventSubCategoriesExists = await prisma.eventSubcategory.findMany({
        select:{
            name:true
        },
        where:{
            name:{
               in:eventSubCategories.map(x => x.name )
            } 
        }
    });
    const categoriesName = eventSubCategoriesExists.map(y => y.name )
    for (const eventSubCategory of eventSubCategories) {
        if (!categoriesName.includes(eventSubCategory.name)){
            const eventsubcategory = await prisma.eventSubcategory.create({
                data:{
                    name:eventSubCategory.name,
                    category_id:category.id,
                    event_publication_price:eventSubCategory.event_publication_price,
                    service_fee:eventSubCategory.service_fee,
                    custom_fields:eventSubCategory.custom_fields,
                    is_free:eventSubCategory.is_free,
                    list_order:eventSubCategory.list_order,
                    showed_landing:eventSubCategory.showed_landing
                }
            })
            for (const permotePricing of promotePricingPackageIds){
                const promotePricingPackage =  await prisma.promotePricingPackage.findUnique({where:{id:permotePricing.id}});
                await prisma.eventPrice.create({
                    data:{
                        event_subcategory_id:eventsubcategory.id,
                        promote_pricing_id: promotePricingPackage.id,
                        promote_per_day:permotePricing.promote_per_day
                    }
                })
            }
        } 
    }
}

export default seedEventSubCategories;

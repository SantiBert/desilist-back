import {EventSubcategory} from '@prisma/client';

export interface EventSubcategoryRequest {
    category_id:number;       
    name:string;
    event_publication_price:number;       
    service_fee: number;
    list_order: number;
    is_free:boolean;
    showed_landing:boolean;
    custom_fields: string[];
}

export interface GetAllEventsSubCategories {
    subCategories: EventSubcategory[];
    total: number;
    cursor: number;
}
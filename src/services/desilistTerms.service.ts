import {DesilistTerms} from '@prisma/client';
import prisma from '@/db';
import { DesilistTermsRequest } from '@/interfaces/desilistTerms.interface';

export class DesilistTermsService {

    public desilist_terms = prisma.desilistTerms;

    public async find(): Promise<Partial<DesilistTerms>[] | null> {
      return await this.desilist_terms.findMany({
        select: {
            id:true,
            term_description:true
        },
      });
    }
   
    public async findById(id: number): Promise<Partial<DesilistTerms> | null> {
      return await this.desilist_terms.findUnique({
        select: {
            id:true,
            term_description:true
        },
        where: {id}
      });
    }


}
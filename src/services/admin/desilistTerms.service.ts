import {DesilistTerms} from '@prisma/client';
import prisma from '@/db';
import { DesilistTermsRequest } from '@/interfaces/desilistTerms.interface';

export class AdminDesilistTermsService {

    public desilist_terms = prisma.desilistTerms;

    public async create(data: DesilistTermsRequest): Promise<Partial<DesilistTerms> | null> {
        return await this.desilist_terms.create({
          select: {
            id: true
          }, data,
        });
      }
    
    public async updateById(
      id: number,
      data: DesilistTermsRequest
    ): Promise<Partial<DesilistTerms> | null> {
      return await this.desilist_terms.update({
        select: {id: true},
        data: {...data},
        where: {id}
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
    
    public async delete(id: number): Promise<Partial<DesilistTerms> | null>  {
      return await this.desilist_terms.delete({
        where: {id}
      });
    }

}
import {Media} from '@prisma/client';
import prisma from '@/db';

import { MediaRequest } from '@/interfaces/liveStreaming.interface';

export class MediaService {

    public media = prisma.media;

    public async create(data: MediaRequest): Promise<Partial<Media> | null> {
        return await this.media.create({
          select: {
            id: true
          }, data
        });
      }
    public async find(): Promise<Partial<Media>[]> {
      return await this.media.findMany();
    }
    public async findById(id: number): Promise<Partial<Media> | null> {
      return await this.media.findUnique({
        select: {
          id: true,
          name: true,
        },
        where: {id}
      });
    }
    public async updateById(
      id: number,
      data: Partial<MediaRequest>
    ): Promise<Partial<Media> | null> {
      return await this.media.update({
        select: {id: true},
        data: {...data},
        where: {id}
      });
    }
    public async delete(id: number): Promise<Partial<Media> | null>  {
      return await this.media.delete({
        where: {id}
      });
    }
}
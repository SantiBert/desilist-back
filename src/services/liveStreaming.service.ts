import {LiveStreaming} from '@prisma/client';
import prisma from '@/db';
import { LiveStreamingRequest } from '@/interfaces/liveStreaming.interface';

export class LiveStreamingService {

    public lives_treaming = prisma.liveStreaming;

    public async create(data: LiveStreamingRequest): Promise<Partial<LiveStreaming> | null> {
        return await this.lives_treaming.create({
          select: {
            id: true
          }, data
        });
      }
    public async findById(id: number): Promise<Partial<LiveStreaming> | null> {
      return await this.lives_treaming.findUnique({
        select: {
          id: true,
          url: true,
          description: true,
          media:{
            select: {
              name: true
            }
          }
        },
        where: {id}
      });
    }
    public async updateById(
      id: number,
      data: LiveStreamingRequest
    ): Promise<Partial<LiveStreaming> | null> {
      return await this.lives_treaming.update({
        select: {id: true},
        data: {...data},
        where: {id}
      });
    }
    public async delete(id: number): Promise<Partial<LiveStreaming> | null>  {
      return await this.lives_treaming.delete({
        where: {id}
      });
    }
}
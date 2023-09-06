import {getUUIDv4} from '@/utils/math';
import {IdempotencyKey} from '@prisma/client';
import prisma from '@/db';
import {
  IdempotentRequest,
  IdempotentRequestParams
} from '@/interfaces/idempotency';
import {logger} from '@/utils/logger';

const RETRY_ATTEMPTS = 3;

export class IdempotencyService {
  public idempotency = prisma.idempotencyKey;

  public async initIdempotentRequest(
    userId: string,
    request: IdempotentRequestParams
  ): Promise<IdempotentRequest> {
    const idempotencyKey = this.getIdempotencyKey();
    const idempotency = await this.create({
      value: idempotencyKey,
      request_path: request.request_path,
      request_params: request.request_params,
      recovery_point: 'started',
      response_code: 0,
      response_body: 'null'
    } as any);

    return {id: idempotency.id, key: idempotencyKey};
  }

  public async executeOperation(
    idempotencyId: number,
    context: any,
    func: string,
    fParams: any,
    recoveryPoint: string
  ): Promise<any> {
    let retryAttemps = 0;
    const f = context[func].bind(context);

    const res = await (async (): Promise<any> => {
      while (retryAttemps < RETRY_ATTEMPTS) {
        try {
          const ret = await f(...fParams);
          /* fix: change update order */
          await this.updateById(idempotencyId, {recovery_point: recoveryPoint});
          return ret;
        } catch (err) {
          /* todo: update on error */
          logger.error(err.message);
          if (err.code >= 500) {
            if (++retryAttemps === RETRY_ATTEMPTS) {
              throw err;
            }
          } else {
            throw err;
          }
        }
      }
    })();

    return res;
  }

  public async endIdempotentRequest(
    idempotencyId: number
  ): Promise<IdempotentRequest> {
    const idempotencyKey = this.getIdempotencyKey();
    const idempotency = await this.updateById(idempotencyId, {
      value: idempotencyKey,
      recovery_point: 'finished'
    } as any);

    return {id: idempotency.id, key: idempotencyKey};
  }

  public async create(
    data: IdempotencyKey
  ): Promise<Partial<IdempotencyKey> | null> {
    return await this.idempotency.create({
      select: {id: true},
      data
    });
  }

  public async updateById(
    id: number,
    data: Partial<IdempotencyKey>
  ): Promise<Partial<IdempotencyKey> | null> {
    return await this.idempotency.update({
      select: {id: true},
      data,
      where: {id}
    });
  }

  public getIdempotencyKey(): string {
    return getUUIDv4();
  }
}

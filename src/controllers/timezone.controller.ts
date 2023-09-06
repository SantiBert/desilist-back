import {NextFunction, Request, Response} from 'express';
import config from '@/config';

import {STATUS_CODES} from '@constants/statusCodes';
import {TimezoneService} from '@/services';
import { Timezone } from '@prisma/client';
import { timezoneNotFoundException } from '@/errors/timezones.error';

class TimezoneController {
    
    public timezones = new TimezoneService();

    public getTimezones = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
        const timezones: Partial<Timezone>[] = await this.timezones.find();
        res.status(STATUS_CODES.OK).json({
            data: timezones,
            message: 'find All'
        });
        } catch (error) {
        next(error);
        }
    }
    public getTimezoneById= async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
        const id = Number(req.params.id);
        const timezone: Partial<Timezone> = await this.timezones.findById(id);
        if (!timezone) {
            throw timezoneNotFoundException('Timezone not found');
        }
    
        res.status(STATUS_CODES.OK).json({
            data: timezone,
            message: 'find One'
        });
        } catch (error) {
        next(error);
        }
    }
}

export default TimezoneController;

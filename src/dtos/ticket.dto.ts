import {Json} from 'aws-sdk/clients/robomaker';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf
} from 'class-validator';

export class GetTicketsByIdDto {
    @IsNumber()
    public id: number;
}

export class GetTicketsByEventDto {
    @IsNumber()
    public id: number;
}

export class GetTicketPDF {
  @IsString()
  @IsNotEmpty()
  public orderNumber: string;
}

export class GetOrderSummary extends GetTicketPDF {};
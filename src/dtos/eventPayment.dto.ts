// import {Card as ICard} from '@/interfaces/payments';
import {
  IBillingDetails,
  ICardPaymentOptions,
  IPaymentAddress
} from '@/interfaces/payments';
import {
  IsString,
  IsNumber,
  ValidateIf,
  IsEnum,
  IsObject,
  IsArray,
  IsNotEmptyObject,
  IsUUID,
  IsBoolean
} from 'class-validator';
import {PAYMENT_CANCEL_REASON, PAYMENT_METHOD_TYPE} from '@/constants/payments';
// import {Type} from 'class-transformer';

class Packages {
  @IsNumber()
  public basic_package_id: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public promote_package_id: number | null;
}

export class GetEventPaymentHistoryDto {}

export class CreateEventPaymentDto {
  @IsNumber()
  public event_id: number;

  @IsNumber()
  public base_price: number;

  @IsNumber()
  public subcategory_id: number;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public promote_package_id: number | null;

  @IsArray()
  @IsEnum(PAYMENT_METHOD_TYPE, {each: true})
  public method_type: PAYMENT_METHOD_TYPE[];

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public method_options: string | null;

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public package_id: number | null;
}

export class CreateCardEventPaymentDto {
  @IsNumber()
  public amount: number;

  @IsString()
  public currency: string | null;

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public method_options: ICardPaymentOptions | null;
}

export class ConfirmCardEventPaymentDto {
  @IsString()
  public payment_method_id: string;

  @IsNotEmptyObject()
  public method_options: ICardPaymentOptions;
}

export class ConfirmEventPaymentDto {
  @IsString()
  public payment_method_id: string;

  @IsString()
  public method_type: PAYMENT_METHOD_TYPE;

  /*
  @IsUUID()
  public key: string;
  */

  @IsNotEmptyObject()
  public method_options: ICardPaymentOptions;
}

export class CancelEventPaymentDto {
  @IsEnum(PAYMENT_CANCEL_REASON)
  @ValidateIf((object, value) => value !== null)
  public reason: PAYMENT_CANCEL_REASON;
}

export class CreateCustomerDto {}

export class DeleteCustomerDto {}

export class GetEventPaymentMethodDto {
  @IsEnum(PAYMENT_METHOD_TYPE)
  public type: PAYMENT_METHOD_TYPE;
}

/*
  class Card implements ICard {
    @IsString()
    public number: string;
  
    @IsNumber()
    public exp_month: number;
  
    @IsNumber()
    public exp_year: number;
  
    @IsString()
    public cvc: string;
  }
  */

export class CreateEventPaymentMethodDto {
  @IsEnum(PAYMENT_METHOD_TYPE)
  public type: PAYMENT_METHOD_TYPE;

  // @Type(() => Card)
  // public card: Card;
  @IsObject()
  public card: any;

  @IsObject()
  public billing_details: IBillingDetails;
}

export class UpdateEventPaymentMethodPathDto {
  @IsString()
  public id: string;
}

export class UpdateEventPaymentMethodBodyDto {
  @IsObject()
  public address: IPaymentAddress;

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public metadata: Record<string, any>;
}

export class AttachEventPaymentMethodDto {
  @IsString()
  public id: string;
}

export class DetachPaymentMethodDto extends AttachEventPaymentMethodDto {}

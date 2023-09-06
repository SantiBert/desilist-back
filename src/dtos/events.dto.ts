import {Ticket} from '@prisma/client';
import {Json} from 'aws-sdk/clients/robomaker';
import {bool} from 'aws-sdk/clients/signer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  isString
} from 'class-validator';

class schedule {
  @IsString()
  public start_date: string;

  @IsString()
  public end_date: string;

  @IsNumber()
  public timezone_id: number;
}

class LiveStreaming {
  @IsNumber()
  public media_id: number;

  @IsString()
  public url: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: string;
}
class TicketType {
  @IsBoolean()
  public paid: boolean;

  @IsString()
  public name: string;

  @IsNumber()
  public quantity: number;

  @IsNumber()
  public price: number;

  @IsNumber()
  public maxOrder: number;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: string;

  @IsArray()
  public valid_for: string[];
}

class TicketInfo {
  @IsString()
  public close_date: string;

  @IsArray()
  public tickets: TicketType[];
}
class Organizer {
  @IsString()
  @ValidateIf((object, value) => value !== null)
  public organization_name: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public hosted_by: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public contact_number: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public email: string | null;
}
class EventImages {
  @IsNumber()
  public position: number;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public data?: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public url?: string;
}
class TermAndCondition {
  @IsOptional()
  @IsString()
  @ValidateIf((object, value) => value !== null)
  public id: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public term: string | null;
}
export class GetAllEventsDto {
  @IsString()
  @IsOptional()
  public user_id: string;

  @IsString()
  @IsOptional()
  public subcategory_id: string;

  @IsString()
  @IsOptional()
  public promoted: string;

  @IsString()
  @IsOptional()
  public highlighted: string;

  @IsString()
  @IsOptional()
  public status_id: string;

  @IsString()
  @IsOptional()
  public paused_at: string;

  @IsString()
  @IsOptional()
  public search: string;

  @IsString()
  @IsOptional()
  public take: string;

  @IsString()
  @IsOptional()
  public cursor: string;

  @IsString()
  @IsOptional()
  public skip: string;

  @IsString()
  @IsOptional()
  public order_by: string;

  @IsString()
  @IsOptional()
  public order: string;
}

export class GetEventsMeDto extends GetAllEventsDto {}


export class GetAllEventsAndListingDto {
  @IsString()
  @IsOptional()
  public search: string;

  @IsString()
  @IsOptional()
  public take: string;

  @IsString()
  @IsOptional()
  public cursor: string;

  @IsString()
  @IsOptional()
  public skip: string;

  @IsString()
  @IsOptional()
  public order_by: string;

  @IsString()
  @IsOptional()
  public order: string;
}

export class CreateEventsDto {
  @IsNumber()
  public subcategory_id: number;

  @IsString()
  public title: string;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: Json | string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public email: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public full_name_contact: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public phone: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public website: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public banner: string;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public images: EventImages[];

  @IsBoolean()
  public has_ticket: boolean;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public organizers: Organizer[];

  @IsObject()
  public schedule: schedule;

  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public terms_and_conditions: TermAndCondition[];

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public tickets_info: TicketInfo | null;

  // @IsObject()
  // @ValidateIf((object, value) => value !== null)
  // public custom_fields: Json | null;
  @IsArray()
  @ValidateIf((object, value) => value !== null)
  public live_streaming: LiveStreaming[];

  @IsObject()
  @ValidateIf((object, value) => value !== null)
  public location: Json | null;
}

export class UpdateEventDto extends CreateEventsDto {}

export class DeleteEventDto {}

export class PublishEventDto {}

export class PauseEventDto {}

export class UnpauseEventDto {}

export class HighlightEventDto {}

export class CancelHighlightEventDto {}

export class PromoteEventDto {
  @IsNumber()
  public promote_package_id: number;
}

export class ReportEventDto {
  @IsNumber()
  public reason_id: number;

  @IsString()
  public explanation: string;
}

export class FlagEventDto {
  @IsArray()
  public reasons: number[];

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public explanation: string;
}

export class ReproveEventDto {
  @IsArray()
  public reasons: number[];

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public explanation: string;
}

export class DenyEventDto {
  @IsArray()
  public reasons: number[];

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public explanation: string;
}

export class EventOrganizerDto {
  @IsString()
  public date: string;
}

export class UnflagEventDto {}

export class AttendanceEventDto {
  @IsString()
  @IsOptional()
  public id: string;

  @IsString()
  @IsOptional()
  public qr_code: string;

  @IsString()
  @IsOptional()
  public user_name: string;

  @IsString()
  @IsOptional()
  public user_email: string;

  @IsString()
  @IsOptional()
  public ticket_name: string;

  @IsString()
  @IsOptional()
  public search: string;

  @IsString()
  @IsOptional()
  public check_in_time: string;

  @IsString()
  @IsOptional()
  public status: string;

  @IsString()
  @IsOptional()
  public take: string;

  @IsString()
  @IsOptional()
  public skip: string;

  @IsString()
  @IsOptional()
  public order_by: string;
}

export class PurchaseEventDto {
  @IsString()
  @IsOptional()
  public id: string;

  @IsString()
  @IsOptional()
  public purchase_order: string;

  @IsString()
  @IsOptional()
  public search: string;

  @IsString()
  @IsOptional()
  public subtotal: string;

  @IsString()
  @IsOptional()
  public fee: string;

  @IsString()
  @IsOptional()
  public total: string;

  @IsString()
  @IsOptional()
  public take: string;

  @IsString()
  @IsOptional()
  public skip: string;

  @IsString()
  @IsOptional()
  public order_by: string;

  @IsString()
  @IsOptional()
  public order: string;
}

export class DuplicateEventDto {
  @IsNumber()
  public id: number;
}
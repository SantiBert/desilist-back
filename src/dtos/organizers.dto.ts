import {
    IsString,
    ValidateIf,
    IsNumber
  } from 'class-validator';

export class CreateOrganizerDto {

  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  public event_id: number;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public organization_name:  string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public hosted_by: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public contact_number: string | null;

}

export class GetOrganizerDto {}

export class DeleteOrganizerDto {}

export class UpdateOrganizerDto extends CreateOrganizerDto {}
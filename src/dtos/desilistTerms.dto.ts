import {
    IsString,
    ValidateIf
  } from 'class-validator';

export class CreateDesilistTermsDto {
  @IsString()
  @ValidateIf((object, value) => value !== null)
  public term_description: string;
}

export class GetDesilistTermsDto {}

export class DeleteDesilistTermsDto {}

export class UpdateDesilistTermsDto extends CreateDesilistTermsDto {}
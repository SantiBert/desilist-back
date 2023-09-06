import {
    IsString,
    IsNumber,
    ValidateIf,
    IsOptional
  } from 'class-validator';

export class CreateMediaDto {
 
    @IsString()
    @ValidateIf((object, value) => value !== null)
    public name: string | null;
  }

export class UpdateMediaDto extends CreateMediaDto {}
  
export class GetMediaDto {}

export class DeleteMediaDto {}
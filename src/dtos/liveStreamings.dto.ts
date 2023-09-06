import {
    IsString,
    IsNumber,
    ValidateIf,
    IsOptional
  } from 'class-validator';

export class CreateLiveStreamingDto {
  @IsNumber()
  public event_id: number;

  @IsNumber()
  public media_id: number;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public url: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public media_website: string | null;

  @IsString()
  @ValidateIf((object, value) => value !== null)
  public description: string | null;
}

export class GetStreamingDto {}

export class DeleteStreamingDto {}

export class UpdateStreamingDto extends CreateLiveStreamingDto {}
import {
    IsString,
    IsNumber
  } from 'class-validator';

export class AttendanceDto {
    @IsString()
    public qr_code: string;
  }

export class AttendanceLocationDto {
    @IsString()
    public qr_code: string;
    @IsString()
    public lat: string;
    @IsString()
    public lng: string;
  }
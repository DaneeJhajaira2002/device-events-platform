import { IsString, IsNumber, IsISO8601 } from 'class-validator';

export class CreateEventDto {
  @IsString()
  deviceId: string;

  @IsString()
  type: string;

  @IsNumber()
  value: number;

  @IsISO8601()
  timestamp: string;
}
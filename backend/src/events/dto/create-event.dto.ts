import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNumber, IsString } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({
    example: 'device-01',
    description: 'Unique device identifier',
  })
  @IsString()
  deviceId: string;

  @ApiProperty({
    example: 'heart_rate',
    description: 'Event type sent by the device',
  })
  @IsString()
  type: string;

  @ApiProperty({
    example: 95,
    description: 'Numeric value associated with the event',
  })
  @IsNumber()
  value: number;

  @ApiProperty({
    example: '2026-03-12T14:10:00Z',
    description: 'Event timestamp in UTC ISO 8601 format',
  })
  @IsISO8601()
  timestamp: string;
}
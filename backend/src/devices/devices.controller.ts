import { Controller, Get, Param } from '@nestjs/common';
import { DevicesService } from './devices.service';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.devicesService.getDeviceStats(id);
  }
}
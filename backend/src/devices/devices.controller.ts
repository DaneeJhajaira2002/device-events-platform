import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DevicesService } from './devices.service';

@ApiTags('devices')
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Get('active')
  @ApiOperation({ summary: 'Get active devices' })
  @ApiResponse({
    status: 200,
    description: 'Active devices retrieved successfully',
  })
  getActiveDevices() {
    return this.devicesService.getActiveDevices();
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get aggregated stats for a device' })
  @ApiParam({
    name: 'id',
    example: 'device-01',
    description: 'Device identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Device stats retrieved successfully',
  })
  getStats(@Param('id') id: string) {
    return this.devicesService.getDeviceStats(id);
  }
}
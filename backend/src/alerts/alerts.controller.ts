import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('recent')
  @ApiOperation({ summary: 'Get recent alerts' })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 10,
    description: 'Maximum number of recent alerts to return',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent alerts retrieved successfully',
  })
  getRecent(@Query('limit') limit?: string) {
    return this.alertsService.getRecentAlerts(limit ? Number(limit) : 20);
  }
}
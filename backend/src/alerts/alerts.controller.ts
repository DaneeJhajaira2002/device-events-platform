import { Controller, Get, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get('recent')
  getRecent(@Query('limit') limit?: string) {
    return this.alertsService.getRecentAlerts(limit ? Number(limit) : 20);
  }
}
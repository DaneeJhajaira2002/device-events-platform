import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Alert } from '../events/entities/alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private alertsRepository: Repository<Alert>,
  ) {}

  async createAlert(deviceId: string, message: string) {
    const alert = this.alertsRepository.create({
      deviceId,
      message,
    });

    return this.alertsRepository.save(alert);
  }
  async getRecentAlerts(limit = 20) {
    return this.alertsRepository.find({
      order: {
        createdAt: 'DESC',
      },
      take: limit,
    });
  }
}
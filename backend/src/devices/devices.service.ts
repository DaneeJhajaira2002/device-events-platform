import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from '../events/entities/event.entity';
import { DeviceStatsResponseDto } from './dto/device-stats-response.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async getDeviceStats(deviceId: string): Promise<DeviceStatsResponseDto> {
    const stats = await this.eventsRepository
      .createQueryBuilder('event')
      .select('COUNT(*)', 'eventsLast24h')
      .addSelect('AVG(event.value)', 'averageValue')
      .addSelect('MAX(event.event_time)', 'lastEvent')
      .where('event.device_id = :deviceId', { deviceId })
      .andWhere("event.event_time >= NOW() - INTERVAL '24 hours'")
      .getRawOne();

    return {
      deviceId,
      eventsLast24h: Number(stats?.eventsLast24h ?? 0),
      averageValue:
        stats?.averageValue !== null && stats?.averageValue !== undefined
          ? Number(stats.averageValue)
          : null,
      lastEvent: stats?.lastEvent ? new Date(stats.lastEvent).toISOString() : null,
    };
  }

  async getActiveDevices() {
    const rows = await this.eventsRepository
      .createQueryBuilder('event')
      .select('event.device_id', 'deviceId')
      .addSelect('MAX(event.event_time)', 'lastEvent')
      .where("event.event_time >= NOW() - INTERVAL '1 hour'")
      .groupBy('event.device_id')
      .orderBy('MAX(event.event_time)', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      deviceId: row.deviceId,
      lastEvent: row.lastEvent ? new Date(row.lastEvent).toISOString() : null,
    }));
  }
}
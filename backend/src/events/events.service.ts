import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { AlertsService } from '../alerts/alerts.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private alertsService: AlertsService,
    private redisService: RedisService,
  ) {}

  async createEvent(dto: CreateEventDto) {
    const event = this.eventsRepository.create({
      deviceId: dto.deviceId,
      type: dto.type,
      value: dto.value,
      eventTime: new Date(dto.timestamp),
    });

    const savedEvent = await this.eventsRepository.save(event);

    await this.redisService.publish('events.new', savedEvent);

    if (dto.type === 'heart_rate' && dto.value > 120) {
      const alert = await this.alertsService.createAlert(
        dto.deviceId,
        `High heart rate detected: ${dto.value}`,
      );

      await this.redisService.publish('alerts.new', alert);
    }

    return savedEvent;
  }

  async getRecentEvents(limit = 20) {
    return this.eventsRepository.find({
      order: {
        eventTime: 'DESC',
      },
      take: limit,
    });
  }
}
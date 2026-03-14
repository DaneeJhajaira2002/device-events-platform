import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { AlertsModule } from './alerts/alerts.module';
import { RealtimeModule } from './realtime/realtime.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [EventsModule, AlertsModule, RealtimeModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly redisService: RedisService) {}

  async afterInit() {
    await this.redisService.subscribe('events.new', (message) => {
      const event = JSON.parse(message);
      this.server.emit('event:new', event);
    });

    await this.redisService.subscribe('alerts.new', (message) => {
      const alert = JSON.parse(message);
      this.server.emit('alert:new', alert);
    });
  }
}
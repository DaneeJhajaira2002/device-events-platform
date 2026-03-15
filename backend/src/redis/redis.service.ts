import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private publisher: RedisClientType | null = null;
  private subscriber: RedisClientType | null = null;
  private initializing: Promise<void> | null = null;

  constructor(private readonly configService: ConfigService) {}

  private async ensureClients() {
    if (this.publisher && this.subscriber) {
      return;
    }

    if (this.initializing) {
      await this.initializing;
      return;
    }

    this.initializing = (async () => {
      const host = this.configService.get<string>('REDIS_HOST') ?? 'localhost';
      const port = Number(this.configService.get<string>('REDIS_PORT') ?? 6379);
      const url = `redis://${host}:${port}`;

      this.publisher = createClient({ url });
      this.subscriber = createClient({ url });

      this.publisher.on('error', (err) => {
        console.error('Redis Publisher Error:', err);
      });

      this.subscriber.on('error', (err) => {
        console.error('Redis Subscriber Error:', err);
      });

      await this.publisher.connect();
      await this.subscriber.connect();
    })();

    await this.initializing;
    this.initializing = null;
  }

  async publish(channel: string, payload: unknown) {
    await this.ensureClients();
    await this.publisher!.publish(channel, JSON.stringify(payload));
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    await this.ensureClients();
    await this.subscriber!.subscribe(channel, (message) => {
      callback(message);
    });
  }

  async onModuleDestroy() {
    if (this.publisher?.isOpen) {
      await this.publisher.quit();
    }

    if (this.subscriber?.isOpen) {
      await this.subscriber.quit();
    }
  }
}
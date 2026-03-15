export class DeviceStatsResponseDto {
  deviceId: string;
  eventsLast24h: number;
  averageValue: number | null;
  lastEvent: string | null;
}
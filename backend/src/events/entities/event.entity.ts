import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('events')
@Index(['deviceId'])
@Index(['eventTime'])
@Index(['deviceId', 'eventTime'])
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id', type: 'varchar', length: 100 })
  deviceId: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'float' })
  value: number;

  @Column({ name: 'event_time', type: 'timestamptz' })
  eventTime: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
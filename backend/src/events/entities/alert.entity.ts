import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('alerts')
@Index(['deviceId'])
@Index(['createdAt'])
export class Alert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'device_id', type: 'varchar', length: 100 })
  deviceId: string;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt: Date;
}
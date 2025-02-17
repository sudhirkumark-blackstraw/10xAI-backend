import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  stripe_subscription_id: string;

  @Column()
  plan_name: string;

  @Column()
  status: string;

  @CreateDateColumn()
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;
}
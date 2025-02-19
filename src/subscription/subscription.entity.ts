// src/subscription/subscription.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  // Store timestamps for trial and subscription period
  @Column({ nullable: true, type: 'timestamp' })
  trial_end: Date;

  @Column({ nullable: true, type: 'timestamp' })
  current_period_end: Date;

  // Optionally store unsubscribe reason if canceled
  @Column({ nullable: true })
  unsubscribe_reason: string;

  @CreateDateColumn()
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

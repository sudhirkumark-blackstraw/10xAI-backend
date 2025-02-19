// src/users/user.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // User’s name (Primary Contact Name)
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password_hash: string;

  @Column({ nullable: true })
  google_id: string;

  @Column({ nullable: true })
  linkedin_id: string;

  @Column({ default: 'user' })
  role: string;

  // Account details
  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  company_website: string;

  @Column({ nullable: true })
  job_title: string;

  @Column({ nullable: true })
  industry: string;

  @Column({ nullable: true })
  company_size: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  linkedin_profile: string;

  // Stripe Customer ID
  @Column({ nullable: true })
  stripe_customer_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

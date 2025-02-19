// src/migrations/1680000000000-SubscriptionAndUserUpdates.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubscriptionAndUserUpdates1680000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update Users table: add stripe_customer_id
    await queryRunner.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255)
    `);

    // Create Subscriptions table (if not exists) with additional fields
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES users(id) ON DELETE CASCADE,
        stripe_subscription_id VARCHAR(255) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL,
        trial_end TIMESTAMP,
        current_period_end TIMESTAMP,
        unsubscribe_reason VARCHAR(255),
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS stripe_customer_id`);
    await queryRunner.query(`DROP TABLE IF EXISTS subscriptions`);
  }
}

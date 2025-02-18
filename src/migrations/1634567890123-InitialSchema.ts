// Migration file (e.g., 1634567890123-InitialSchema.ts)
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1634567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE public.users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        google_id VARCHAR(255),
        linkedin_id VARCHAR(255),
        role VARCHAR(50) DEFAULT 'user',
        company_name VARCHAR(255),
        company_website VARCHAR(255),
        job_title VARCHAR(255),
        industry VARCHAR(255),
        company_size VARCHAR(50),
        phone VARCHAR(50),
        location VARCHAR(255),
        linkedin_profile VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      -- (Other tables like payments and subscriptions remain unchanged)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS public.subscriptions;
      DROP TABLE IF EXISTS public.payments;
      DROP TABLE IF EXISTS public.users;
    `);
  }
}

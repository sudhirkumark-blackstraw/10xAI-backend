import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: StripeService,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get('STRIPE_SECRET_KEY');
        if (!apiKey) {
          throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }
        return new StripeService(apiKey);
      },
      inject: [ConfigService],
    },
  ],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
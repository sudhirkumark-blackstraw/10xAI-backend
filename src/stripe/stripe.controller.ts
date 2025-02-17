import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateChargeDto } from './dto/create-charge.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('charge')
  async createCharge(@Body() chargeDto: CreateChargeDto) {
    return this.stripeService.createCharge(
      chargeDto.amount,
      chargeDto.currency,
      chargeDto.source,
    );
  }

  @Get('charges')
  async listCharges(@Query('limit') limit: number) {
    return this.stripeService.listCharges(limit);
  }

  @Get('charges/:id')
  async getCharge(@Param('id') id: string) {
    return this.stripeService.retrieveCharge(id);
  }
}

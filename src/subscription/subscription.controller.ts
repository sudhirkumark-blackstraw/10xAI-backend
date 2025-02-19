import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import Stripe from 'stripe';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // Create a Stripe Checkout Session and return the URL.
  @Post('checkout')
  async createCheckoutSession(@Body() body: {
    customerId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }> {
    const { customerId, priceId, successUrl, cancelUrl } = body;
    const session = await this.subscriptionService.createCheckoutSession(
      customerId,
      priceId,
      successUrl,
      cancelUrl,
    );

    // Ensure the session URL is defined before returning it.
    if (!session.url) {
      throw new Error('Checkout session URL is not available.');
    }

    return { url: session.url };
  }

  // Get subscription details.
  @Get('details')
  async getSubscriptionDetails(@Query('subscriptionId') subscriptionId: string): Promise<Stripe.Subscription> {
    return this.subscriptionService.getSubscription(subscriptionId);
  }

  // Cancel subscription with an optional cancellation reason.
  @Post('cancel')
  async cancelSubscription(
    @Body('subscriptionId') subscriptionId: string,
    @Body('cancelReason') cancelReason: string,
  ): Promise<Stripe.Subscription> {
    return this.subscriptionService.cancelSubscription(subscriptionId, cancelReason);
  }

  // Get billing history (invoices).
  @Get('history')
  async getBillingHistory(@Query('customerId') customerId: string) {
    return this.subscriptionService.getBillingHistory(customerId);
  }
}
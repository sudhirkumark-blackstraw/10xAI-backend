// src/subscription/subscription.service.ts
import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SubscriptionService {
  private stripe: Stripe;
  
  constructor(private configService: ConfigService) {
    // Retrieve Stripe secret key and ensure it's defined.
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('Stripe Secret Key is not defined in configuration');
    }
    // Updated to the required API version per internal guidelines.
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  // Create a Stripe Checkout Session for a subscription with a 30-day free trial.
  async createCheckoutSession(
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: customerId,
        line_items: [
          { price: priceId, quantity: 1 },
        ],
        subscription_data: {
          trial_period_days: 30,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      return session;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Retrieve a subscription details from Stripe.
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await this.stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice.payment_intent'],
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Cancel a subscription with an optional reason.
  async cancelSubscription(subscriptionId: string, cancelReason: string, cancelAtPeriodEnd = true): Promise<Stripe.Subscription> {
    try {
      // For simplicity, we only update via Stripe (and assume a webhook updates our local DB)
      if (cancelAtPeriodEnd) {
        return await this.stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
      } else {
        return await this.stripe.subscriptions.cancel(subscriptionId);
      }
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  // Get billing history (invoices) for a customer.
  async getBillingHistory(customerId: string): Promise<Stripe.Invoice[]> {
    try {
      const invoices = await this.stripe.invoices.list({ customer: customerId, limit: 100 });
      return invoices.data;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}

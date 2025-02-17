import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createCharge(amount: number, currency: string, source: string): Promise<Stripe.Charge> {
    return this.stripe.charges.create({
      amount,
      currency,
      source,
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<Stripe.PaymentIntent> {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    return this.stripe.customers.create({
      email,
      name,
    });
  }

  async createSubscription(customerId: string, priceId: string): Promise<Stripe.Subscription> {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
  }

  async retrieveCharge(chargeId: string): Promise<Stripe.Charge> {
    return this.stripe.charges.retrieve(chargeId);
  }

  async listCharges(limit: number = 10): Promise<Stripe.ApiList<Stripe.Charge>> {
    return this.stripe.charges.list({ limit });
  }
}
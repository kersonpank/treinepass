import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Subscription } from './entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';
import { User } from '../users/entities/user.entity';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class SubscriptionsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Subscription)
    private subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private plansRepository: Repository<Plan>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-08-16',
    });
  }

  async createIndividualSubscription(userId: string, planId: string): Promise<Subscription> {
    const plan = await this.plansRepository.findOne({ where: { id: planId } });
    if (!plan || plan.type !== 'INDIVIDUAL') {
      throw new NotFoundException('Invalid plan');
    }

    const existingSubscription = await this.subscriptionsRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('User already has an active subscription');
    }

    // Create Stripe subscription
    const stripeSubscription = await this.createStripeSubscription(userId, plan);

    const subscription = this.subscriptionsRepository.create({
      userId,
      planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amount: plan.price,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer as string,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async createCorporateSubscription(companyId: string, planId: string): Promise<Subscription> {
    const plan = await this.plansRepository.findOne({ where: { id: planId } });
    if (!plan || plan.type !== 'CORPORATE') {
      throw new NotFoundException('Invalid corporate plan');
    }

    const existingSubscription = await this.subscriptionsRepository.findOne({
      where: {
        companyId,
        isActive: true,
      },
    });

    if (existingSubscription) {
      throw new ConflictException('Company already has an active subscription');
    }

    // Create Stripe subscription
    const stripeSubscription = await this.createStripeSubscription(companyId, plan);

    const subscription = this.subscriptionsRepository.create({
      companyId,
      planId,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      amount: plan.price,
      stripeSubscriptionId: stripeSubscription.id,
      stripeCustomerId: stripeSubscription.customer as string,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  private async createStripeSubscription(entityId: string, plan: Plan) {
    // Create or get customer
    let customer = await this.stripe.customers.list({
      email: entityId, // Use email or ID as reference
      limit: 1,
    });

    let customerId: string;

    if (customer.data.length === 0) {
      const newCustomer = await this.stripe.customers.create({
        email: entityId, // Use email or ID as reference
        metadata: {
          entityId,
        },
      });
      customerId = newCustomer.id;
    } else {
      customerId = customer.data[0].id;
    }

    // Create subscription
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.stripePriceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Cancel Stripe subscription
    await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);

    // Update local subscription
    subscription.isActive = false;
    subscription.endDate = new Date();
    await this.subscriptionsRepository.save(subscription);
  }
}

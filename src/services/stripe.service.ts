import api from './api';

export const stripeService = {
  // Correct backend paths are /stripe/* not /billing/*
  getPlans: () =>
    api.get('/stripe/plans'),

  subscribe: (customerId: string, priceId: string) =>
    api.post('/stripe/subscribe', { customerId, priceId }),

  cancelSubscription: (subscriptionId: string) =>
    api.delete('/stripe/subscribe', { data: { subscriptionId } }),

  getBillingPortal: (customerId: string, returnUrl: string) =>
    api.get('/stripe/portal', { params: { customerId, returnUrl } }),

  purchaseCredits: (customerId: string, amountCents: number) =>
    api.post('/stripe/credits', { customerId, amountCents }),
};

import { api } from './api';

export const paymentService = {
  // Public (no login - magic link) actions
  getPublicInvoice: async (token: string) => {
    const { data } = await api.get(`/public/invoices/${token}`);
    return data;
  },

  submitPublicPayment: async (token: string, payload: { amount: number; payment_method: string; reference_number?: string }) => {
    const { data } = await api.post(`/public/invoices/${token}/payments`, payload);
    return data;
  },
};

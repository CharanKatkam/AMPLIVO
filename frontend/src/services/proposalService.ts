import { api } from './api';

export interface ProposalRead {
  id: string;
  client_id: string | null;
  lead_id: string | null;
  title: string;
  description: string | null;
  amount: number | null;
  status: string;
  decision_notes: string | null;
  sent_at: string | null;
  decided_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const proposalService = {
  listForLead: async (leadId: string): Promise<ProposalRead[]> => {
    const { data } = await api.get(`/leads/${leadId}/proposals`);
    return data;
  },

  createForLead: async (leadId: string, payload: { title: string; description?: string; amount?: number }): Promise<ProposalRead> => {
    const { data } = await api.post(`/leads/${leadId}/proposals`, payload);
    return data;
  },

  update: async (id: string, payload: Record<string, unknown>): Promise<ProposalRead> => {
    const { data } = await api.put(`/clients/proposals/${id}`, payload);
    return data;
  },

  getPdfUrl: (id: string) => `${api.defaults.baseURL}/clients/proposals/${id}/pdf`,

  // Public (no login - magic link) actions
  getPublic: async (token: string) => {
    const { data } = await api.get(`/public/proposals/${token}`);
    return data;
  },

  decidePublic: async (token: string, decision: 'accept' | 'reject' | 'revise', notes?: string) => {
    const { data } = await api.post(`/public/proposals/${token}/decision`, { decision, notes });
    return data;
  },
};

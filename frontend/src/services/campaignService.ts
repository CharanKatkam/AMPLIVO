import { api } from './api';

export interface CampaignCreatePayload {
  name: string;
  client_id: string;
  type: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  spent_amount?: number;
  target_audience?: string;
  description?: string;
  manager_id?: string;
}

export interface CampaignUpdatePayload extends Partial<CampaignCreatePayload> {}

export interface CampaignRead {
  id: string;
  name: string;
  client_id: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  spent_amount: number;
  target_audience: string | null;
  description: string | null;
  manager_id: string | null;
  created_at: string;
  updated_at: string;
}

// client_id / manager_id are UUID columns and start_date / end_date are date
// columns on the backend (manager_id, start_date, end_date are optional;
// client_id is required on create but optional on update). Form fields
// default to '' rather than being omitted, and '' fails UUID/date
// validation (422) where omitting the key does not.
function withoutEmptyUuidFields<
  T extends { client_id?: string; manager_id?: string; start_date?: string; end_date?: string }
>(payload: T): T {
  const cleaned = { ...payload };
  if (!cleaned.client_id) delete cleaned.client_id;
  if (!cleaned.manager_id) delete cleaned.manager_id;
  if (!cleaned.start_date) delete cleaned.start_date;
  if (!cleaned.end_date) delete cleaned.end_date;
  return cleaned;
}

export const campaignService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    type?: string;
    client_id?: string;
    manager_id?: string;
  }) => {
    const { data } = await api.get('/campaigns', { params });
    return data;
  },

  getById: async (id: string): Promise<CampaignRead> => {
    const { data } = await api.get(`/campaigns/${id}`);
    return data;
  },

  create: async (payload: CampaignCreatePayload): Promise<CampaignRead> => {
    const { data } = await api.post('/campaigns', withoutEmptyUuidFields(payload));
    return data;
  },

  update: async (id: string, payload: CampaignUpdatePayload): Promise<CampaignRead> => {
    const { data } = await api.put(`/campaigns/${id}`, withoutEmptyUuidFields(payload));
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/campaigns/${id}`);
  },

  getPlatforms: async (campaignId: string) => {
    const { data } = await api.get(`/campaigns/${campaignId}/platforms`);
    return data;
  },

  addPlatform: async (campaignId: string, payload: {
    platform_name: string;
    account_id?: string;
    status?: string;
    budget_allocation?: number;
  }) => {
    const { data } = await api.post(`/campaigns/${campaignId}/platforms`, payload);
    return data;
  },

  getAssets: async (campaignId: string) => {
    const { data } = await api.get(`/campaigns/${campaignId}/assets`);
    return data;
  },

  addAsset: async (campaignId: string, payload: {
    name: string;
    asset_type: string;
    file_url?: string;
    status?: string;
  }) => {
    const { data } = await api.post(`/campaigns/${campaignId}/assets`, payload);
    return data;
  },

  getMetrics: async (campaignId: string) => {
    const { data } = await api.get(`/campaigns/${campaignId}/metrics`);
    return data;
  },

  addMetric: async (campaignId: string, payload: {
    date: string;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
  }) => {
    const { data } = await api.post(`/campaigns/${campaignId}/metrics`, payload);
    return data;
  },
};

import { api } from './api';

export interface LeadCreatePayload {
  title: string;
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  source_id?: string;
  status?: string;
  priority?: string;
  estimated_value?: number;
  assigned_to?: string;
  notes?: string;
}

export interface LeadUpdatePayload extends Partial<LeadCreatePayload> {}

export interface PaginatedLeads {
  items: LeadRead[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LeadRead {
  id: string;
  title: string;
  company_name: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  source_id: string | null;
  status: string;
  priority: string;
  estimated_value: number | null;
  assigned_to: string | null;
  converted_client_id: string | null;
  converted_at: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// source_id and assigned_to are optional UUID columns on the backend
// (uuid.UUID | None). Form fields default to '' rather than being omitted,
// and '' fails UUID validation (422) where omitting the key / null does not.
function withoutEmptyUuidFields<T extends { source_id?: string; assigned_to?: string }>(payload: T): T {
  const cleaned = { ...payload };
  if (!cleaned.source_id) delete cleaned.source_id;
  if (!cleaned.assigned_to) delete cleaned.assigned_to;
  return cleaned;
}

export const leadService = {
  getAll: async (params?: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    priority?: string;
    source_id?: string;
    assigned_to?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<PaginatedLeads> => {
    const { data } = await api.get('/leads', { params });
    return data;
  },

  getById: async (id: string): Promise<LeadRead> => {
    const { data } = await api.get(`/leads/${id}`);
    return data;
  },

  create: async (payload: LeadCreatePayload): Promise<LeadRead> => {
    const { data } = await api.post('/leads', withoutEmptyUuidFields(payload));
    return data;
  },

  update: async (id: string, payload: LeadUpdatePayload): Promise<LeadRead> => {
    const { data } = await api.put(`/leads/${id}`, withoutEmptyUuidFields(payload));
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/leads/${id}`);
  },

  convert: async (id: string, clientId: string): Promise<LeadRead> => {
    const { data } = await api.post(`/leads/${id}/convert`, { client_id: clientId });
    return data;
  },

  getActivities: async (leadId: string) => {
    const { data } = await api.get(`/leads/${leadId}/activities`);
    return data;
  },

  addActivity: async (leadId: string, payload: { activity_type: string; description?: string }) => {
    const { data } = await api.post(`/leads/${leadId}/activities`, payload);
    return data;
  },

  getFollowups: async (leadId: string) => {
    const { data } = await api.get(`/leads/${leadId}/followups`);
    return data;
  },

  addFollowup: async (leadId: string, payload: {
    followup_date: string;
    followup_type?: string;
    notes?: string;
    status?: string;
    assigned_to?: string;
  }) => {
    const { data } = await api.post(`/leads/${leadId}/followups`, payload);
    return data;
  },

  getSalesPipeline: async () => {
    const { data } = await api.get('/sales-pipeline');
    return data;
  },

  getLeadSources: async () => {
    const { data } = await api.get('/lead-sources');
    return data;
  },
};

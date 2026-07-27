import { api } from './api';

export interface MeetingRead {
  id: string;
  lead_id: string;
  title: string;
  meeting_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  agenda: string | null;
  notes: string | null;
  follow_up_required: boolean;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const meetingService = {
  getAll: async (params?: { page?: number; page_size?: number; lead_id?: string; status?: string }) => {
    const { data } = await api.get('/meetings', { params });
    return data;
  },

  getById: async (id: string): Promise<MeetingRead> => {
    const { data } = await api.get(`/meetings/${id}`);
    return data;
  },

  create: async (payload: {
    lead_id: string; title: string; meeting_type?: string; scheduled_at: string;
    duration_minutes?: number; agenda?: string; assigned_to?: string;
  }): Promise<MeetingRead> => {
    const { data } = await api.post('/meetings', payload);
    return data;
  },

  update: async (id: string, payload: Record<string, unknown>): Promise<MeetingRead> => {
    const { data } = await api.put(`/meetings/${id}`, payload);
    return data;
  },

  reschedule: async (id: string, scheduledAt: string, reason?: string): Promise<MeetingRead> => {
    const { data } = await api.patch(`/meetings/${id}/reschedule`, { scheduled_at: scheduledAt, reason });
    return data;
  },

  cancel: async (id: string, reason?: string): Promise<MeetingRead> => {
    const { data } = await api.post(`/meetings/${id}/cancel`, { reason });
    return data;
  },

  complete: async (id: string, notes?: string, followUpRequired = false): Promise<MeetingRead> => {
    const { data } = await api.post(`/meetings/${id}/complete`, { notes, follow_up_required: followUpRequired });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/meetings/${id}`);
  },
};

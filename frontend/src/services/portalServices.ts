// Services backing the client-portal-only features: Support Tickets,
// Messaging, and "my own company" (client) lookups.
import { api } from './api';

// ── Support Tickets (also covers "Contact Requests") ──────────────────────
export interface SupportTicketRead {
  id: string;
  client_id: string | null;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_by: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketCommentRead {
  id: string;
  ticket_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
}

export const supportTicketService = {
  getAll: async (params?: { page?: number; page_size?: number; search?: string; status?: string; priority?: string; category?: string }) => {
    const { data } = await api.get('/support-tickets', { params });
    return data;
  },
  getById: async (id: string): Promise<SupportTicketRead> => {
    const { data } = await api.get(`/support-tickets/${id}`);
    return data;
  },
  create: async (payload: { subject: string; description: string; category?: string; priority?: string }): Promise<SupportTicketRead> => {
    const { data } = await api.post('/support-tickets', payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>): Promise<SupportTicketRead> => {
    const { data } = await api.put(`/support-tickets/${id}`, payload);
    return data;
  },
  getComments: async (ticketId: string): Promise<SupportTicketCommentRead[]> => {
    const { data } = await api.get(`/support-tickets/${ticketId}/comments`);
    return data;
  },
  addComment: async (ticketId: string, content: string): Promise<SupportTicketCommentRead> => {
    const { data } = await api.post(`/support-tickets/${ticketId}/comments`, { content });
    return data;
  },
};

// ── Messaging ───────────────────────────────────────────────────────────
export interface ConversationRead {
  id: string;
  client_id: string | null;
  subject: string;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageRead {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string;
  is_read: boolean;
  created_at: string;
}

export const messagingService = {
  getConversations: async (params?: { page?: number; page_size?: number }) => {
    const { data } = await api.get('/messaging/conversations', { params });
    return data;
  },
  getOrCreateConversation: async (subject = 'General'): Promise<ConversationRead> => {
    const { data } = await api.post('/messaging/conversations', { subject });
    return data;
  },
  getMessages: async (conversationId: string): Promise<MessageRead[]> => {
    const { data } = await api.get(`/messaging/conversations/${conversationId}/messages`);
    return data;
  },
  sendMessage: async (conversationId: string, content: string): Promise<MessageRead> => {
    const { data } = await api.post(`/messaging/conversations/${conversationId}/messages`, { content });
    return data;
  },
  markRead: async (conversationId: string) => {
    const { data } = await api.put(`/messaging/conversations/${conversationId}/read`);
    return data;
  },
};

// ── My Company (client-portal user's own company record) ──────────────────
export interface ClientRead {
  id: string;
  company_name: string;
  display_name: string | null;
  industry: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  gst_number: string | null;
  pan_number: string | null;
  client_type: string | null;
  status: string;
  assigned_to: string | null;
  branch_id: string | null;
  onboarding_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const companyService = {
  getMine: async (): Promise<ClientRead> => {
    const { data } = await api.get('/clients/me');
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>): Promise<ClientRead> => {
    const { data } = await api.put(`/clients/${id}`, payload);
    return data;
  },
};

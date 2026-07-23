import { create } from 'zustand';
import { SalesLead, SalesLeadStatus, Meeting, SalesInvoice } from '@/types';
import { SalesService } from '@/types';
import { leadService } from '@/services/leadService';
import type { LeadRead } from '@/services/leadService';

interface SalesState {
  leads: SalesLead[];
  meetings: Meeting[];
  invoices: SalesInvoice[];
  services: SalesService[];
  isLoading: boolean;

  // API Actions
  fetchLeads: () => Promise<void>;

  // Actions
  updateLeadStatus: (leadId: string, status: SalesLeadStatus) => void;
  updateLeadNotes: (leadId: string, notes: string) => void;
  updateLeadBudget: (leadId: string, budget: number) => void;
  updateLeadServices: (leadId: string, services: string[]) => void;
  scheduleMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  addMeetingNotes: (meetingId: string, notes: string) => void;
  completeMeeting: (meetingId: string, notes: string) => void;
  generateInvoice: (leadId: string) => SalesInvoice | null;
}

let invoiceCounter = 1;

export const useSalesStore = create<SalesState>((set, get) => ({
  leads: [],
  meetings: [],
  invoices: [],
  services: [],
  isLoading: false,

  // ─── API FETCH ACTIONS ────────────────────────────────────────────────────
  fetchLeads: async () => {
    set({ isLoading: true });
    try {
      const res = await leadService.getAll({ page_size: 100 });
      const backendLeads = res.items || res || [];
      const salesLeads: SalesLead[] = backendLeads.map((l) => ({
        id: l.id,
        firstName: (l.contact_name || '').split(' ')[0] || '',
        lastName: (l.contact_name || '').split(' ').slice(1).join(' ') || '',
        email: l.email || '',
        phone: l.phone || '',
        designation: '',
        company: l.company_name || '',
        industry: '',
        companySize: '',
        website: '',
        city: '',
        status: (l.status as SalesLeadStatus) || 'New',
        source: 'Organic' as const,
        assignedTo: l.assigned_to || '',
        priority: (l.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
        budget: l.estimated_value || 0,
        expectedCloseDate: '',
        probability: 50,
        interestedServices: [],
        notes: l.notes || '',
        meetings: [],
        timeline: [],
        invoiceGenerated: false,
        createdAt: l.created_at || new Date().toISOString(),
        lastUpdated: l.updated_at || new Date().toISOString(),
        followUpDate: '',
      }));
      set({ leads: salesLeads, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateLeadStatus: (leadId, status) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status,
              lastUpdated: new Date().toISOString().split('T')[0],
              timeline: [
                ...lead.timeline,
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'status_changed' as const,
                  description: `Status changed to ${status}`,
                  actor: 'Sales Admin',
                },
              ],
            }
          : lead,
      ),
    }));
  },

  updateLeadNotes: (leadId, notes) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              notes,
              lastUpdated: new Date().toISOString().split('T')[0],
              timeline: [
                ...lead.timeline,
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'note_added' as const,
                  description: 'Notes updated',
                  actor: 'Sales Admin',
                },
              ],
            }
          : lead,
      ),
    }));
  },

  updateLeadBudget: (leadId, budget) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              budget,
              lastUpdated: new Date().toISOString().split('T')[0],
              timeline: [
                ...lead.timeline,
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'budget_updated' as const,
                  description: `Budget updated to ₹${budget.toLocaleString('en-IN')}`,
                  actor: 'Sales Admin',
                },
              ],
            }
          : lead,
      ),
    }));
  },

  updateLeadServices: (leadId, services) => {
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              interestedServices: services,
              lastUpdated: new Date().toISOString().split('T')[0],
              timeline: [
                ...lead.timeline,
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'services_updated' as const,
                  description: `Services updated: ${services.join(', ')}`,
                  actor: 'Sales Admin',
                },
              ],
            }
          : lead,
      ),
    }));
  },

  scheduleMeeting: (meeting) => {
    const newMeeting: Meeting = { ...meeting, id: `mtg-${Date.now()}` };
    set((state) => ({
      meetings: [...state.meetings, newMeeting],
      leads: state.leads.map((lead) =>
        lead.id === meeting.leadId
          ? {
              ...lead,
              status: 'Meeting Scheduled' as SalesLeadStatus,
              meetings: [...lead.meetings, newMeeting],
              lastUpdated: new Date().toISOString().split('T')[0],
              timeline: [
                ...lead.timeline,
                {
                  id: `t-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'meeting_scheduled' as const,
                  description: `Meeting scheduled for ${meeting.date} at ${meeting.time} — ${meeting.type}`,
                  actor: 'Sales Admin',
                },
              ],
            }
          : lead,
      ),
    }));
  },

  addMeetingNotes: (meetingId, notes) => {
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, notes } : m,
      ),
    }));
  },

  completeMeeting: (meetingId, notes) => {
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, status: 'Completed', notes } : m,
      ),
    }));
  },

  generateInvoice: (leadId) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead || lead.invoiceGenerated) return null;

    const catalog = get().services;
    const lineItems = lead.interestedServices.map((svcName) => {
      const svc = catalog.find((s) => s.name === svcName);
      return {
        serviceId: svc?.id ?? svcName,
        serviceName: svcName,
        description: svc ? `Monthly management — ${svcName}` : svcName,
        quantity: 3,
        unitPrice: svc?.monthlyPrice ?? 25000,
        total: (svc?.monthlyPrice ?? 25000) * 3,
      };
    });

    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxRate = 18;
    const taxAmount = Math.round(subtotal * (taxRate / 100));
    const grandTotal = subtotal + taxAmount;
    const advanceDue = Math.round(grandTotal * 0.25);

    const invoiceNum = `AMP-SALES-${String(invoiceCounter++).padStart(3, '0')}`;
    const issueDate = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const invoice: SalesInvoice = {
      id: `sinv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      leadId,
      clientName: `${lead.firstName} ${lead.lastName}`,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      company: lead.company,
      issueDate,
      dueDate,
      lineItems,
      subtotal,
      taxRate,
      taxAmount,
      grandTotal,
      advancePercent: 25,
      advanceDue,
      status: 'Draft',
      notes: `Invoice generated for ${lead.company}. 25% advance payment due within 7 days.`,
    };

    set((state) => ({
      invoices: [...state.invoices, invoice],
      leads: state.leads.map((l) =>
        l.id === leadId
          ? {
              ...l,
              invoiceGenerated: true,
              invoiceId: invoice.id,
              status: 'Ready for CRM' as SalesLeadStatus,
              lastUpdated: issueDate,
              timeline: [
                ...l.timeline,
                {
                  id: `t-${Date.now()}`,
                  date: issueDate,
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'invoice_generated' as const,
                  description: `Invoice ${invoiceNum} generated. 25% advance: ₹${advanceDue.toLocaleString('en-IN')}`,
                  actor: 'Sales Admin',
                },
                {
                  id: `t-${Date.now() + 1}`,
                  date: issueDate,
                  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                  type: 'status_changed' as const,
                  description: 'Status changed to Ready for CRM',
                  actor: 'System',
                },
              ],
            }
          : l,
      ),
    }));

    return invoice;
  },
}));

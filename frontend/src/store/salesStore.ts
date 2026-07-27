import { create } from 'zustand';
import { SalesLead, SalesLeadStatus, Meeting, SalesInvoice } from '@/types';
import { SalesService } from '@/types';
import { leadService } from '@/services/leadService';
import type { LeadRead } from '@/services/leadService';
import { meetingService } from '@/services/meetingService';
import { proposalService } from '@/services/proposalService';
import { financeService } from '@/services/crmService';

interface SalesState {
  leads: SalesLead[];
  meetings: Meeting[];
  invoices: SalesInvoice[];
  services: SalesService[];
  isLoading: boolean;

  // API Actions
  fetchLeads: () => Promise<void>;

  // Actions - every one of these now calls the real backend first, then
  // reflects the confirmed result into local state (previously these only
  // ever mutated local Zustand state and were lost on refresh).
  updateLeadStatus: (leadId: string, status: SalesLeadStatus) => Promise<void>;
  updateLeadNotes: (leadId: string, notes: string) => Promise<void>;
  updateLeadBudget: (leadId: string, budget: number) => Promise<void>;
  updateLeadServices: (leadId: string, services: string[]) => Promise<void>;
  scheduleMeeting: (meeting: Omit<Meeting, 'id'>) => Promise<void>;
  addMeetingNotes: (meetingId: string, notes: string) => Promise<void>;
  completeMeeting: (meetingId: string, notes: string) => Promise<void>;
  generateInvoice: (leadId: string) => Promise<SalesInvoice | null>;
}

function mapLeadStatus(status: string): SalesLeadStatus {
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const known: SalesLeadStatus[] = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'Ready for CRM'];
  if (known.includes(normalized as SalesLeadStatus)) return normalized as SalesLeadStatus;
  // Backend pipeline statuses (NEW_LEAD, MEETING_SCHEDULED, CRM_PENDING, ...)
  // that don't have a direct 1:1 Sales-dashboard label yet - anything past
  // "proposal created" reads as "Ready for CRM" from Sales's perspective.
  const upper = status.toUpperCase();
  if (upper === 'NEW_LEAD') return 'New';
  if (upper === 'MEETING_SCHEDULED') return 'Meeting Scheduled';
  if (upper === 'MEETING_COMPLETED') return 'Contacted';
  if (upper === 'LOST' || upper === 'REJECTED') return 'Lost';
  if (['PROPOSAL_CREATED', 'ADVANCE_INVOICE_CREATED', 'CRM_PENDING', 'CRM_APPROVED', 'EMAIL_SENT', 'ADVANCE_PAID', 'CLIENT_ACCOUNT_CREATED', 'PROJECT_CREATED', 'PROJECT_COMPLETED'].includes(upper)) {
    return 'Ready for CRM';
  }
  return 'New';
}

function mapLeadRead(l: LeadRead): SalesLead {
  return {
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
    status: mapLeadStatus(l.status || 'new'),
    source: 'Organic' as const,
    assignedTo: l.assigned_to || '',
    priority: (l.priority as 'Low' | 'Medium' | 'High' | 'Critical') || 'Medium',
    budget: l.estimated_value || 0,
    expectedCloseDate: '',
    probability: 50,
    interestedServices: l.interested_services || [],
    notes: l.notes || '',
    meetings: [],
    timeline: [],
    invoiceGenerated: false,
    createdAt: l.created_at || new Date().toISOString(),
    lastUpdated: l.updated_at || new Date().toISOString(),
    followUpDate: '',
  };
}

function pushTimelineEvent(lead: SalesLead, type: SalesLead['timeline'][number]['type'], description: string): SalesLead {
  return {
    ...lead,
    lastUpdated: new Date().toISOString().split('T')[0],
    timeline: [
      ...lead.timeline,
      {
        id: `t-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        type,
        description,
        actor: 'Sales Admin',
      },
    ],
  };
}

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
      set({ leads: backendLeads.map(mapLeadRead), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateLeadStatus: async (leadId, status) => {
    if (status === 'Lost') {
      await leadService.markLost(leadId);
    } else {
      await leadService.update(leadId, { status });
    }
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? pushTimelineEvent({ ...lead, status }, 'status_changed', `Status changed to ${status}`) : lead,
      ),
    }));
  },

  updateLeadNotes: async (leadId, notes) => {
    await leadService.update(leadId, { notes });
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? pushTimelineEvent({ ...lead, notes }, 'note_added', 'Notes updated') : lead,
      ),
    }));
  },

  updateLeadBudget: async (leadId, budget) => {
    await leadService.update(leadId, { estimated_value: budget });
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId ? pushTimelineEvent({ ...lead, budget }, 'budget_updated', `Budget updated to ₹${budget.toLocaleString('en-IN')}`) : lead,
      ),
    }));
  },

  updateLeadServices: async (leadId, services) => {
    await leadService.update(leadId, { interested_services: services });
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === leadId
          ? pushTimelineEvent({ ...lead, interestedServices: services }, 'services_updated', `Services updated: ${services.join(', ')}`)
          : lead,
      ),
    }));
  },

  scheduleMeeting: async (meeting) => {
    const scheduledAt = new Date(`${meeting.date}T${meeting.time}:00`).toISOString();
    const created = await meetingService.create({
      lead_id: meeting.leadId,
      title: `${meeting.type} with ${meeting.leadName}`,
      meeting_type: meeting.type,
      scheduled_at: scheduledAt,
      duration_minutes: meeting.duration,
      agenda: meeting.agenda,
    });
    const newMeeting: Meeting = { ...meeting, id: created.id };
    set((state) => ({
      meetings: [...state.meetings, newMeeting],
      leads: state.leads.map((lead) =>
        lead.id === meeting.leadId
          ? pushTimelineEvent(
              { ...lead, status: 'Meeting Scheduled' as SalesLeadStatus, meetings: [...lead.meetings, newMeeting] },
              'meeting_scheduled',
              `Meeting scheduled for ${meeting.date} at ${meeting.time} — ${meeting.type}`,
            )
          : lead,
      ),
    }));
  },

  addMeetingNotes: async (meetingId, notes) => {
    await meetingService.update(meetingId, { notes });
    set((state) => ({
      meetings: state.meetings.map((m) => (m.id === meetingId ? { ...m, notes } : m)),
    }));
  },

  completeMeeting: async (meetingId, notes) => {
    await meetingService.complete(meetingId, notes);
    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === meetingId ? { ...m, status: 'Completed', notes } : m,
      ),
      leads: state.leads.map((lead) => ({
        ...lead,
        meetings: lead.meetings.map((m) =>
          m.id === meetingId ? { ...m, status: 'Completed', notes } : m
        )
      })),
    }));
  },

  generateInvoice: async (leadId) => {
    const lead = get().leads.find((l) => l.id === leadId);
    if (!lead || lead.invoiceGenerated) return null;

    // total_deal_amount is validated server-side as gt=0 (see
    // AdvanceInvoiceCreateRequest) - failing fast here with a clear message
    // is the fix for the 422, instead of ever sending a 0/negative amount.
    if (!(lead.budget > 0)) {
      throw new Error('Set a budget greater than ₹0 for this lead before generating an invoice.');
    }

    // Backend requires a Proposal to exist before the advance invoice can
    // reference it (see migration 0020) - the deal amount comes from the
    // lead's own budget field, matching what this page already shows.
    const proposal = await proposalService.createForLead(leadId, {
      title: `Proposal for ${lead.company || `${lead.firstName} ${lead.lastName}`}`,
      description: lead.interestedServices.join(', ') || undefined,
      amount: lead.budget,
    });

    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const backendInvoice = await financeService.createAdvanceInvoice({
      lead_id: leadId,
      proposal_id: proposal.id,
      total_deal_amount: lead.budget,
      tax_rate: 18,
      due_date: dueDate,
      currency: 'INR',
      notes: `Invoice generated for ${lead.company}. 25% advance payment due within 7 days.`,
    });

    const invoice: SalesInvoice = {
      id: backendInvoice.id,
      invoiceNumber: backendInvoice.invoice_number,
      leadId,
      clientName: `${lead.firstName} ${lead.lastName}`,
      clientEmail: lead.email,
      clientPhone: lead.phone,
      company: lead.company,
      issueDate: backendInvoice.issue_date,
      dueDate: backendInvoice.due_date,
      lineItems: [{
        serviceId: 'advance',
        serviceName: 'Advance Payment (25%)',
        description: `Advance payment for engagement (of ₹${lead.budget.toLocaleString('en-IN')} total)`,
        quantity: 1,
        unitPrice: backendInvoice.subtotal,
        total: backendInvoice.subtotal,
      }],
      subtotal: backendInvoice.subtotal,
      taxRate: 18,
      taxAmount: backendInvoice.tax_total,
      grandTotal: backendInvoice.total_amount,
      advancePercent: 25,
      advanceDue: backendInvoice.total_amount,
      status: 'Draft',
      notes: backendInvoice.notes || '',
    };

    set((state) => ({
      invoices: [...state.invoices, invoice],
      leads: state.leads.map((l) =>
        l.id === leadId
          ? pushTimelineEvent(
              pushTimelineEvent(
                { ...l, invoiceGenerated: true, invoiceId: invoice.id, status: 'Ready for CRM' as SalesLeadStatus },
                'invoice_generated',
                `Invoice ${invoice.invoiceNumber} generated. 25% advance: ₹${invoice.advanceDue.toLocaleString('en-IN')}`,
              ),
              'status_changed',
              'Status changed to Ready for CRM',
            )
          : l,
      ),
    }));

    return invoice;
  },
}));

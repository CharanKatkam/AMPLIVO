import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CrmLead, CrmLeadStatus, CrmClient, CrmProject, CrmEmployee,
  CrmInvoice, CrmInvoiceStatus, CrmPayment, CrmNotification,
  CrmCredentials, CrmTask, CrmSubmission, CrmSubmissionVersion, CrmActivityLog, TaskStatus, SubmissionStatus
} from '@/types/crm';
import { leadService } from '@/services/leadService';
import { clientService, projectService, taskService, notificationService, financeService } from '@/services/crmService';
import { userManagementService } from '@/services/crmService';
import { SalesLeadStatus } from '@/types';

// ─────────────────────────────────────────────────────────────────────────────
// AMPLIVO CRM Store
// BACKEND NOTE:
//   - All state mutations are isolated in actions.
//   - Actions call the backend API and fall back to local state on failure.
//   - Each action mirrors a REST endpoint (listed in comments).
// ─────────────────────────────────────────────────────────────────────────────

interface CrmState {
  // ─── Data ─────────────────────────────────────────────────────────────────
  leads: CrmLead[];
  clients: CrmClient[];
  projects: CrmProject[];
  employees: CrmEmployee[];
  invoices: CrmInvoice[];
  payments: CrmPayment[];
  notifications: CrmNotification[];
  tasks: CrmTask[];
  submissions: CrmSubmission[];
  activityLogs: CrmActivityLog[];

  // ─── UI State ─────────────────────────────────────────────────────────────
  isLoading: boolean;
  dataLoaded: boolean;
  selectedLeadId: string | null;
  selectedClientId: string | null;
  selectedProjectId: string | null;
  activeEmployeeId: string | null;

  // ─── API Actions ─────────────────────────────────────────────────────────
  fetchAllData: () => Promise<void>;
  fetchLeads: () => Promise<void>;
  fetchClients: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchEmployees: () => Promise<void>;
  fetchTasks: () => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchNotifications: () => Promise<void>;

  // ─── LEAD ACTIONS ──────────────────────────────────────────────────────────
  updateLeadStatus: (id: string, status: CrmLeadStatus, notes?: string) => void;
  // BACKEND: PATCH /api/crm/leads/:id/review
  reviewLead: (id: string, status: 'Approved' | 'Rejected', notes: string, rejectionReason?: string) => void;
  // BACKEND: POST /api/crm/leads/:id/send-invoice
  sendInvoiceEmail: (leadId: string) => void;
  // BACKEND: POST /api/crm/leads/:id/generate-credentials
  generateCredentials: (leadId: string) => CrmCredentials;
  // BACKEND: POST /api/crm/leads/:id/send-welcome
  sendWelcomeEmail: (leadId: string) => void;

  // ─── CLIENT ACTIONS ────────────────────────────────────────────────────────
  // BACKEND: POST /api/crm/clients
  convertLeadToClient: (leadId: string) => CrmClient | null;
  // BACKEND: PATCH /api/crm/clients/:id
  updateClient: (id: string, updates: Partial<CrmClient>) => void;
  // BACKEND: PATCH /api/crm/clients/:id/employees
  assignEmployeesToClient: (clientId: string, employeeIds: string[]) => void;

  // ─── PROJECT ACTIONS ───────────────────────────────────────────────────────
  // BACKEND: PATCH /api/crm/projects/:id/employees
  assignEmployeesToProject: (projectId: string, employeeIds: string[]) => void;
  // BACKEND: PATCH /api/crm/projects/:id/progress
  updateProjectProgress: (projectId: string, progress: number) => void;
  // BACKEND: PATCH /api/crm/projects/:id/status
  updateProjectStatus: (projectId: string, status: CrmProject['status']) => void;
  // BACKEND: PATCH /api/crm/projects/:id/milestone
  completeMilestone: (projectId: string, milestoneId: string) => void;

  // ─── EMPLOYEE ACTIONS ──────────────────────────────────────────────────────
  setActiveEmployee: (id: string | null) => void;
  // BACKEND: PATCH /api/crm/employees/:id (workload + projects)
  updateEmployeeWorkload: (employeeId: string, projectId: string, add: boolean) => void;

  // ─── INVOICE ACTIONS ───────────────────────────────────────────────────────
  // BACKEND: PATCH /api/crm/invoices/:id/status
  updateInvoiceStatus: (invoiceId: string, status: CrmInvoiceStatus) => void;
  // BACKEND: POST /api/crm/invoices/:id/send-reminder
  sendInvoiceReminder: (invoiceId: string) => void;

  // ─── PAYMENT ACTIONS ───────────────────────────────────────────────────────
  // BACKEND: PATCH /api/crm/payments/:id/verify
  verifyPayment: (paymentId: string, verifiedBy: string) => void;

  // ─── NOTIFICATION ACTIONS ─────────────────────────────────────────────────
  // BACKEND: PATCH /api/crm/notifications/:id/read
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<CrmNotification, 'id'>) => void;

  // ─── SELECTORS ────────────────────────────────────────────────────────────
  getLeadById: (id: string) => CrmLead | undefined;
  getClientById: (id: string) => CrmClient | undefined;
  getProjectById: (id: string) => CrmProject | undefined;
  getEmployeeById: (id: string) => CrmEmployee | undefined;
  getInvoiceById: (id: string) => CrmInvoice | undefined;
  getUnreadCount: () => number;
  getProjectsForClient: (clientId: string) => CrmProject[];
  getEmployeesForProject: (projectId: string) => CrmEmployee[];
  getProjectsByEmployee: (employeeId: string) => CrmProject[];
  getTasksByEmployee: (employeeId: string) => CrmTask[];

  // ─── TASK ACTIONS ─────────────────────────────────────────────────────────
  startTask: (taskId: string) => void;
  updateTaskProgress: (taskId: string, progress: number, status?: TaskStatus) => void;
  markTaskBlocked: (taskId: string, reason: string) => void;
  addTaskComment: (taskId: string, text: string) => void;
  addMockFile: (taskId: string, name: string) => void;

  // ─── SUBMISSION ACTIONS ───────────────────────────────────────────────────
  saveSubmissionDraft: (submissionData: Partial<CrmSubmission>) => void;
  submitToCRM: (submissionData: Partial<CrmSubmission>) => void;
  acknowledgeCRMFeedback: (submissionId: string) => void;
  createRevision: (submissionId: string, notes: string) => void;
  resubmitToCRM: (submissionId: string, versionData: Partial<CrmSubmissionVersion>) => void;
  
  // CRM Review Actions
  reviewSubmission: (submissionId: string) => void;
  requestSubmissionChanges: (submissionId: string, feedback: string) => void;
  approveSubmission: (submissionId: string) => void;
}

// ─── CREDENTIAL GENERATOR ────────────────────────────────────────────────────
const generateCreds = (lead: CrmLead): CrmCredentials => {
  const fn = lead.salesLead.firstName.toLowerCase();
  const ln = lead.salesLead.lastName.toLowerCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 30);
  return {
    clientId: `AMP-CLT-${lead.id.slice(-4).toUpperCase()}`,
    username: `${fn}.${ln}@amplivo.client`,
    tempPassword: `Amp#${rand}Temp`,
    expiryDate: expiry.toISOString().split('T')[0],
    emailSent: true,
    generatedAt: new Date().toISOString(),
  };
};

// ─── NOTIFICATION FACTORY ─────────────────────────────────────────────────────
let notifCounter = 100;
const mkNotif = (type: CrmNotification['type'], title: string, message: string, linkedId?: string, linkedType?: CrmNotification['linkedType']): CrmNotification => ({
  id: `NOTIF-${++notifCounter}`,
  type, title, message,
  date: new Date().toISOString().split('T')[0],
  time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  read: false,
  linkedId, linkedType,
});

// ─── STORE ────────────────────────────────────────────────────────────────────
export const useCrmStore = create<CrmState>()(
  persist(
    (set, get) => ({
      // ─── Initial Data (empty — populated from API) ────────────────────────
      leads: [],
      clients: [],
      projects: [],
      employees: [],
      invoices: [],
      payments: [],
      notifications: [],
      tasks: [],
      submissions: [],
      activityLogs: [],
      isLoading: false,
      dataLoaded: false,
      selectedLeadId: null,
      selectedClientId: null,
      selectedProjectId: null,
      activeEmployeeId: null,

      // ─── API FETCH ACTIONS ────────────────────────────────────────────────
      fetchAllData: async () => {
        set({ isLoading: true });
        try {
          const [projectsRes, tasksRes, notifRes] = await Promise.allSettled([
            projectService.getAll({ page_size: 100 }),
            taskService.getAll({ page_size: 100 }),
            notificationService.getAll({ page_size: 100 }),
          ]);

          const projects = projectsRes.status === 'fulfilled' ? (projectsRes.value.items || projectsRes.value || []) : get().projects;
          const tasks = tasksRes.status === 'fulfilled' ? (tasksRes.value.items || tasksRes.value || []) : get().tasks;
          const notifications = notifRes.status === 'fulfilled' ? (notifRes.value.items || notifRes.value || []) : get().notifications;

          set({ projects, tasks, notifications, isLoading: false, dataLoaded: true });
        } catch {
          set({ isLoading: false });
        }
      },

      fetchLeads: async () => {
        try {
          const res = await leadService.getAll({ page_size: 100 });
          const backendLeads = res.items || res || [];
          const crmLeads: CrmLead[] = backendLeads.map((l) => ({
            id: l.id || '',
            salesLead: {
              id: l.id || '',
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
              status: 'New' as SalesLeadStatus,
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
            },
            salesInvoice: null,
            crmStatus: 'Pending Review' as CrmLeadStatus,
            crmAssignedTo: l.assigned_to || '',
            reviewNotes: l.notes || '',
            invoiceEmailSent: false,
            welcomeEmailSent: false,
            receivedAt: l.created_at || new Date().toISOString(),
          }));
          set({ leads: crmLeads });
        } catch { /* keep existing */ }
      },

      fetchClients: async () => {
        try {
          const res = await clientService.getAll({ page_size: 100 });
          set({ clients: res.items || res || [] });
        } catch { /* keep existing */ }
      },

      fetchProjects: async () => {
        try {
          const res = await projectService.getAll({ page_size: 100 });
          set({ projects: res.items || res || [] });
        } catch { /* keep existing */ }
      },

      fetchEmployees: async () => {
        try {
          const res = await userManagementService.getUsers({ page_size: 100 });
          const users = res.items || res || [];
          const crmEmployees: CrmEmployee[] = users.map((u: any) => ({
            id: u.id || '',
            firstName: u.first_name || u.firstName || '',
            lastName: u.last_name || u.lastName || '',
            email: u.email || '',
            designation: u.designation || u.role || '',
            department: u.department || '',
            skills: u.skills || [],
            currentProjectIds: u.current_project_ids || u.currentProjectIds || [],
            workloadPercent: u.workload_percent || u.workloadPercent || 0,
            availability: u.availability || 'Available',
            joinDate: u.join_date || u.joinDate || '',
            avatar: u.avatar || '',
          }));
          set({ employees: crmEmployees });
        } catch { /* keep existing */ }
      },

      fetchTasks: async () => {
        try {
          const res = await taskService.getAll({ page_size: 100 });
          set({ tasks: res.items || res || [] });
        } catch { /* keep existing */ }
      },

      fetchInvoices: async () => {
        try {
          const res = await financeService.getInvoices({ page_size: 100 });
          set({ invoices: res.items || res || [] });
        } catch { /* keep existing */ }
      },

      fetchPayments: async () => {
        // Payments are fetched per-invoice via financeService.getPayments(invoiceId)
        // No standalone payments list endpoint exists on the backend
        set({ payments: [] });
      },

      fetchNotifications: async () => {
        try {
          const res = await notificationService.getAll({ page_size: 100 });
          set({ notifications: res.items || res || [] });
        } catch { /* keep existing */ }
      },

      // ─── LEAD ACTIONS ─────────────────────────────────────────────────────
      updateLeadStatus: (id, status, notes) => {
        // Optimistic local update
        set(s => ({
          leads: s.leads.map(l => l.id === id ? { ...l, crmStatus: status, reviewNotes: notes ?? l.reviewNotes } : l),
        }));
        // API call
        leadService.update(id, { status, notes }).catch(() => {});
      },

      reviewLead: (id, status, notes, rejectionReason) => {
        // Optimistic local update
        set(s => ({
          leads: s.leads.map(l => l.id === id ? {
            ...l,
            crmStatus: status,
            reviewNotes: notes,
            rejectionReason: status === 'Rejected' ? rejectionReason : undefined,
            approvedAt: status === 'Approved' ? new Date().toISOString() : l.approvedAt,
          } : l),
          notifications: [
            mkNotif(
              status === 'Approved' ? 'lead_approved' : 'lead_rejected',
              status === 'Approved' ? 'Lead Approved' : 'Lead Rejected',
              `${s.leads.find(l => l.id === id)?.salesLead.firstName} ${s.leads.find(l => l.id === id)?.salesLead.lastName} — ${status}.`,
              id, 'lead'
            ),
            ...s.notifications,
          ],
        }));
        // API call
        leadService.update(id, { status, notes }).catch(() => {});
      },

      sendInvoiceEmail: (leadId) => {
        // Optimistic local update
        set(s => ({
          leads: s.leads.map(l => l.id === leadId ? { ...l, invoiceEmailSent: true, crmStatus: 'Invoice Sent' } : l),
          invoices: s.invoices.map(inv => inv.leadId === leadId ? {
            ...inv, crmStatus: 'Sent', sentAt: new Date().toISOString(),
          } : inv),
          notifications: [
            mkNotif('invoice_sent', 'Invoice Sent', `Invoice emailed to ${s.leads.find(l => l.id === leadId)?.salesLead.email}.`, leadId, 'lead'),
            ...s.notifications,
          ],
        }));
        // API call
        financeService.updateInvoice(leadId, { status: 'Sent' }).catch(() => {});
      },

      generateCredentials: (leadId) => {
        const lead = get().leads.find(l => l.id === leadId);
        if (!lead) throw new Error('Lead not found');
        const creds = generateCreds(lead);
        // Optimistic local update
        set(s => ({
          leads: s.leads.map(l => l.id === leadId ? {
            ...l,
            credentials: creds,
            crmStatus: 'Credentials Sent',
            welcomeEmailSent: true,
          } : l),
          notifications: [
            mkNotif('credentials_generated', 'Credentials Generated', `Login credentials emailed to ${lead.salesLead.firstName} ${lead.salesLead.lastName}.`, leadId, 'lead'),
            ...s.notifications,
          ],
        }));
        // API call
        leadService.update(leadId, { status: 'Credentials Sent', notes: `Credentials: ${creds.username} / ${creds.tempPassword}` }).catch(() => {});
        return creds;
      },

      sendWelcomeEmail: (leadId) => {
        // Optimistic local update
        set(s => ({
          leads: s.leads.map(l => l.id === leadId ? { ...l, welcomeEmailSent: true } : l),
        }));
        // API call
        leadService.update(leadId, { notes: 'Welcome email sent' }).catch(() => {});
      },

      // ─── CLIENT ACTIONS ───────────────────────────────────────────────────
      convertLeadToClient: (leadId) => {
        const lead = get().leads.find(l => l.id === leadId);
        if (!lead || !lead.credentials) return null;

        const clientNum = String(get().clients.length + 1).padStart(3, '0');
        const now = new Date().toISOString().split('T')[0];
        const sl = lead.salesLead;
        const renewalDate = new Date();
        renewalDate.setFullYear(renewalDate.getFullYear() + 1);

        const newClient: CrmClient = {
          id: `CLT-${clientNum}`,
          leadId,
          invoiceId: lead.salesInvoice?.id ?? '',
          clientId: lead.credentials.clientId,
          firstName: sl.firstName,
          lastName: sl.lastName,
          email: sl.email,
          phone: sl.phone,
          designation: sl.designation,
          company: sl.company,
          industry: sl.industry,
          companySize: sl.companySize,
          website: sl.website,
          city: sl.city,
          services: sl.interestedServices,
          monthlyRetainer: Math.round((sl.budget ?? 0) / 3),
          totalContractValue: sl.budget ?? 0,
          assignedCrmExec: lead.crmAssignedTo,
          assignedEmployees: [],
          status: 'Onboarding',
          paymentStatus: 'Advance Paid',
          startDate: now,
          renewalDate: renewalDate.toISOString().split('T')[0],
          createdAt: now,
          lastUpdated: now,
          credentials: lead.credentials,
          notes: lead.reviewNotes,
        };

        // Optimistic local update
        set(s => ({
          clients: [newClient, ...s.clients],
          leads: s.leads.map(l => l.id === leadId ? {
            ...l,
            crmStatus: 'Client Created',
            convertedToClientId: newClient.id,
            clientCreatedAt: now,
          } : l),
          notifications: [
            mkNotif('client_created', 'New Client Created', `${sl.firstName} ${sl.lastName} onboarded as ${newClient.clientId}.`, newClient.id, 'client'),
            ...s.notifications,
          ],
        }));

        // API call — create client on the backend
        clientService.create({
          company_name: newClient.company || `${newClient.firstName} ${newClient.lastName}`,
          display_name: `${newClient.firstName} ${newClient.lastName}`,
          email: newClient.email,
          phone: newClient.phone,
          industry: newClient.industry,
          website: newClient.website,
          notes: newClient.notes || undefined,
          is_active: true,
        }).catch(() => {});

        return newClient;
      },

      updateClient: (id, updates) => {
        // Optimistic local update
        set(s => ({
          clients: s.clients.map(c => c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString().split('T')[0] } : c),
        }));
        // API call
        clientService.update(id, updates).catch(() => {});
      },

      assignEmployeesToClient: (clientId, employeeIds) => {
        const prev = get().clients.find(c => c.id === clientId)?.assignedEmployees ?? [];
        const added = employeeIds.filter(e => !prev.includes(e));
        const removed = prev.filter(e => !employeeIds.includes(e));

        // Optimistic local update
        set(s => ({
          clients: s.clients.map(c => c.id === clientId ? { ...c, assignedEmployees: employeeIds } : c),
          employees: s.employees.map(emp => {
            if (added.includes(emp.id)) {
              return { ...emp, workloadPercent: Math.min(100, emp.workloadPercent + 10) };
            }
            if (removed.includes(emp.id)) {
              return { ...emp, workloadPercent: Math.max(0, emp.workloadPercent - 10) };
            }
            return emp;
          }),
        }));
        // API call
        clientService.update(clientId, { assignedEmployees: employeeIds }).catch(() => {});
      },

      // ─── PROJECT ACTIONS ──────────────────────────────────────────────────
      assignEmployeesToProject: (projectId, employeeIds) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return;
        const prev = project.assignedEmployeeIds;
        const added = employeeIds.filter(e => !prev.includes(e));
        const removed = prev.filter(e => !employeeIds.includes(e));

        // Optimistic local update
        set(s => ({
          projects: s.projects.map(p => p.id === projectId ? {
            ...p,
            assignedEmployeeIds: employeeIds,
            status: employeeIds.length > 0 ? (p.status === 'Waiting Assignment' ? 'Assigned' : p.status) : 'Waiting Assignment',
          } : p),
          employees: s.employees.map(emp => {
            if (added.includes(emp.id)) {
              return {
                ...emp,
                currentProjectIds: [...emp.currentProjectIds, projectId],
                workloadPercent: Math.min(100, emp.workloadPercent + 15),
                availability: emp.workloadPercent + 15 >= 80 ? 'Busy' : emp.availability,
              };
            }
            if (removed.includes(emp.id)) {
              return {
                ...emp,
                currentProjectIds: emp.currentProjectIds.filter(id => id !== projectId),
                workloadPercent: Math.max(0, emp.workloadPercent - 15),
                availability: emp.workloadPercent - 15 < 80 ? 'Available' : emp.availability,
              };
            }
            return emp;
          }),
          notifications: [
            mkNotif('project_assigned', 'Employees Assigned', `${employeeIds.length} employee(s) assigned to ${project.name}.`, projectId, 'project'),
            ...s.notifications,
          ],
        }));
        // API call
        projectService.update(projectId, { assignedEmployeeIds: employeeIds }).catch(() => {});
      },

      updateProjectProgress: (projectId, progress) => {
        // Optimistic local update
        set(s => ({
          projects: s.projects.map(p => p.id === projectId ? { ...p, progress, lastUpdated: new Date().toISOString().split('T')[0] } : p),
        }));
        // API call
        projectService.update(projectId, { progress }).catch(() => {});
      },

      updateProjectStatus: (projectId, status) => {
        // Optimistic local update
        set(s => ({
          projects: s.projects.map(p => p.id === projectId ? { ...p, status, lastUpdated: new Date().toISOString().split('T')[0] } : p),
        }));
        // API call
        projectService.update(projectId, { status }).catch(() => {});
      },

      completeMilestone: (projectId, milestoneId) => {
        // Optimistic local update
        set(s => ({
          projects: s.projects.map(p => p.id === projectId ? {
            ...p,
            milestones: p.milestones.map(m => m.id === milestoneId ? {
              ...m, completed: true, completedAt: new Date().toISOString().split('T')[0],
            } : m),
          } : p),
        }));
        // API call
        projectService.update(projectId, { milestoneId, milestoneCompleted: true }).catch(() => {});
      },

      // ─── EMPLOYEE ACTIONS ─────────────────────────────────────────────────
      setActiveEmployee: (id) => set({ activeEmployeeId: id }),
      updateEmployeeWorkload: (employeeId, projectId, add) => {
        // Optimistic local update
        set(s => ({
          employees: s.employees.map(emp => {
            if (emp.id !== employeeId) return emp;
            const newProjects = add
              ? [...new Set([...emp.currentProjectIds, projectId])]
              : emp.currentProjectIds.filter(id => id !== projectId);
            const newWorkload = add
              ? Math.min(100, emp.workloadPercent + 15)
              : Math.max(0, emp.workloadPercent - 15);
            return {
              ...emp,
              currentProjectIds: newProjects,
              workloadPercent: newWorkload,
              availability: newWorkload >= 90 ? 'Busy' : newWorkload < 40 ? 'Available' : emp.availability,
            };
          }),
        }));
        // API call
        const emp = get().employees.find(e => e.id === employeeId);
        if (emp) {
          userManagementService.updateUser(employeeId, {
            current_project_ids: emp.currentProjectIds,
            workload_percent: emp.workloadPercent,
            availability: emp.availability,
          }).catch(() => {});
        }
      },

      // ─── INVOICE ACTIONS ──────────────────────────────────────────────────
      updateInvoiceStatus: (invoiceId, status) => {
        // Optimistic local update
        set(s => ({
          invoices: s.invoices.map(inv => inv.id === invoiceId ? {
            ...inv,
            crmStatus: status,
            paidAt: ['Advance Paid', 'Fully Paid'].includes(status) ? new Date().toISOString() : inv.paidAt,
          } : inv),
        }));
        // API call
        financeService.updateInvoice(invoiceId, { status }).catch(() => {});
      },

      sendInvoiceReminder: (invoiceId) => {
        // Optimistic local update
        set(s => ({
          invoices: s.invoices.map(inv => inv.id === invoiceId ? {
            ...inv, reminderSent: true, reminderCount: inv.reminderCount + 1,
          } : inv),
          notifications: [
            mkNotif('reminder', 'Invoice Reminder Sent', `Reminder sent for invoice ${s.invoices.find(i => i.id === invoiceId)?.invoiceNumber}.`, invoiceId, 'invoice'),
            ...s.notifications,
          ],
        }));
        // API call
        financeService.updateInvoice(invoiceId, { reminderSent: true }).catch(() => {});
      },

      // ─── PAYMENT ACTIONS ──────────────────────────────────────────────────
      verifyPayment: (paymentId, verifiedBy) => {
        const payment = get().payments.find(p => p.id === paymentId);
        if (!payment) return;
        const now = new Date().toISOString();
        // Optimistic local update
        set(s => ({
          payments: s.payments.map(p => p.id === paymentId ? {
            ...p, status: 'Paid', verifiedAt: now, verifiedBy,
          } : p),
          invoices: s.invoices.map(inv => inv.id === payment.invoiceId ? {
            ...inv, crmStatus: 'Advance Paid', paidAt: now, verifiedBy,
          } : inv),
          leads: s.leads.map(l => l.id === payment.leadId ? {
            ...l, crmStatus: 'Payment Verified',
          } : l),
          notifications: [
            mkNotif('payment_received', 'Payment Verified', `₹${payment.amount.toLocaleString('en-IN')} payment verified for ${payment.clientName}.`, paymentId, 'payment'),
            ...s.notifications,
          ],
        }));
        // API call
        financeService.addPayment(payment.invoiceId, { amount: payment.amount, status: 'Paid', verifiedAt: now, verifiedBy }).catch(() => {});
      },

      // ─── NOTIFICATION ACTIONS ─────────────────────────────────────────────
      markNotificationRead: (id) => {
        // Optimistic local update
        set(s => ({
          notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
        }));
        // API call
        notificationService.markRead(id).catch(() => {});
      },

      markAllNotificationsRead: () => {
        // Optimistic local update
        set(s => ({
          notifications: s.notifications.map(n => ({ ...n, read: true })),
        }));
        // API call
        notificationService.markAllRead().catch(() => {});
      },

      addNotification: (n) => set(s => ({
        notifications: [{ ...n, id: `NOTIF-${++notifCounter}` }, ...s.notifications],
      })),

      // ─── SELECTORS ────────────────────────────────────────────────────────
      getLeadById: (id) => get().leads.find(l => l.id === id),
      getClientById: (id) => get().clients.find(c => c.id === id),
      getProjectById: (id) => get().projects.find(p => p.id === id),
      getEmployeeById: (id) => get().employees.find(e => e.id === id),
      getInvoiceById: (id) => get().invoices.find(i => i.id === id),
      getUnreadCount: () => get().notifications.filter(n => !n.read).length,
      getProjectsForClient: (clientId) => get().projects.filter(p => p.clientId === clientId),
      getEmployeesForProject: (projectId) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return [];
        return get().employees.filter(e => project.assignedEmployeeIds.includes(e.id));
      },
      getProjectsByEmployee: (employeeId) => get().projects.filter(p => p.assignedEmployeeIds.includes(employeeId)),
      getTasksByEmployee: (employeeId) => get().tasks.filter(t => t.assignedEmployeeId === employeeId),

      // ─── TASK ACTIONS ───────────────────────────────────────────────────────
      startTask: (taskId) => {
        // Optimistic local update
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, status: 'IN_PROGRESS', lastUpdated: new Date().toISOString() } : t)
        }));
        // API call
        taskService.update(taskId, { status: 'IN_PROGRESS' }).catch(() => {});
      },
      updateTaskProgress: (taskId, progress, status) => {
        // Optimistic local update
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId ? { ...t, progress, status: status || t.status, lastUpdated: new Date().toISOString() } : t)
        }));
        // API call
        taskService.update(taskId, { progress, status: status || undefined }).catch(() => {});
      },
      markTaskBlocked: (taskId, reason) => {
        // Optimistic local update
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId ? {
            ...t, status: 'BLOCKED', lastUpdated: new Date().toISOString(),
            comments: [...t.comments, { id: `COM-${Date.now()}`, authorId: t.assignedEmployeeId, text: `BLOCKED: ${reason}`, date: new Date().toISOString() }]
          } : t)
        }));
        // API call
        taskService.update(taskId, { status: 'BLOCKED' }).catch(() => {});
        taskService.addComment(taskId, `BLOCKED: ${reason}`).catch(() => {});
      },
      addTaskComment: (taskId, text) => {
        // Optimistic local update
        set(s => ({
          tasks: s.tasks.map(t => t.id === taskId ? {
            ...t, comments: [...t.comments, { id: `COM-${Date.now()}`, authorId: s.activeEmployeeId || t.assignedEmployeeId, text, date: new Date().toISOString() }]
          } : t)
        }));
        // API call
        taskService.addComment(taskId, text).catch(() => {});
      },
      addMockFile: (taskId, name) => set(s => ({
        tasks: s.tasks.map(t => t.id === taskId ? {
          ...t, workingFiles: [...t.workingFiles, { id: `FILE-${Date.now()}`, name, url: '#', uploadedAt: new Date().toISOString() }]
        } : t)
      })),

      // ─── SUBMISSION ACTIONS ─────────────────────────────────────────────────
      saveSubmissionDraft: (data) => set(s => {
        return {}; 
      }),
      submitToCRM: (data) => set(s => {
        const submissionNum = String(s.submissions.length + 1).padStart(3, '0');
        const newSubId = `SUB-${submissionNum}`;
        const newSub: CrmSubmission = {
          id: newSubId,
          employeeId: data.employeeId!,
          projectId: data.projectId!,
          taskId: data.taskId!,
          clientId: data.clientId!,
          service: data.service!,
          assignmentId: `${data.projectId}_${data.taskId}`,
          assignedRole: data.assignedRole!,
          title: data.title!,
          workSummary: data.workSummary!,
          deliverableType: data.deliverableType!,
          currentStatus: 'PENDING_CRM_REVIEW',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          versions: [
            {
              versionId: `VER-${Date.now()}`,
              versionNumber: 1,
              submissionDate: new Date().toISOString(),
              files: data.versions?.[0]?.files || [],
              externalUrl: data.versions?.[0]?.externalUrl,
              completionPercentage: data.versions?.[0]?.completionPercentage || 100,
              employeeComment: data.versions?.[0]?.employeeComment || '',
              status: 'PENDING_CRM_REVIEW'
            }
          ]
        };

        return {
          submissions: [newSub, ...s.submissions],
          tasks: s.tasks.map(t => t.id === data.taskId ? { ...t, status: 'SUBMITTED' } : t),
          projects: s.projects.map(p => p.id === data.projectId ? { ...p, status: 'SUBMITTED_BY_EMPLOYEE' } : p),
          activityLogs: [{ id: `ACT-${Date.now()}`, type: 'submission_created', description: `Submitted work for task ${data.taskId}`, timestamp: new Date().toISOString(), employeeId: data.employeeId, projectId: data.projectId, taskId: data.taskId }, ...s.activityLogs],
          notifications: [
            mkNotif('submission_created', 'New Submission Received', `Work submitted by ${data.employeeId} for project ${data.projectId}`, newSubId, 'submission'),
            ...s.notifications
          ]
        };
      }),
      acknowledgeCRMFeedback: (submissionId) => set(s => ({
        activityLogs: [{ id: `ACT-${Date.now()}`, type: 'feedback_acknowledged', description: `Acknowledged CRM feedback for submission ${submissionId}`, timestamp: new Date().toISOString() }, ...s.activityLogs]
      })),
      createRevision: (submissionId, notes) => set(s => ({
        activityLogs: [{ id: `ACT-${Date.now()}`, type: 'revision_started', description: `Started revision for submission ${submissionId}: ${notes}`, timestamp: new Date().toISOString() }, ...s.activityLogs]
      })),
      resubmitToCRM: (submissionId, versionData) => set(s => {
        const sub = s.submissions.find(sub => sub.id === submissionId);
        if (!sub) return {};
        const newVersionNum = sub.versions.length + 1;
        const newVersion: CrmSubmissionVersion = {
          versionId: `VER-${Date.now()}`,
          versionNumber: newVersionNum,
          submissionDate: new Date().toISOString(),
          files: versionData.files || [],
          externalUrl: versionData.externalUrl,
          completionPercentage: versionData.completionPercentage || 100,
          employeeComment: versionData.employeeComment || '',
          status: 'PENDING_CRM_REVIEW',
          revisionNotes: versionData.revisionNotes
        };
        
        return {
          submissions: s.submissions.map(sItem => sItem.id === submissionId ? {
            ...sItem,
            currentStatus: 'PENDING_CRM_REVIEW',
            lastUpdated: new Date().toISOString(),
            versions: [newVersion, ...sItem.versions]
          } : sItem),
          notifications: [
            mkNotif('submission_created', 'Revision Submitted', `Revision ${newVersionNum} submitted for ${sub.title}`, submissionId, 'submission'),
            ...s.notifications
          ]
        };
      }),
      reviewSubmission: (submissionId) => set(s => {
        return {};
      }),
      requestSubmissionChanges: (submissionId, feedback) => set(s => {
        const sub = s.submissions.find(sItem => sItem.id === submissionId);
        return {
          submissions: s.submissions.map(sItem => sItem.id === submissionId ? {
            ...sItem,
            currentStatus: 'CRM_CHANGES_REQUESTED',
            lastUpdated: new Date().toISOString(),
            versions: sItem.versions.map((v, i) => i === 0 ? { ...v, status: 'CRM_CHANGES_REQUESTED', crmFeedback: feedback } : v)
          } : sItem),
          projects: s.projects.map(p => p.id === sub?.projectId ? { ...p, status: 'In Progress' } : p),
          tasks: s.tasks.map(t => t.id === sub?.taskId ? { ...t, status: 'IN_PROGRESS' } : t),
          notifications: [
            mkNotif('crm_changes_requested', 'Changes Requested', `CRM requested changes on ${sub?.title}`, submissionId, 'submission'),
            ...s.notifications
          ]
        };
      }),
      approveSubmission: (submissionId) => set(s => {
        const sub = s.submissions.find(sItem => sItem.id === submissionId);
        return {
          submissions: s.submissions.map(sItem => sItem.id === submissionId ? {
            ...sItem,
            currentStatus: 'CRM_APPROVED',
            lastUpdated: new Date().toISOString(),
            versions: sItem.versions.map((v, i) => i === 0 ? { ...v, status: 'CRM_APPROVED' } : v)
          } : sItem),
          tasks: s.tasks.map(t => t.id === sub?.taskId ? { ...t, status: 'DONE', progress: 100 } : t),
          notifications: [
            mkNotif('crm_approved', 'Submission Approved', `CRM approved your submission for ${sub?.title}`, submissionId, 'submission'),
            ...s.notifications
          ]
        };
      }),
    }),
    {
      name: 'amplivo-crm-store',
      partialize: (state) => ({
        selectedLeadId: state.selectedLeadId,
        selectedClientId: state.selectedClientId,
        selectedProjectId: state.selectedProjectId,
        activeEmployeeId: state.activeEmployeeId,
      }),
    }
  )
);

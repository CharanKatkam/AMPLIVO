// ─────────────────────────────────────────────────────────────────────────────
// AMPLIVO CRM PORTAL — TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────
// NOTE FOR BACKEND DEVELOPERS:
//   Every interface maps 1-to-1 with a planned REST API resource.
//   When integrating: replace mock service calls with real API calls.
//   All service functions return Promise<T> — no component changes needed.
// ─────────────────────────────────────────────────────────────────────────────

import { SalesLead, SalesInvoice } from '@/types';

// ─── CRM LEAD ─────────────────────────────────────────────────────────────────

export type CrmLeadStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Invoice Sent'
  | 'Credentials Sent'
  | 'Payment Pending'
  | 'Payment Verified'
  | 'Client Created';

export interface CrmCredentials {
  clientId: string;
  username: string;
  tempPassword: string;
  expiryDate: string;
  emailSent: boolean;
  generatedAt: string;
}

export interface CrmLead {
  salesLead: SalesLead;
  salesInvoice: SalesInvoice | null;
  id: string;
  crmStatus: CrmLeadStatus;
  crmAssignedTo: string;
  reviewNotes: string;
  rejectionReason?: string;
  credentials?: CrmCredentials;
  invoiceEmailSent: boolean;
  welcomeEmailSent: boolean;
  convertedToClientId?: string;
  receivedAt: string;
  approvedAt?: string;
  clientCreatedAt?: string;
}

// ─── CRM CLIENT ───────────────────────────────────────────────────────────────

export type ClientStatus = 'Active' | 'Onboarding' | 'Churned' | 'On Hold' | 'Renewal Due';
export type PaymentStatus = 'Advance Paid' | 'Fully Paid' | 'Overdue' | 'Pending' | 'Partial';

export interface CrmClient {
  id: string;
  leadId: string;
  invoiceId: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  company: string;
  industry: string;
  companySize: string;
  website: string;
  city: string;
  services: string[];
  monthlyRetainer: number;
  totalContractValue: number;
  assignedCrmExec: string;
  assignedEmployees: string[];
  projectId?: string;
  status: ClientStatus;
  paymentStatus: PaymentStatus;
  startDate: string;
  renewalDate: string;
  createdAt: string;
  lastUpdated: string;
  credentials: CrmCredentials;
  notes: string;
}

// ─── CRM PROJECT ──────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'Waiting Assignment'
  | 'Assigned'
  | 'In Progress'
  | 'On Hold'
  | 'Review'
  | 'SUBMITTED_BY_EMPLOYEE'
  | 'Completed'
  | 'Cancelled';

export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface CrmProject {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  company: string;
  services: string[];
  description: string;
  priority: ProjectPriority;
  startDate: string;
  endDate: string;
  durationMonths: number;
  status: ProjectStatus;
  progress: number;
  milestones: ProjectMilestone[];
  assignedEmployeeIds: string[];
  crmExec: string;
  budgetINR: number;
  notes: string;
  createdAt: string;
  lastUpdated: string;
}

// ─── CRM EMPLOYEE ─────────────────────────────────────────────────────────────

export type EmployeeDepartment =
  | 'Performance Marketing'
  | 'SEO & Content'
  | 'Social Media'
  | 'Creative & Design'
  | 'Web Development'
  | 'Automation & CRM'
  | 'Strategy & Management';

export type EmployeeStatus = 'Available' | 'Busy' | 'On Leave' | 'Remote';

export interface CrmEmployee {
  id: string;
  name: string;
  role: string;
  department: EmployeeDepartment;
  email: string;
  phone: string;
  skills: string[];
  currentProjectIds: string[];
  availability: EmployeeStatus;
  workloadPercent: number;
  joinDate: string;
  photoInitials: string;
  avatarColor: string;
  serviceCategories: string[];
}

// ─── CRM INVOICE ──────────────────────────────────────────────────────────────

export type CrmInvoiceStatus = 'Sent' | 'Viewed' | 'Payment Pending' | 'Advance Paid' | 'Fully Paid' | 'Overdue' | 'Cancelled';

export interface CrmInvoice extends SalesInvoice {
  crmStatus: CrmInvoiceStatus;
  sentAt?: string;
  viewedAt?: string;
  paidAt?: string;
  reminderSent: boolean;
  reminderCount: number;
  verifiedBy?: string;
  clientId?: string;
}

// ─── CRM PAYMENT ──────────────────────────────────────────────────────────────

export type PaymentMethod = 'Bank Transfer' | 'UPI' | 'Cheque' | 'Card' | 'Net Banking';
export type PaymentVerificationStatus = 'Pending' | 'Processing' | 'Paid' | 'Failed' | 'Refunded';

export interface CrmPayment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  leadId: string;
  clientName: string;
  company: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentVerificationStatus;
  transactionId: string;
  date: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes: string;
}

// ─── CRM NOTIFICATION ─────────────────────────────────────────────────────────

export type NotificationType =
  | 'invoice_sent'
  | 'payment_received'
  | 'client_created'
  | 'project_assigned'
  | 'task_assigned'
  | 'task_status_update'
  | 'submission_created'
  | 'crm_changes_requested'
  | 'crm_approved'
  | 'reminder'
  | 'lead_approved'
  | 'lead_rejected'
  | 'credentials_generated'
  | 'project_update';

export interface CrmNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  linkedId?: string;
  linkedType?: 'lead' | 'client' | 'project' | 'invoice' | 'payment' | 'task' | 'submission';
}

// ─── CRM TASK ─────────────────────────────────────────────────────────────────

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'SUBMITTED' | 'DONE';

export interface CrmTask {
  id: string;
  projectId: string;
  projectName: string;
  clientId: string;
  service: string;
  assignedEmployeeId: string;
  assignedRole: string;
  title: string;
  description: string;
  priority: ProjectPriority;
  dueDate: string;
  status: TaskStatus;
  progress: number;
  comments: { id: string; authorId: string; text: string; date: string }[];
  workingFiles: { id: string; name: string; url: string; uploadedAt: string }[];
  createdAt: string;
  lastUpdated: string;
}

// ─── CRM SUBMISSION ───────────────────────────────────────────────────────────

export type SubmissionStatus = 'PENDING_CRM_REVIEW' | 'CRM_CHANGES_REQUESTED' | 'CRM_APPROVED' | 'SENT_TO_CLIENT';

export interface CrmSubmissionVersion {
  versionId: string;
  versionNumber: number;
  submissionDate: string;
  files: { id: string; name: string; url: string }[];
  externalUrl?: string;
  completionPercentage: number;
  employeeComment: string;
  crmFeedback?: string;
  status: SubmissionStatus;
  revisionNotes?: string;
}

export interface CrmSubmission {
  id: string;
  employeeId: string;
  projectId: string;
  taskId: string;
  clientId: string;
  service: string;
  assignmentId: string; // the linked project/task combination
  assignedRole: string;
  title: string;
  workSummary: string;
  deliverableType: string;
  currentStatus: SubmissionStatus;
  versions: CrmSubmissionVersion[];
  createdAt: string;
  lastUpdated: string;
}

// ─── CRM ACTIVITY LOG ─────────────────────────────────────────────────────────

export interface CrmActivityLog {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  employeeId?: string;
  projectId?: string;
  taskId?: string;
}

// ─── API RESPONSE WRAPPERS ────────────────────────────────────────────────────
// BACKEND NOTE: Replace mock returns with these from your API

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── FILTER PARAMS ────────────────────────────────────────────────────────────
// These mirror query params for future API calls

export interface LeadFilterParams {
  status?: CrmLeadStatus;
  assignedTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ClientFilterParams {
  status?: ClientStatus;
  service?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProjectFilterParams {
  status?: ProjectStatus;
  priority?: ProjectPriority;
  clientId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface InvoiceFilterParams {
  status?: CrmInvoiceStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

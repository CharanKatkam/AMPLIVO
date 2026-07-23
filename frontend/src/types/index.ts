// ─────────────────────────────────────────────
// AMPLIVO – Global TypeScript Types
// ─────────────────────────────────────────────

export interface Service {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  icon: string;
  color: string;
  features: string[];
  platforms?: string[];
  deliverables?: string[];
}

export interface Industry {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  fullDesc?: string;
  challenges?: string[];
  solutions?: { title: string; desc: string }[];
}

export interface CaseStudy {
  id: string;
  slug: string;
  clientName: string;
  industry: string;
  location: string;
  category: string;
  tag: string;
  title: string;
  challenge: string;
  solution: string;
  duration: string;
  platforms: string[];
  metrics: { label: string; value: string }[];
  image: string;
  testimonial?: string;
  objective?: string;
  budgetRange?: string;
  creatives?: { title: string; type: string; image: string }[];
  landingPages?: { title: string; url: string }[];
  screenshots?: string[];
  relatedServices?: { name: string; slug: string }[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  client: string;
  category: string;
  image: string;
  tags: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  image: string;
  linkedin?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  content: string;
  rating: number;
  image: string;
}

export interface BlogPostInsight {
  metricLabel1: string;
  metricValue1: string;
  metricLabel2: string;
  metricValue2: string;
  metricLabel3: string;
  metricValue3: string;
  chartData: { name: string; value: number }[];
  chartLabel: string;
  text: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  content?: string[];
  insight?: BlogPostInsight;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  industry: string;
  services: string[];
  status: 'Active' | 'Inactive' | 'At Risk';
  mrr: string;
}

export interface Campaign {
  id: string;
  name: string;
  client: string;
  channel: string;
  status: 'Active' | 'Paused' | 'Draft' | 'Completed';
  budget: string;
  spend: string;
  roi: string;
  leads: number;
  startDate: string;
  endDate: string;
  assignedTo: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  industry: string;
  services: string[];
  status: 'Active' | 'At Risk' | 'Inactive';
  mrr: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  campaign: string;
  source: string;
  status: 'Hot' | 'Warm' | 'Cold' | 'Converted' | 'Lost' | 'New';
  assignedTo: string;
  followUpDate: string;
  notes: string;
  value: string;
}

export interface Creative {
  id: string;
  title: string;
  caption: string;
  campaign: string;
  type: 'Social Post' | 'Banner' | 'Reel' | 'Story' | 'Video';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Revision';
  uploadedDate: string;
  image: string;
  comments: number;
  version: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: string;
  status: 'Paid' | 'Pending' | 'Overdue' | 'Draft';
  dueDate: string;
  issueDate: string;
  services: string[];
}

export interface TeamMemberERP {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  utilization: number;
  activeTasks: number;
  status: 'Active' | 'On Leave';
  joinDate: string;
  image: string;
}

export interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: string;
  category: string;
  followers: string;
  engagementRate: string;
  status: 'Available' | 'In Campaign' | 'Under Review';
  fee: string;
  location: string;
  image: string;
}

export interface Task {
  id: string;
  title: string;
  assignedTo: string;
  department: string;
  campaign: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Todo' | 'In Progress' | 'Review' | 'Done';
  dueDate: string;
  description: string;
}

export interface ChartDataPoint {
  month: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  leads?: number;
  spend?: number;
}

// ─────────────────────────────────────────────
// SALES PORTAL – Types
// ─────────────────────────────────────────────

export type SalesLeadStatus =
  | 'New'
  | 'Contacted'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Ready for CRM';

export type MeetingType = 'Video Call' | 'Phone Call' | 'In-Person' | 'Demo';
export type MeetingStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'No-Show';

export interface Meeting {
  id: string;
  leadId: string;
  leadName: string;
  company: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: MeetingType;
  status: MeetingStatus;
  notes: string;
  agenda?: string;
  followUpRequired: boolean;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'lead_created' | 'status_changed' | 'meeting_scheduled' | 'meeting_completed' | 'note_added' | 'invoice_generated' | 'budget_updated' | 'services_updated';
  description: string;
  actor: string;
}

export interface SalesService {
  id: string;
  name: string;
  category: string;
  monthlyPrice: number;
  setupFee: number;
  selected: boolean;
}

export interface SalesInvoiceLineItem {
  serviceId: string;
  serviceName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesInvoice {
  id: string;
  invoiceNumber: string;
  leadId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  company: string;
  issueDate: string;
  dueDate: string;
  lineItems: SalesInvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  advancePercent: number;
  advanceDue: number;
  status: 'Draft' | 'Sent' | 'Advance Paid' | 'Fully Paid';
  notes: string;
}

export interface SalesLead {
  id: string;
  // Contact Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  designation: string;
  // Company Info
  company: string;
  industry: string;
  companySize: string;
  website: string;
  city: string;
  // Pipeline
  status: SalesLeadStatus;
  source: 'Contact Form' | 'Referral' | 'Organic' | 'Paid Ads' | 'Social Media' | 'Cold Outreach' | 'Event';
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  // Deal
  budget: number;
  expectedCloseDate: string;
  probability: number; // 0–100
  interestedServices: string[];
  // History
  notes: string;
  meetings: Meeting[];
  timeline: TimelineEvent[];
  // Invoice
  invoiceGenerated: boolean;
  invoiceId?: string;
  // Meta
  createdAt: string;
  lastUpdated: string;
  followUpDate: string;
}

import { CrmNotification } from '@/types/crm';

// ─────────────────────────────────────────────────────────────────────────────
// AMPLIVO CRM — Notifications Mock Data
// BACKEND NOTE: Replace with GET /api/crm/notifications
// ─────────────────────────────────────────────────────────────────────────────

export const crmNotifications: CrmNotification[] = [
  { id: 'NOTIF-001', type: 'lead_approved', title: 'New Lead Ready for CRM', message: 'Harini Bhatt (Bhatt Organics) has been approved and assigned to you.', date: '2026-07-21', time: '09:15 AM', read: false, linkedId: 'cml-030', linkedType: 'lead' },
  { id: 'NOTIF-002', type: 'payment_received', title: 'Payment Received', message: 'Advance payment of ₹27,435 received from Bhatt Organics (Invoice AMP-CRM-030).', date: '2026-07-21', time: '10:30 AM', read: false, linkedId: 'PAY-026', linkedType: 'payment' },
  { id: 'NOTIF-003', type: 'client_created', title: 'New Client Created', message: 'Harini Bhatt has been onboarded as a client (AMP-CLT-027).', date: '2026-07-21', time: '10:45 AM', read: false, linkedId: 'CLT-027', linkedType: 'client' },
  { id: 'NOTIF-004', type: 'project_assigned', title: 'Project Assigned', message: 'Project PRJ-027 (Bhatt Organics — Instagram + Influencer) has been created.', date: '2026-07-21', time: '11:00 AM', read: false, linkedId: 'PRJ-027', linkedType: 'project' },
  { id: 'NOTIF-005', type: 'lead_approved', title: 'Lead Ready for CRM', message: 'Satish Pandey (Pandey IT Solutions) assigned to CRM pipeline.', date: '2026-07-20', time: '02:30 PM', read: false, linkedId: 'cml-029', linkedType: 'lead' },
  { id: 'NOTIF-006', type: 'payment_received', title: 'Payment Verified', message: '₹42,775 advance payment verified for Pandey IT Solutions.', date: '2026-07-20', time: '04:15 PM', read: false, linkedId: 'PAY-025', linkedType: 'payment' },
  { id: 'NOTIF-007', type: 'invoice_sent', title: 'Invoice Sent', message: 'Invoice AMP-CRM-029 sent to Satish Pandey (satish@pandeyit.com).', date: '2026-07-20', time: '02:45 PM', read: true, linkedId: 'inv-cml-029', linkedType: 'invoice' },
  { id: 'NOTIF-008', type: 'credentials_generated', title: 'Client Credentials Generated', message: 'Login credentials generated and emailed to Satish Pandey.', date: '2026-07-20', time: '03:00 PM', read: true, linkedId: 'CLT-026', linkedType: 'client' },
  { id: 'NOTIF-009', type: 'reminder', title: 'Payment Overdue', message: 'Invoice AMP-CRM-048 (Kulkarni Group) is overdue. 2nd reminder sent.', date: '2026-07-19', time: '09:00 AM', read: true, linkedId: 'inv-overdue-01', linkedType: 'invoice' },
  { id: 'NOTIF-010', type: 'payment_received', title: 'Payment Received', message: '₹52,525 advance received from Kulkarni Resorts (Invoice AMP-CRM-028).', date: '2026-07-19', time: '11:30 AM', read: true, linkedId: 'PAY-024', linkedType: 'payment' },
  { id: 'NOTIF-011', type: 'client_created', title: 'Client Onboarded', message: 'Varsha Kulkarni (Kulkarni Resorts) created as AMP-CLT-021.', date: '2026-07-19', time: '11:45 AM', read: true, linkedId: 'CLT-021', linkedType: 'client' },
  { id: 'NOTIF-012', type: 'lead_approved', title: 'Lead Ready for CRM', message: 'Varsha Kulkarni (Kulkarni Resorts) moved to CRM pipeline.', date: '2026-07-19', time: '10:00 AM', read: true, linkedId: 'cml-028', linkedType: 'lead' },
  { id: 'NOTIF-013', type: 'project_update', title: 'Project Milestone Completed', message: 'Q1 Campaign milestone completed for Bose Automobiles (PRJ-029).', date: '2026-07-18', time: '03:45 PM', read: true, linkedId: 'PRJ-029', linkedType: 'project' },
  { id: 'NOTIF-014', type: 'invoice_sent', title: 'Invoice Sent', message: 'Invoice AMP-CRM-046 (₹1,38,000) sent to Mahesh Shetty.', date: '2026-07-18', time: '02:00 PM', read: true, linkedId: 'inv-sl-22', linkedType: 'invoice' },
  { id: 'NOTIF-015', type: 'payment_received', title: 'Payment Verified', message: '₹40,710 advance verified for Shetty Machinery (AMP-CLT-044).', date: '2026-07-18', time: '05:00 PM', read: true, linkedId: 'PAY-030', linkedType: 'payment' },
  { id: 'NOTIF-016', type: 'project_assigned', title: 'Project Created', message: 'Project PRJ-044 (Shetty Machinery — Website + LinkedIn) created. Assignment pending.', date: '2026-07-18', time: '05:15 PM', read: true, linkedId: 'PRJ-044', linkedType: 'project' },
  { id: 'NOTIF-017', type: 'reminder', title: 'Follow Up Due', message: 'Follow up with Suresh Iyer (Iyer Foods) — invoice payment pending since May 22.', date: '2026-07-17', time: '09:00 AM', read: true, linkedId: 'cml-005', linkedType: 'lead' },
  { id: 'NOTIF-018', type: 'lead_rejected', title: 'Lead Rejected', message: 'Lead from Devraj Menon (Menon Chemicals) rejected — insufficient budget.', date: '2026-07-16', time: '11:00 AM', read: true, linkedId: 'cml-030', linkedType: 'lead' },
  { id: 'NOTIF-019', type: 'project_update', title: 'Project Progress Update', message: 'Kapoor Electrical (PRJ-037) reached 70% completion.', date: '2026-07-15', time: '04:00 PM', read: true, linkedId: 'PRJ-037', linkedType: 'project' },
  { id: 'NOTIF-020', type: 'payment_received', title: 'Full Payment Received', message: '₹1,27,440 full payment received from Joshi Insurance.', date: '2026-07-14', time: '02:30 PM', read: true, linkedId: 'PAY-018', linkedType: 'payment' },
];

import { CrmLead } from '@/types/crm';
import { salesLeads, salesInvoices } from '@/data/sales';

// ─────────────────────────────────────────────────────────────────────────────
// AMPLIVO CRM — CRM Leads Mock Data (80 leads)
// BACKEND NOTE: Replace with GET /api/crm/leads
// Leads are consumed from Sales Portal (status: 'Ready for CRM')
// ─────────────────────────────────────────────────────────────────────────────

// Helper to get invoice by leadId
function getInvoiceForLead(leadId: string) {
  return salesInvoices.find(inv => inv.leadId === leadId) ?? null;
}

const crmExecs = ['Anjali Gupta', 'Ravi Nambiar', 'Kavitha Reddy'];

// ─── READY FOR CRM LEADS (from Sales Portal) ─────────────────────────────────
export const crmLeadsFromSales: CrmLead[] = salesLeads
  .filter(l => l.status === 'Ready for CRM')
  .map((lead, idx) => ({
    salesLead: lead,
    salesInvoice: getInvoiceForLead(lead.id),
    id: lead.id,
    crmStatus: 'Pending Review' as const,
    crmAssignedTo: crmExecs[idx % crmExecs.length],
    reviewNotes: '',
    invoiceEmailSent: false,
    welcomeEmailSent: false,
    receivedAt: lead.lastUpdated,
  }));

// ─── ADDITIONAL MOCK CRM LEADS (to reach 80 total) ───────────────────────────
// These represent historical leads already processed by CRM

const mockLeadTemplate = (id: string, firstName: string, lastName: string, company: string, email: string,
  phone: string, industry: string, city: string, services: string[], budget: number,
  status: CrmLead['crmStatus'], crmExec: string, invoiceNumber: string, invoiceId: string,
  receivedAt: string, approvedAt?: string): CrmLead => ({
  id,
  salesLead: {
    id,
    firstName,
    lastName,
    email,
    phone,
    designation: 'MD',
    company,
    industry,
    companySize: '10–50',
    website: `${company.toLowerCase().replace(/\s+/g, '')}.com`,
    city,
    status: 'Ready for CRM',
    source: 'Contact Form',
    assignedTo: 'Priya Subramaniam',
    priority: budget > 200000 ? 'High' : 'Medium',
    budget,
    expectedCloseDate: '2026-08-30',
    probability: 80,
    interestedServices: services,
    notes: `Client from ${city} industry.`,
    meetings: [],
    timeline: [],
    invoiceGenerated: true,
    invoiceId,
    createdAt: receivedAt,
    lastUpdated: receivedAt,
    followUpDate: receivedAt,
  },
  salesInvoice: {
    id: invoiceId,
    invoiceNumber,
    leadId: id,
    clientName: `${firstName} ${lastName}`,
    clientEmail: email,
    clientPhone: phone,
    company,
    issueDate: receivedAt,
    dueDate: new Date(new Date(receivedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lineItems: services.map(s => ({ serviceId: s.slice(0, 6), serviceName: s, description: s, quantity: 3, unitPrice: 30000, total: 90000 })),
    subtotal: budget,
    taxRate: 18,
    taxAmount: Math.round(budget * 0.18),
    grandTotal: Math.round(budget * 1.18),
    advancePercent: 25,
    advanceDue: Math.round(budget * 1.18 * 0.25),
    status: status === 'Client Created' ? 'Advance Paid' : 'Sent',
    notes: '',
  },
  crmStatus: status,
  crmAssignedTo: crmExec,
  reviewNotes: status !== 'Pending Review' ? 'Lead reviewed and approved. Client onboarding started.' : '',
  invoiceEmailSent: ['Invoice Sent', 'Credentials Sent', 'Payment Pending', 'Payment Verified', 'Client Created'].includes(status),
  welcomeEmailSent: ['Credentials Sent', 'Payment Pending', 'Payment Verified', 'Client Created'].includes(status),
  convertedToClientId: status === 'Client Created' ? `CLT-${id.slice(-3)}` : undefined,
  receivedAt,
  approvedAt,
  clientCreatedAt: status === 'Client Created' ? approvedAt : undefined,
  credentials: ['Credentials Sent', 'Payment Pending', 'Payment Verified', 'Client Created'].includes(status) ? {
    clientId: `AMP-CLT-${id.slice(-3)}`,
    username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@amplivo.client`,
    tempPassword: `Amp#${Math.floor(1000 + Math.random() * 9000)}Temp`,
    expiryDate: new Date(new Date(receivedAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    emailSent: true,
    generatedAt: approvedAt ?? receivedAt,
  } : undefined,
});

export const crmAdditionalLeads: CrmLead[] = [
  mockLeadTemplate('cml-001','Rajiv','Bhatia','Bhatia Pharmaceuticals','rajiv@bhatiapharma.com','+91 88001 11001','Pharma','Delhi',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],175000,'Client Created','Anjali Gupta','AMP-CRM-001','inv-cml-001','2026-05-10','2026-05-12'),
  mockLeadTemplate('cml-002','Seema','Malhotra','Malhotra Jewellers','seema@malhotrajewellers.com','+91 88001 11002','Retail','Jaipur',['Social Media Management','Instagram Marketing'],120000,'Client Created','Ravi Nambiar','AMP-CRM-002','inv-cml-002','2026-05-12','2026-05-14'),
  mockLeadTemplate('cml-003','Amit','Singh','Singh Builders','amit@singhbuilders.com','+91 88001 11003','Real Estate','Pune',['Performance Marketing (Meta + Google)','Landing Page Design'],220000,'Client Created','Kavitha Reddy','AMP-CRM-003','inv-cml-003','2026-05-15','2026-05-17'),
  mockLeadTemplate('cml-004','Nisha','Patel','Patel Exports','nisha@patelexports.com','+91 88001 11004','Export/Import','Ahmedabad',['LinkedIn B2B Marketing','Content Marketing & Blogging'],95000,'Payment Verified','Anjali Gupta','AMP-CRM-004','inv-cml-004','2026-05-18','2026-05-20'),
  mockLeadTemplate('cml-005','Suresh','Iyer','Iyer Foods','suresh@iyerfoods.com','+91 88001 11005','Food & Beverage','Chennai',['Instagram Marketing','Video Production & YouTube'],145000,'Payment Pending','Ravi Nambiar','AMP-CRM-005','inv-cml-005','2026-05-20','2026-05-22'),
  mockLeadTemplate('cml-006','Kavya','Nair','Nair Clinics','kavya@nairclinics.com','+91 88001 11006','Healthcare','Kochi',['Search Engine Optimization (SEO)','Google Ads Management'],110000,'Credentials Sent','Kavitha Reddy','AMP-CRM-006','inv-cml-006','2026-05-22','2026-05-24'),
  mockLeadTemplate('cml-007','Rahul','Chandra','Chandra Logistics','rahul@chandralogistics.com','+91 88001 11007','Logistics','Hyderabad',['LinkedIn B2B Marketing','Email Marketing & Automation'],87000,'Invoice Sent','Anjali Gupta','AMP-CRM-007','inv-cml-007','2026-05-25','2026-05-27'),
  mockLeadTemplate('cml-008','Anita','Verma','Verma Technologies','anita@vermatechnologies.com','+91 88001 11008','IT','Bengaluru',['Search Engine Optimization (SEO)','Performance Marketing (Meta + Google)'],195000,'Approved','Ravi Nambiar','AMP-CRM-008','inv-cml-008','2026-05-28'),
  mockLeadTemplate('cml-009','Pradeep','Kumar','Kumar Hotels','pradeep@kumarhotels.com','+91 88001 11009','Hospitality','Goa',['Social Media Management','Video Production & YouTube','Instagram Marketing'],165000,'Pending Review','Kavitha Reddy','AMP-CRM-009','inv-cml-009','2026-06-01'),
  mockLeadTemplate('cml-010','Lakshmi','Prasad','Prasad Educations','lakshmi@prasadedu.com','+91 88001 11010','Education','Hyderabad',['Google Ads Management','Content Marketing & Blogging'],98000,'Pending Review','Anjali Gupta','AMP-CRM-010','inv-cml-010','2026-06-03'),
  mockLeadTemplate('cml-011','Vijay','Reddy','Reddy Motors','vijay@reddymotors.com','+91 88001 11011','Automotive','Hyderabad',['Performance Marketing (Meta + Google)','Social Media Management'],187000,'Client Created','Ravi Nambiar','AMP-CRM-011','inv-cml-011','2026-06-05','2026-06-07'),
  mockLeadTemplate('cml-012','Shweta','Agarwal','Agarwal Fashion','shweta@agarwalfashion.com','+91 88001 11012','Fashion','Mumbai',['Instagram Marketing','Influencer Marketing Management'],135000,'Client Created','Kavitha Reddy','AMP-CRM-012','inv-cml-012','2026-06-08','2026-06-10'),
  mockLeadTemplate('cml-013','Mohan','Krishnan','Krishnan Consulting','mohan@krishnanconsult.com','+91 88001 11013','Consulting','Bengaluru',['LinkedIn B2B Marketing','Content Marketing & Blogging'],88000,'Payment Verified','Anjali Gupta','AMP-CRM-013','inv-cml-013','2026-06-10','2026-06-12'),
  mockLeadTemplate('cml-014','Ritu','Chopra','Chopra Real Estate','ritu@choprarealty.com','+91 88001 11014','Real Estate','Delhi',['Performance Marketing (Meta + Google)','Landing Page Design'],210000,'Client Created','Ravi Nambiar','AMP-CRM-014','inv-cml-014','2026-06-12','2026-06-14'),
  mockLeadTemplate('cml-015','Nikhil','Shah','Shah Pharmaceuticals','nikhil@shahpharma.com','+91 88001 11015','Pharma','Mumbai',['Search Engine Optimization (SEO)','Email Marketing & Automation'],142000,'Client Created','Kavitha Reddy','AMP-CRM-015','inv-cml-015','2026-06-15','2026-06-17'),
  mockLeadTemplate('cml-016','Pooja','Mehta','Mehta Electronics','pooja@mehtaelectronics.com','+91 88001 11016','Electronics','Pune',['Google Ads Management','Social Media Management'],118000,'Payment Pending','Anjali Gupta','AMP-CRM-016','inv-cml-016','2026-06-18','2026-06-20'),
  mockLeadTemplate('cml-017','Arun','Pillai','Pillai Constructions','arun@pillaiconst.com','+91 88001 11017','Construction','Kochi',['Performance Marketing (Meta + Google)','Creative Design & Branding'],175000,'Credentials Sent','Ravi Nambiar','AMP-CRM-017','inv-cml-017','2026-06-20','2026-06-22'),
  mockLeadTemplate('cml-018','Divya','Kapoor','Kapoor Law Firm','divya@kapoorlaw.com','+91 88001 11018','Legal','Delhi',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],92000,'Invoice Sent','Kavitha Reddy','AMP-CRM-018','inv-cml-018','2026-06-22','2026-06-24'),
  mockLeadTemplate('cml-019','Rajan','Shetty','Shetty Foods','rajan@shettyfoods.com','+91 88001 11019','Food & Beverage','Mangalore',['Instagram Marketing','Influencer Marketing Management'],128000,'Approved','Anjali Gupta','AMP-CRM-019','inv-cml-019','2026-06-25'),
  mockLeadTemplate('cml-020','Sonal','Desai','Desai Architects','sonal@desaiarch.com','+91 88001 11020','Architecture','Pune',['LinkedIn B2B Marketing','Website Design & Development'],155000,'Pending Review','Ravi Nambiar','AMP-CRM-020','inv-cml-020','2026-06-28'),
  // Additional leads to reach 80 total including crmLeadsFromSales
  mockLeadTemplate('cml-021','Girish','Kulkarni','Kulkarni Dairy','girish@kulkarnidairy.com','+91 88001 11021','Food & Beverage','Kolhapur',['Social Media Management','Video Production & YouTube'],98000,'Client Created','Kavitha Reddy','AMP-CRM-021','inv-cml-021','2026-07-01','2026-07-03'),
  mockLeadTemplate('cml-022','Priyanka','Joshi','Joshi Insurance','priyanka@joshiinsurance.com','+91 88001 11022','Finance','Mumbai',['Google Ads Management','Email Marketing & Automation'],108000,'Client Created','Anjali Gupta','AMP-CRM-022','inv-cml-022','2026-07-03','2026-07-05'),
  mockLeadTemplate('cml-023','Sanjeev','Tiwari','Tiwari Traders','sanjeev@tiwaritraders.com','+91 88001 11023','Retail','Lucknow',['Performance Marketing (Meta + Google)'],78000,'Payment Verified','Ravi Nambiar','AMP-CRM-023','inv-cml-023','2026-07-05','2026-07-07'),
  mockLeadTemplate('cml-024','Sunita','Bansal','Bansal Healthcare','sunita@bansalhealthcare.com','+91 88001 11024','Healthcare','Delhi',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],124000,'Client Created','Kavitha Reddy','AMP-CRM-024','inv-cml-024','2026-07-06','2026-07-08'),
  mockLeadTemplate('cml-025','Ramesh','Gupta','Gupta Motors','ramesh@guptamotors.com','+91 88001 11025','Automotive','Indore',['Social Media Management','Instagram Marketing'],88000,'Payment Pending','Anjali Gupta','AMP-CRM-025','inv-cml-025','2026-07-07','2026-07-09'),
  mockLeadTemplate('cml-026','Meena','Srivastava','Srivastava Textiles','meena@srivastavatextiles.com','+91 88001 11026','Textile','Surat',['Instagram Marketing','Creative Design & Branding'],112000,'Credentials Sent','Ravi Nambiar','AMP-CRM-026','inv-cml-026','2026-07-08','2026-07-10'),
  mockLeadTemplate('cml-027','Ashok','Naik','Naik Shipping','ashok@naikshipping.com','+91 88001 11027','Logistics','Mumbai',['LinkedIn B2B Marketing'],65000,'Invoice Sent','Kavitha Reddy','AMP-CRM-027','inv-cml-027','2026-07-09','2026-07-11'),
  mockLeadTemplate('cml-028','Varsha','Kulkarni','Kulkarni Resorts','varsha@kulkarniresorts.com','+91 88001 11028','Hospitality','Lonavala',['Instagram Marketing','Video Production & YouTube','Social Media Management'],178000,'Approved','Anjali Gupta','AMP-CRM-028','inv-cml-028','2026-07-10'),
  mockLeadTemplate('cml-029','Satish','Pandey','Pandey IT Solutions','satish@pandeyit.com','+91 88001 11029','IT','Noida',['Search Engine Optimization (SEO)','LinkedIn B2B Marketing'],145000,'Pending Review','Ravi Nambiar','AMP-CRM-029','inv-cml-029','2026-07-11'),
  mockLeadTemplate('cml-030','Harini','Bhatt','Bhatt Organics','harini@bhattorganics.com','+91 88001 11030','Agriculture','Nashik',['Instagram Marketing','Influencer Marketing Management'],93000,'Pending Review','Kavitha Reddy','AMP-CRM-030','inv-cml-030','2026-07-12'),
];

// ─── COMBINED EXPORT ──────────────────────────────────────────────────────────
export const allCrmLeads: CrmLead[] = [...crmLeadsFromSales, ...crmAdditionalLeads];

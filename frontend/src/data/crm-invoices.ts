import { CrmInvoice } from '@/types/crm';

// ─────────────────────────────────────────────────────────────────────────────
// AMPLIVO CRM — Invoices Mock Data (50 invoices)
// BACKEND NOTE: Replace with GET /api/crm/invoices
// ─────────────────────────────────────────────────────────────────────────────

const mkInvoice = (
  id: string, num: string, leadId: string, clientName: string, email: string, phone: string,
  company: string, issue: string, due: string, services: string[], budget: number,
  crmStatus: CrmInvoice['crmStatus'], sentAt?: string, paidAt?: string, clientId?: string
): CrmInvoice => {
  const tax = Math.round(budget * 0.18);
  const grand = budget + tax;
  const advance = Math.round(grand * 0.25);
  return {
    id, invoiceNumber: num, leadId,
    clientName, clientEmail: email, clientPhone: phone, company,
    issueDate: issue, dueDate: due,
    lineItems: services.map((s, i) => ({
      serviceId: `svc-${i + 1}`,
      serviceName: s, description: `${s} - 3 month retainer`,
      quantity: 3, unitPrice: Math.round(budget / services.length / 3),
      total: Math.round(budget / services.length),
    })),
    subtotal: budget, taxRate: 18, taxAmount: tax,
    grandTotal: grand, advancePercent: 25, advanceDue: advance,
    status: crmStatus === 'Advance Paid' || crmStatus === 'Fully Paid' ? crmStatus : 'Sent',
    notes: 'Payment within 7 days of invoice. GST applicable.',
    crmStatus, sentAt, paidAt,
    reminderSent: crmStatus === 'Overdue',
    reminderCount: crmStatus === 'Overdue' ? 2 : 0,
    clientId,
    verifiedBy: paidAt ? 'Anjali Gupta' : undefined,
    viewedAt: sentAt ? new Date(new Date(sentAt).getTime() + 2 * 60 * 60 * 1000).toISOString() : undefined,
  };
};

export const crmInvoices: CrmInvoice[] = [
  mkInvoice('inv-cml-001','AMP-CRM-001','cml-001','Rajiv Bhatia','rajiv@bhatiapharma.com','+91 88001 11001','Bhatia Pharmaceuticals','2026-05-12','2026-05-19',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],175000,'Advance Paid','2026-05-12','2026-05-15','CLT-001'),
  mkInvoice('inv-cml-002','AMP-CRM-002','cml-002','Seema Malhotra','seema@malhotrajewellers.com','+91 88001 11002','Malhotra Jewellers','2026-05-14','2026-05-21',['Social Media Management','Instagram Marketing'],120000,'Fully Paid','2026-05-14','2026-05-20','CLT-002'),
  mkInvoice('inv-cml-003','AMP-CRM-003','cml-003','Amit Singh','amit@singhbuilders.com','+91 88001 11003','Singh Builders','2026-05-17','2026-05-24',['Performance Marketing (Meta + Google)','Landing Page Design'],220000,'Advance Paid','2026-05-17','2026-05-22','CLT-003'),
  mkInvoice('inv-cml-004','AMP-CRM-004','cml-004','Nisha Patel','nisha@patelexports.com','+91 88001 11004','Patel Exports','2026-05-20','2026-05-27',['LinkedIn B2B Marketing','Content Marketing & Blogging'],95000,'Advance Paid','2026-05-20','2026-05-24','CLT-013'),
  mkInvoice('inv-cml-005','AMP-CRM-005','cml-005','Suresh Iyer','suresh@iyerfoods.com','+91 88001 11005','Iyer Foods','2026-05-22','2026-05-29',['Instagram Marketing','Video Production & YouTube'],145000,'Payment Pending','2026-05-22',undefined,'CLT-017'),
  mkInvoice('inv-cml-006','AMP-CRM-006','cml-006','Kavya Nair','kavya@nairclinics.com','+91 88001 11006','Nair Clinics','2026-05-24','2026-05-31',['Search Engine Optimization (SEO)','Google Ads Management'],110000,'Advance Paid','2026-05-24','2026-05-28','CLT-019'),
  mkInvoice('inv-cml-007','AMP-CRM-007','cml-007','Rahul Chandra','rahul@chandralogistics.com','+91 88001 11007','Chandra Logistics','2026-05-27','2026-06-03',['LinkedIn B2B Marketing','Email Marketing & Automation'],87000,'Advance Paid','2026-05-27','2026-06-01','CLT-022'),
  mkInvoice('inv-cml-008','AMP-CRM-008','cml-008','Anita Verma','anita@vermatechnologies.com','+91 88001 11008','Verma Technologies','2026-05-28','2026-06-04',['Search Engine Optimization (SEO)','Performance Marketing (Meta + Google)'],195000,'Sent','2026-05-28',undefined),
  mkInvoice('inv-cml-009','AMP-CRM-009','cml-009','Pradeep Kumar','pradeep@kumarhotels.com','+91 88001 11009','Kumar Hotels','2026-06-01','2026-06-08',['Social Media Management','Video Production & YouTube','Instagram Marketing'],165000,'Sent','2026-06-01',undefined),
  mkInvoice('inv-cml-010','AMP-CRM-010','cml-010','Lakshmi Prasad','lakshmi@prasadedu.com','+91 88001 11010','Prasad Educations','2026-06-03','2026-06-10',['Google Ads Management','Content Marketing & Blogging'],98000,'Sent','2026-06-03',undefined),
  mkInvoice('inv-cml-011','AMP-CRM-011','cml-011','Vijay Reddy','vijay@reddymotors.com','+91 88001 11011','Reddy Motors','2026-06-07','2026-06-14',['Performance Marketing (Meta + Google)','Social Media Management'],187000,'Advance Paid','2026-06-07','2026-06-11','CLT-004'),
  mkInvoice('inv-cml-012','AMP-CRM-012','cml-012','Shweta Agarwal','shweta@agarwalfashion.com','+91 88001 11012','Agarwal Fashion','2026-06-10','2026-06-17',['Instagram Marketing','Influencer Marketing Management'],135000,'Fully Paid','2026-06-10','2026-06-15','CLT-005'),
  mkInvoice('inv-cml-013','AMP-CRM-013','cml-013','Mohan Krishnan','mohan@krishnanconsult.com','+91 88001 11013','Krishnan Consulting','2026-06-12','2026-06-19',['LinkedIn B2B Marketing','Content Marketing & Blogging'],88000,'Advance Paid','2026-06-12','2026-06-16','CLT-011'),
  mkInvoice('inv-cml-014','AMP-CRM-014','cml-014','Ritu Chopra','ritu@choprarealty.com','+91 88001 11014','Chopra Real Estate','2026-06-14','2026-06-21',['Performance Marketing (Meta + Google)','Landing Page Design'],210000,'Advance Paid','2026-06-14','2026-06-18','CLT-006'),
  mkInvoice('inv-cml-015','AMP-CRM-015','cml-015','Nikhil Shah','nikhil@shahpharma.com','+91 88001 11015','Shah Pharmaceuticals','2026-06-17','2026-06-24',['Search Engine Optimization (SEO)','Email Marketing & Automation'],142000,'Fully Paid','2026-06-17','2026-06-22','CLT-007'),
  mkInvoice('inv-cml-016','AMP-CRM-016','cml-016','Pooja Mehta','pooja@mehtaelectronics.com','+91 88001 11016','Mehta Electronics','2026-06-20','2026-06-27',['Google Ads Management','Social Media Management'],118000,'Payment Pending','2026-06-20',undefined,'CLT-020'),
  mkInvoice('inv-cml-017','AMP-CRM-017','cml-017','Arun Pillai','arun@pillaiconst.com','+91 88001 11017','Pillai Constructions','2026-06-22','2026-06-29',['Performance Marketing (Meta + Google)','Creative Design & Branding'],175000,'Advance Paid','2026-06-22','2026-06-26','CLT-014'),
  mkInvoice('inv-cml-018','AMP-CRM-018','cml-018','Divya Kapoor','divya@kapoorlaw.com','+91 88001 11018','Kapoor Law Firm','2026-06-24','2026-07-01',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],92000,'Sent','2026-06-24',undefined,'CLT-025'),
  mkInvoice('inv-cml-019','AMP-CRM-019','cml-019','Rajan Shetty','rajan@shettyfoods.com','+91 88001 11019','Shetty Foods','2026-06-25','2026-07-02',['Instagram Marketing','Influencer Marketing Management'],128000,'Advance Paid','2026-06-25','2026-06-29','CLT-018'),
  mkInvoice('inv-cml-020','AMP-CRM-020','cml-020','Sonal Desai','sonal@desaiarch.com','+91 88001 11020','Desai Architects','2026-06-28','2026-07-05',['LinkedIn B2B Marketing','Website Design & Development'],155000,'Advance Paid','2026-06-28','2026-07-02','CLT-028'),
  mkInvoice('inv-cml-021','AMP-CRM-021','cml-021','Girish Kulkarni','girish@kulkarnidairy.com','+91 88001 11021','Kulkarni Dairy','2026-07-03','2026-07-10',['Social Media Management','Video Production & YouTube'],98000,'Advance Paid','2026-07-03','2026-07-07','CLT-008'),
  mkInvoice('inv-cml-022','AMP-CRM-022','cml-022','Priyanka Joshi','priyanka@joshiinsurance.com','+91 88001 11022','Joshi Insurance','2026-07-05','2026-07-12',['Google Ads Management','Email Marketing & Automation'],108000,'Fully Paid','2026-07-05','2026-07-09','CLT-009'),
  mkInvoice('inv-cml-023','AMP-CRM-023','cml-023','Sanjeev Tiwari','sanjeev@tiwaritraders.com','+91 88001 11023','Tiwari Traders','2026-07-07','2026-07-14',['Performance Marketing (Meta + Google)'],78000,'Advance Paid','2026-07-07','2026-07-11','CLT-012'),
  mkInvoice('inv-cml-024','AMP-CRM-024','cml-024','Sunita Bansal','sunita@bansalhealthcare.com','+91 88001 11024','Bansal Healthcare','2026-07-08','2026-07-15',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],124000,'Advance Paid','2026-07-08','2026-07-12','CLT-010'),
  mkInvoice('inv-cml-025','AMP-CRM-025','cml-025','Ramesh Gupta','ramesh@guptamotors.com','+91 88001 11025','Gupta Motors','2026-07-09','2026-07-16',['Social Media Management','Instagram Marketing'],88000,'Payment Pending','2026-07-09',undefined,'CLT-016'),
  mkInvoice('inv-cml-026','AMP-CRM-026','cml-026','Meena Srivastava','meena@srivastavatextiles.com','+91 88001 11026','Srivastava Textiles','2026-07-10','2026-07-17',['Instagram Marketing','Creative Design & Branding'],112000,'Advance Paid','2026-07-10','2026-07-14','CLT-015'),
  mkInvoice('inv-cml-027','AMP-CRM-027','cml-027','Ashok Naik','ashok@naikshipping.com','+91 88001 11027','Naik Shipping','2026-07-11','2026-07-18',['LinkedIn B2B Marketing'],65000,'Fully Paid','2026-07-11','2026-07-14','CLT-023'),
  mkInvoice('inv-cml-028','AMP-CRM-028','cml-028','Varsha Kulkarni','varsha@kulkarniresorts.com','+91 88001 11028','Kulkarni Resorts','2026-07-10','2026-07-17',['Instagram Marketing','Video Production & YouTube','Social Media Management'],178000,'Advance Paid','2026-07-10','2026-07-14','CLT-021'),
  mkInvoice('inv-cml-029','AMP-CRM-029','cml-029','Satish Pandey','satish@pandeyit.com','+91 88001 11029','Pandey IT Solutions','2026-07-11','2026-07-18',['Search Engine Optimization (SEO)','LinkedIn B2B Marketing'],145000,'Advance Paid','2026-07-11','2026-07-15','CLT-026'),
  mkInvoice('inv-cml-030','AMP-CRM-030','cml-030','Harini Bhatt','harini@bhattorganics.com','+91 88001 11030','Bhatt Organics','2026-07-12','2026-07-19',['Instagram Marketing','Influencer Marketing Management'],93000,'Advance Paid','2026-07-12','2026-07-16','CLT-027'),
  // Additional historical invoices
  mkInvoice('inv-sl-07','AMP-CRM-031','sl-07','Arjun Bose','arjun@boseauto.com','+91 77001 22001','Bose Automobiles','2026-03-28','2026-04-04',['Performance Marketing (Meta + Google)','Social Media Management'],165000,'Fully Paid','2026-03-28','2026-04-01','CLT-029'),
  mkInvoice('inv-sl-08','AMP-CRM-032','sl-08','Ritika Sharma','ritika@sharmaholidays.com','+91 77001 22002','Sharma Holidays','2026-04-12','2026-04-19',['Instagram Marketing','Google Ads Management','Influencer Marketing Management'],204000,'Advance Paid','2026-04-12','2026-04-16','CLT-030'),
  mkInvoice('inv-sl-09','AMP-CRM-033','sl-09','Gaurav Mehta','gaurav@mehtaedu.com','+91 77001 22003','Mehta Education','2026-02-25','2026-03-04',['Google Ads Management','Content Marketing & Blogging'],102000,'Fully Paid','2026-02-25','2026-03-01','CLT-031'),
  mkInvoice('inv-sl-10','AMP-CRM-034','sl-10','Priya Reddy','priya@reddyfarms.com','+91 77001 22004','Reddy Farms','2026-03-12','2026-03-19',['Instagram Marketing','Creative Design & Branding'],84000,'Fully Paid','2026-03-12','2026-03-16','CLT-032'),
  mkInvoice('inv-sl-11','AMP-CRM-035','sl-11','Sunil Jain','sunil@jainsteel.com','+91 77001 22005','Jain Steel Industries','2026-01-28','2026-02-04',['LinkedIn B2B Marketing','Website Design & Development'],156000,'Fully Paid','2026-01-28','2026-02-02','CLT-033'),
  mkInvoice('inv-sl-12','AMP-CRM-036','sl-12','Deepa Venkatesh','deepa@venkateshkitchens.com','+91 77001 22006','Venkatesh Kitchens','2026-01-12','2026-01-19',['Instagram Marketing','Video Production & YouTube','Influencer Marketing Management'],186000,'Fully Paid','2026-01-12','2026-01-16','CLT-034'),
  mkInvoice('inv-sl-13','AMP-CRM-037','sl-13','Karthik Subramanian','karthik@subramaniancpa.com','+91 77001 22007','Subramanian & Associates CPA','2026-02-12','2026-02-19',['LinkedIn B2B Marketing','Content Marketing & Blogging'],90000,'Advance Paid','2026-02-12','2026-02-16','CLT-035'),
  mkInvoice('inv-sl-14','AMP-CRM-038','sl-14','Ananya Krishnamurthy','ananya@krishnamurthyspa.com','+91 77001 22008','Krishnamurthy Spa & Wellness','2026-02-26','2026-03-05',['Instagram Marketing','Google Ads Management'],96000,'Fully Paid','2026-02-26','2026-03-01','CLT-036'),
  mkInvoice('inv-sl-15','AMP-CRM-039','sl-15','Vinod Kapoor','vinod@kapoorelectrical.com','+91 77001 22009','Kapoor Electrical','2025-12-28','2026-01-04',['Website Design & Development','Search Engine Optimization (SEO)'],132000,'Fully Paid','2025-12-28','2026-01-02','CLT-037'),
  mkInvoice('inv-sl-16','AMP-CRM-040','sl-16','Sapna Taneja','sapna@tanejabeauty.com','+91 77001 22010','Taneja Beauty Studio','2025-12-28','2026-01-04',['Instagram Marketing','Creative Design & Branding'],66000,'Fully Paid','2025-12-28','2026-01-01','CLT-038'),
  mkInvoice('inv-sl-17','AMP-CRM-041','sl-17','Rakesh Banerjee','rakesh@banerjeehotel.com','+91 77001 22011','Banerjee Heritage Hotel','2026-01-28','2026-02-04',['Social Media Management','Video Production & YouTube','Google Ads Management'],195000,'Advance Paid','2026-01-28','2026-02-01','CLT-039'),
  mkInvoice('inv-sl-18','AMP-CRM-042','sl-18','Nalini Rao','nalini@raolaw.com','+91 77001 22012','Rao Law Associates','2025-11-28','2025-12-05',['Search Engine Optimization (SEO)'],54000,'Fully Paid','2025-11-28','2025-12-02','CLT-040'),
  mkInvoice('inv-sl-19','AMP-CRM-043','sl-19','Krishnaswamy Pillai','krishna@pillaiagency.com','+91 77001 22013','Pillai Ad Agency','2026-03-28','2026-04-04',['LinkedIn B2B Marketing','Content Marketing & Blogging','Email Marketing & Automation'],165000,'Fully Paid','2026-03-28','2026-04-01','CLT-041'),
  mkInvoice('inv-sl-20','AMP-CRM-044','sl-20','Sundar Rajan','sundar@rajanfurniture.com','+91 77001 22014','Rajan Furniture','2026-04-28','2026-05-05',['Instagram Marketing','Creative Design & Branding','Video Production & YouTube'],174000,'Advance Paid','2026-04-28','2026-05-02','CLT-042'),
  mkInvoice('inv-sl-21','AMP-CRM-045','sl-21','Bhavana Nair','bhavana@nairschools.com','+91 77001 22015','Nair Schools','2026-05-28','2026-06-04',['Google Ads Management','Social Media Management','Content Marketing & Blogging'],156000,'Fully Paid','2026-05-28','2026-06-01','CLT-043'),
  mkInvoice('inv-sl-22','AMP-CRM-046','sl-22','Mahesh Shetty','mahesh@shettymachinery.com','+91 77001 22016','Shetty Machinery','2026-07-15','2026-07-22',['Website Design & Development','LinkedIn B2B Marketing'],138000,'Advance Paid','2026-07-15','2026-07-19','CLT-044'),
  mkInvoice('inv-sl-23','AMP-CRM-047','sl-23','Tara Verma','tara@taraornamentals.com','+91 77001 22017','Tara Ornamentals','2026-07-17','2026-07-24',['Instagram Marketing','WhatsApp Marketing Automation'],75000,'Advance Paid','2026-07-17','2026-07-20','CLT-045'),
  mkInvoice('inv-overdue-01','AMP-CRM-048','od-01','Arvind Kulkarni','arvind@kulkarnigroup.com','+91 99001 44001','Kulkarni Group','2026-06-01','2026-06-08',['Performance Marketing (Meta + Google)'],145000,'Overdue','2026-06-01',undefined),
  mkInvoice('inv-overdue-02','AMP-CRM-049','od-02','Preethi Rajan','preethi@rajanfoods.com','+91 99001 44002','Rajan Foods','2026-06-10','2026-06-17',['Instagram Marketing','Social Media Management'],78000,'Overdue','2026-06-10',undefined),
  mkInvoice('inv-viewed-01','AMP-CRM-050','vw-01','Subroto Das','subroto@dastech.com','+91 99001 44003','Das Technologies','2026-07-18','2026-07-25',['Search Engine Optimization (SEO)','Content Marketing & Blogging'],112000,'Viewed','2026-07-18',undefined),
];

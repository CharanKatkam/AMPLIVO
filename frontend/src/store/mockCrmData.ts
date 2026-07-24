import { CrmLead, CrmClient, CrmProject, CrmEmployee, CrmTask } from '@/types/crm';

export const MOCK_EMPLOYEES: CrmEmployee[] = [
  { id: 'EMP-001', firstName: 'Alex', lastName: 'Strategist', email: 'digital.marketing.strategist@amplivo.employee', designation: 'Digital Marketing Strategist', department: 'Marketing', skills: ['Strategy', 'Analytics', 'Growth'], currentProjectIds: ['PRJ-001'], workloadPercent: 70, availability: 'Available', joinDate: '2023-01-15', avatar: 'https://i.pravatar.cc/150?u=emp1' },
  { id: 'EMP-002', firstName: 'Sam', lastName: 'Seo', email: 'seo.specialist@amplivo.employee', designation: 'SEO Specialist', department: 'Marketing', skills: ['SEO', 'Ahrefs', 'Content'], currentProjectIds: [], workloadPercent: 60, availability: 'Available', joinDate: '2023-02-10', avatar: 'https://i.pravatar.cc/150?u=emp2' },
  { id: 'EMP-003', firstName: 'Pat', lastName: 'Marketer', email: 'performance.marketer@amplivo.employee', designation: 'Performance Marketer', department: 'Marketing', skills: ['Ads', 'PPC', 'Analytics'], currentProjectIds: [], workloadPercent: 80, availability: 'Busy', joinDate: '2022-11-05', avatar: 'https://i.pravatar.cc/150?u=emp3' },
  { id: 'EMP-004', firstName: 'Jordan', lastName: 'Social', email: 'social.media.manager@amplivo.employee', designation: 'Social Media Manager', department: 'Marketing', skills: ['Social', 'Community', 'Copywriting'], currentProjectIds: [], workloadPercent: 50, availability: 'Available', joinDate: '2023-03-20', avatar: 'https://i.pravatar.cc/150?u=emp4' },
  { id: 'EMP-005', firstName: 'Casey', lastName: 'Writer', email: 'content.writer@amplivo.employee', designation: 'Content Writer', department: 'Content', skills: ['Writing', 'Editing', 'SEO'], currentProjectIds: [], workloadPercent: 40, availability: 'Available', joinDate: '2023-04-12', avatar: 'https://i.pravatar.cc/150?u=emp5' },
  { id: 'EMP-006', firstName: 'Riley', lastName: 'Designer', email: 'graphic.designer@amplivo.employee', designation: 'Graphic Designer', department: 'Design', skills: ['Illustrator', 'Photoshop', 'Branding'], currentProjectIds: [], workloadPercent: 90, availability: 'At Capacity', joinDate: '2022-09-01', avatar: 'https://i.pravatar.cc/150?u=emp6' },
  { id: 'EMP-007', firstName: 'Taylor', lastName: 'Video', email: 'video.editor@amplivo.employee', designation: 'Video Editor', department: 'Design', skills: ['Premiere', 'After Effects', 'Animation'], currentProjectIds: [], workloadPercent: 65, availability: 'Available', joinDate: '2023-05-18', avatar: 'https://i.pravatar.cc/150?u=emp7' },
  { id: 'EMP-008', firstName: 'Morgan', lastName: 'Uiux', email: 'ui.ux.designer@amplivo.employee', designation: 'UI/UX Designer', department: 'Design', skills: ['Figma', 'Prototyping', 'User Research'], currentProjectIds: [], workloadPercent: 55, availability: 'Available', joinDate: '2023-06-22', avatar: 'https://i.pravatar.cc/150?u=emp8' },
  { id: 'EMP-009', firstName: 'Drew', lastName: 'Developer', email: 'web.developer@amplivo.employee', designation: 'Web Developer', department: 'Engineering', skills: ['React', 'Next.js', 'Tailwind CSS'], currentProjectIds: [], workloadPercent: 75, availability: 'Available', joinDate: '2022-01-15', avatar: 'https://i.pravatar.cc/150?u=emp9' },
  { id: 'EMP-010', firstName: 'Jamie', lastName: 'Analyst', email: 'data.analyst@amplivo.employee', designation: 'Data Analyst', department: 'Analytics', skills: ['SQL', 'Python', 'Tableau'], currentProjectIds: [], workloadPercent: 45, availability: 'Available', joinDate: '2023-07-30', avatar: 'https://i.pravatar.cc/150?u=emp10' },
  { id: 'EMP-011', firstName: 'Quinn', lastName: 'Campaign', email: 'campaign.manager@amplivo.employee', designation: 'Campaign Manager', department: 'Marketing', skills: ['Management', 'Strategy', 'Coordination'], currentProjectIds: [], workloadPercent: 85, availability: 'Busy', joinDate: '2022-08-11', avatar: 'https://i.pravatar.cc/150?u=emp11' },
  { id: 'EMP-012', firstName: 'Avery', lastName: 'Account', email: 'account.manager@amplivo.employee', designation: 'Account Manager', department: 'Client Services', skills: ['Communication', 'CRM', 'Sales'], currentProjectIds: [], workloadPercent: 60, availability: 'Available', joinDate: '2023-01-05', avatar: 'https://i.pravatar.cc/150?u=emp12' },
  { id: 'EMP-013', firstName: 'Skyler', lastName: 'Influencer', email: 'influencer.manager@amplivo.employee', designation: 'Influencer Manager', department: 'Marketing', skills: ['Networking', 'Negotiation', 'Social'], currentProjectIds: [], workloadPercent: 50, availability: 'Available', joinDate: '2023-02-28', avatar: 'https://i.pravatar.cc/150?u=emp13' },
  { id: 'EMP-014', firstName: 'Reese', lastName: 'Sales', email: 'sales.executive@amplivo.employee', designation: 'Sales Executive', department: 'Sales', skills: ['B2B', 'Pitching', 'Closing'], currentProjectIds: [], workloadPercent: 70, availability: 'Available', joinDate: '2022-10-14', avatar: 'https://i.pravatar.cc/150?u=emp14' },
  { id: 'EMP-015', firstName: 'Blake', lastName: 'Success', email: 'client.success.manager@amplivo.employee', designation: 'Client Success Manager', department: 'Client Services', skills: ['Retention', 'Support', 'Onboarding'], currentProjectIds: [], workloadPercent: 65, availability: 'Available', joinDate: '2023-03-10', avatar: 'https://i.pravatar.cc/150?u=emp15' },
];

export const MOCK_PROJECTS: CrmProject[] = [
  {
    id: 'PRJ-001',
    clientId: 'CLT-001',
    clientName: 'John Doe',
    company: 'Acme Corp',
    name: 'Website Redesign',
    services: ['Web Development'],
    description: '',
    priority: 'Medium',
    status: 'In Progress',
    startDate: '2023-10-01',
    endDate: '2024-01-15',
    durationMonths: 3,
    progress: 45,
    assignedEmployeeIds: ['EMP-001'],
    crmExec: 'admin',
    budgetINR: 0,
    notes: '',
    createdAt: new Date().toISOString(),
    milestones: [
      { id: 'M-1', title: 'Design Handoff', dueDate: '2023-11-01', completed: true },
      { id: 'M-2', title: 'Frontend Development', dueDate: '2023-12-15', completed: false },
    ],
    lastUpdated: new Date().toISOString(),
  }
];

export const MOCK_TASKS: CrmTask[] = [
  {
    id: 'TASK-001',
    projectId: 'PRJ-001',
    projectName: 'Website Redesign',
    clientId: 'CLT-001',
    service: 'Web Development',
    assignedEmployeeId: 'EMP-001',
    assignedRole: 'Web Developer',
    title: 'Implement Homepage UI',
    description: 'Build the homepage according to Figma design',
    status: 'IN_PROGRESS',
    priority: 'High',
    dueDate: '2023-12-05',
    progress: 50,
    comments: [],
    workingFiles: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
  }
];

export const MOCK_CLIENTS: CrmClient[] = [
  {
    id: 'CLT-001',
    leadId: 'LEAD-001',
    invoiceId: 'INV-001',
    clientId: 'AMP-CLT-0001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '123-456-7890',
    designation: 'CEO',
    company: 'Acme Corp',
    industry: 'Technology',
    companySize: '50-100',
    website: 'https://acme.com',
    city: 'Mumbai',
    services: ['Web Development'],
    monthlyRetainer: 2000,
    totalContractValue: 12000,
    assignedCrmExec: 'admin',
    assignedEmployees: ['EMP-001'],
    status: 'Active',
    paymentStatus: 'Advance Paid',
    startDate: '2023-10-01',
    renewalDate: '2024-10-01',
    createdAt: '2023-09-15',
    credentials: { clientId: 'CLT-001', username: 'john@example.com', tempPassword: '', expiryDate: '', emailSent: false, generatedAt: '' },
    notes: '',
    lastUpdated: new Date().toISOString(),
  }
];

export const MOCK_LEADS: CrmLead[] = [];

import { Campaign, Lead, Creative, Invoice, TeamMemberERP, Influencer, Task, Client } from '@/types';

// ─── CAMPAIGN DATA ────────────────────────────────────────────────────────────
export const campaigns: Campaign[] = [
  {
    id: '1', name: 'Q3 Google Ads – Prestige Estates', client: 'Prestige Estates', channel: 'Paid Ads',
    status: 'Active', budget: '₹2,40,000', spend: '₹1,87,450', roi: '342%', leads: 312,
    startDate: '2024-07-01', endDate: '2024-09-30', assignedTo: 'Vikram M.',
  },
  {
    id: '2', name: 'SEO Authority – EduPath', client: 'EduPath Academy', channel: 'SEO',
    status: 'Active', budget: '₹80,000', spend: '₹72,000', roi: '280%', leads: 0,
    startDate: '2024-04-01', endDate: '2024-09-30', assignedTo: 'Divya K.',
  },
  {
    id: '3', name: 'LinkedIn B2B – TechNova', client: 'TechNova Solutions', channel: 'Social',
    status: 'Paused', budget: '₹60,000', spend: '₹45,200', roi: '198%', leads: 84,
    startDate: '2024-06-01', endDate: '2024-08-31', assignedTo: 'Priya S.',
  },
  {
    id: '4', name: 'Email Nurture – HealthPlus', client: 'HealthPlus Clinics', channel: 'Email',
    status: 'Active', budget: '₹30,000', spend: '₹28,400', roi: '410%', leads: 240,
    startDate: '2024-07-01', endDate: '2024-12-31', assignedTo: 'Arjun R.',
  },
  {
    id: '5', name: 'Instagram Brand – NutriBlend', client: 'NutriBlend D2C', channel: 'Social',
    status: 'Active', budget: '₹50,000', spend: '₹48,200', roi: '320%', leads: 0,
    startDate: '2024-05-01', endDate: '2024-10-31', assignedTo: 'Riya A.',
  },
  {
    id: '6', name: 'Meta Shopping – FashionFirst', client: 'FashionFirst Retail', channel: 'Paid Ads',
    status: 'Active', budget: '₹1,20,000', spend: '₹1,08,600', roi: '520%', leads: 0,
    startDate: '2024-06-15', endDate: '2024-08-15', assignedTo: 'Vikram M.',
  },
  {
    id: '7', name: 'YouTube Ads – AutoDrive', client: 'AutoDrive Motors', channel: 'Video',
    status: 'Draft', budget: '₹75,000', spend: '—', roi: '—', leads: 0,
    startDate: '2024-08-01', endDate: '2024-10-31', assignedTo: 'Aditya K.',
  },
];

// ─── CLIENTS DATA ──────────────────────────────────────────────────────────────
export const clients: Client[] = [
  {
    id: '1', name: 'Prestige Estates', contactPerson: 'Vikram Malhotra',
    email: 'vikram@prestige.in', industry: 'Real Estate',
    services: ['Performance Marketing', 'Creative Design'], status: 'Active', mrr: '₹2,40,000',
  },
  {
    id: '2', name: 'EduPath Academy', contactPerson: 'Anita Sharma',
    email: 'anita@edupath.in', industry: 'Education',
    services: ['SEO', 'Content Marketing'], status: 'Active', mrr: '₹80,000',
  },
  {
    id: '3', name: 'FashionFirst Retail', contactPerson: 'Rajesh Kumar',
    email: 'rajesh@fashionfirst.in', industry: 'E-Commerce',
    services: ['Meta Ads', 'Creative Design', 'Social Media'], status: 'Active', mrr: '₹1,20,000',
  },
  {
    id: '4', name: 'TechNova Solutions', contactPerson: 'Suresh Patel',
    email: 'suresh@technova.in', industry: 'Startups & IT',
    services: ['LinkedIn Marketing', 'Email Automation'], status: 'At Risk', mrr: '₹60,000',
  },
  {
    id: '5', name: 'HealthPlus Clinics', contactPerson: 'Meena Nair',
    email: 'meena@healthplus.in', industry: 'Healthcare',
    services: ['Local SEO', 'Google Business Profile'], status: 'Active', mrr: '₹1,60,000',
  },
  {
    id: '6', name: 'NutriBlend D2C', contactPerson: 'Kiran Reddy',
    email: 'kiran@nutriblend.in', industry: 'E-Commerce',
    services: ['Instagram Marketing', 'Influencer Management'], status: 'Active', mrr: '₹50,000',
  },
  {
    id: '7', name: 'GreenBuild Infra', contactPerson: 'Mohan Verma',
    email: 'mohan@greenbuild.in', industry: 'Real Estate',
    services: ['SEO', 'Google Ads'], status: 'Active', mrr: '₹1,10,000',
  },
  {
    id: '8', name: 'StyleCo Fashion', contactPerson: 'Deepika Bose',
    email: 'deepika@styleco.in', industry: 'E-Commerce',
    services: ['Social Media Marketing', 'Branding'], status: 'Active', mrr: '₹90,000',
  },
];

// ─── LEADS DATA ───────────────────────────────────────────────────────────────
export const leads: Lead[] = [
  {
    id: '1', name: 'Rajesh Kumar', company: 'TechnoSoft Pvt Ltd', phone: '+91 98765 43210',
    email: 'rajesh@technosoft.in', campaign: 'SEO Authority Boost', source: 'Organic',
    status: 'Hot', assignedTo: 'Priya S.', followUpDate: '2024-07-25',
    notes: 'Interested in full-stack SEO + content package. Decision this week.', value: '₹1,20,000',
  },
  {
    id: '2', name: 'Anita Sharma', company: 'FashionFirst Retail', phone: '+91 87654 32109',
    email: 'anita@fashionfirst.in', campaign: 'Q3 Google Ads', source: 'Paid Ads',
    status: 'Warm', assignedTo: 'Vikram M.', followUpDate: '2024-07-28',
    notes: 'Evaluating performance marketing package. Needs case studies.', value: '₹2,40,000',
  },
  {
    id: '3', name: 'Suresh Patel', company: 'GreenBuild Infra', phone: '+91 76543 21098',
    email: 'suresh@greenbuild.in', campaign: 'LinkedIn B2B', source: 'Social',
    status: 'Cold', assignedTo: 'Divya K.', followUpDate: '2024-08-05',
    notes: 'Early stage, exploring options for brand identity + social.', value: '₹80,000',
  },
  {
    id: '4', name: 'Meena Nair', company: 'HealthPlus Clinics', phone: '+91 65432 10987',
    email: 'meena@healthplus.in', campaign: 'Email Nurture', source: 'Referral',
    status: 'Hot', assignedTo: 'Arjun R.', followUpDate: '2024-07-23',
    notes: 'All 8 clinic locations need local SEO + GMB management.', value: '₹1,60,000',
  },
  {
    id: '5', name: 'Kiran Reddy', company: 'LogiTrade Systems', phone: '+91 54321 09876',
    email: 'kiran@logitrade.in', campaign: 'Email Nurture', source: 'Email',
    status: 'Warm', assignedTo: 'Priya S.', followUpDate: '2024-07-30',
    notes: 'Looking for B2B content + marketing automation setup.', value: '₹3,20,000',
  },
  {
    id: '6', name: 'Deepika Bose', company: 'StyleCo Fashion', phone: '+91 43210 98765',
    email: 'deepika@styleco.in', campaign: 'Instagram Brand', source: 'Instagram',
    status: 'Converted', assignedTo: 'Riya A.', followUpDate: '2024-08-01',
    notes: 'Contract signed. Onboarding in progress.', value: '₹90,000',
  },
  {
    id: '7', name: 'Mohan Verma', company: 'SpeedAuto Hyderabad', phone: '+91 32109 87654',
    email: 'mohan@speedauto.in', campaign: 'Q3 Google Ads', source: 'Paid Ads',
    status: 'Hot', assignedTo: 'Vikram M.', followUpDate: '2024-07-24',
    notes: 'Urgent – new showroom launch in August. Full digital package.', value: '₹5,00,000',
  },
];

// ─── CREATIVES DATA ───────────────────────────────────────────────────────────
export const creatives: Creative[] = [
  {
    id: '1', title: 'Prestige Heights – Festival Offer Banner', caption: 'Book your dream home this festive season. Limited units available at Prestige Heights, Hyderabad.',
    campaign: 'Q3 Google Ads – Prestige Estates', type: 'Banner', status: 'Pending',
    uploadedDate: '2024-07-20', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', comments: 2, version: 1,
  },
  {
    id: '2', title: 'NutriBlend – Product Launch Reel', caption: 'Introducing NutriBlend Protein+. Taste the difference. #NutriBlend #HealthyLiving',
    campaign: 'Instagram Brand – NutriBlend', type: 'Reel', status: 'Approved',
    uploadedDate: '2024-07-18', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop', comments: 0, version: 2,
  },
  {
    id: '3', title: 'FashionFirst – Summer Collection Story', caption: 'Summer is here. Explore our exclusive collection. Swipe up to shop!',
    campaign: 'Meta Shopping – FashionFirst', type: 'Story', status: 'Revision',
    uploadedDate: '2024-07-19', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop', comments: 4, version: 3,
  },
  {
    id: '4', title: 'HealthPlus – Doctor Consultation Ad', caption: 'Expert care at your nearest HealthPlus clinic. Book your appointment today.',
    campaign: 'Email Nurture – HealthPlus', type: 'Banner', status: 'Approved',
    uploadedDate: '2024-07-17', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop', comments: 1, version: 1,
  },
  {
    id: '5', title: 'TechNova – LinkedIn Carousel Post', caption: '5 digital transformation mistakes that are costing your business lakhs every month.',
    campaign: 'LinkedIn B2B – TechNova', type: 'Social Post', status: 'Pending',
    uploadedDate: '2024-07-21', image: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop', comments: 0, version: 1,
  },
  {
    id: '6', title: 'EduPath – Course Launch Banner', caption: 'Crack your UPSC exam with EduPath\'s expert faculty. Enroll now – Batch starts August 1.',
    campaign: 'SEO Authority – EduPath', type: 'Banner', status: 'Rejected',
    uploadedDate: '2024-07-15', image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&h=300&fit=crop', comments: 3, version: 2,
  },
];

// ─── INVOICES DATA ────────────────────────────────────────────────────────────
export const invoices: Invoice[] = [
  {
    id: '1', number: 'AMP-2024-001', client: 'Prestige Estates', amount: '₹2,40,000',
    status: 'Paid', dueDate: '2024-07-15', issueDate: '2024-07-01',
    services: ['Performance Marketing', 'Creative Design'],
  },
  {
    id: '2', number: 'AMP-2024-002', client: 'EduPath Academy', amount: '₹80,000',
    status: 'Pending', dueDate: '2024-07-30', issueDate: '2024-07-10',
    services: ['SEO', 'Content Marketing'],
  },
  {
    id: '3', number: 'AMP-2024-003', client: 'FashionFirst Retail', amount: '₹1,20,000',
    status: 'Paid', dueDate: '2024-07-10', issueDate: '2024-06-25',
    services: ['Meta Ads', 'Creative Design', 'Social Media'],
  },
  {
    id: '4', number: 'AMP-2024-004', client: 'TechNova Solutions', amount: '₹60,000',
    status: 'Overdue', dueDate: '2024-07-05', issueDate: '2024-06-20',
    services: ['LinkedIn Marketing', 'Email Automation'],
  },
  {
    id: '5', number: 'AMP-2024-005', client: 'HealthPlus Clinics', amount: '₹1,60,000',
    status: 'Pending', dueDate: '2024-08-05', issueDate: '2024-07-20',
    services: ['Local SEO', 'Google Business Profile'],
  },
  {
    id: '6', number: 'AMP-2024-006', client: 'NutriBlend D2C', amount: '₹50,000',
    status: 'Draft', dueDate: '2024-08-10', issueDate: '2024-07-22',
    services: ['Instagram Marketing', 'Influencer Management'],
  },
];

// ─── TEAM DATA ────────────────────────────────────────────────────────────────
export const teamMembers: TeamMemberERP[] = [
  {
    id: '1', name: 'Vikram Malhotra', role: 'Performance Marketing Lead', department: 'Performance',
    email: 'vikram@amplivo.in', phone: '+91 98765 00001', utilization: 87, activeTasks: 12,
    status: 'Active', joinDate: '2022-03-15', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  },
  {
    id: '2', name: 'Divya Krishnamurti', role: 'SEO Specialist', department: 'SEO',
    email: 'divya@amplivo.in', phone: '+91 98765 00002', utilization: 74, activeTasks: 9,
    status: 'Active', joinDate: '2022-07-01', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  },
  {
    id: '3', name: 'Priya Subramaniam', role: 'Account Manager', department: 'Client Success',
    email: 'priya@amplivo.in', phone: '+91 98765 00003', utilization: 92, activeTasks: 18,
    status: 'Active', joinDate: '2021-11-20', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
  },
  {
    id: '4', name: 'Arjun Rathore', role: 'Social Media Manager', department: 'Social Media',
    email: 'arjun@amplivo.in', phone: '+91 98765 00004', utilization: 68, activeTasks: 14,
    status: 'Active', joinDate: '2023-01-10', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  },
  {
    id: '5', name: 'Riya Anand', role: 'Influencer Manager', department: 'Influencer',
    email: 'riya@amplivo.in', phone: '+91 98765 00005', utilization: 55, activeTasks: 7,
    status: 'On Leave', joinDate: '2023-04-05', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop',
  },
  {
    id: '6', name: 'Aditya Kumar', role: 'Video & Creative Lead', department: 'Creative',
    email: 'aditya@amplivo.in', phone: '+91 98765 00006', utilization: 80, activeTasks: 11,
    status: 'Active', joinDate: '2022-09-15', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop',
  },
  {
    id: '7', name: 'Sneha Patel', role: 'Content Writer', department: 'Content',
    email: 'sneha@amplivo.in', phone: '+91 98765 00007', utilization: 72, activeTasks: 8,
    status: 'Active', joinDate: '2023-06-01', image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=80&h=80&fit=crop',
  },
  {
    id: '8', name: 'Rohit Mehra', role: 'Web Developer', department: 'Technology',
    email: 'rohit@amplivo.in', phone: '+91 98765 00008', utilization: 90, activeTasks: 16,
    status: 'Active', joinDate: '2022-05-20', image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=80&h=80&fit=crop',
  },
];

// ─── INFLUENCER DATA ──────────────────────────────────────────────────────────
export const influencers: Influencer[] = [
  {
    id: '1', name: 'Ananya Kapoor', handle: '@ananyakapoor_', platform: 'Instagram',
    category: 'Fashion & Lifestyle', followers: '480K', engagementRate: '4.8%',
    status: 'Available', fee: '₹35,000', location: 'Mumbai', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop',
  },
  {
    id: '2', name: 'Rahul Foodie', handle: '@rahulfoodiehyderabad', platform: 'Instagram',
    category: 'Food & Travel', followers: '125K', engagementRate: '7.2%',
    status: 'In Campaign', fee: '₹12,000', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop',
  },
  {
    id: '3', name: 'TechTalk India', handle: '@techtalkindia', platform: 'YouTube',
    category: 'Technology', followers: '2.1M', engagementRate: '3.1%',
    status: 'Under Review', fee: '₹1,20,000', location: 'Bengaluru', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop',
  },
  {
    id: '4', name: 'Dr. Wellness', handle: '@drwellness_india', platform: 'Instagram',
    category: 'Health & Wellness', followers: '320K', engagementRate: '5.6%',
    status: 'Available', fee: '₹28,000', location: 'Chennai', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=80&h=80&fit=crop',
  },
  {
    id: '5', name: 'StartupSagas', handle: '@startupSagas', platform: 'LinkedIn',
    category: 'Business & Startups', followers: '85K', engagementRate: '6.8%',
    status: 'Available', fee: '₹18,000', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&h=80&fit=crop',
  },
  {
    id: '6', name: 'Fitness Freak Pooja', handle: '@fitnesswithpooja', platform: 'Instagram',
    category: 'Fitness & Health', followers: '215K', engagementRate: '8.1%',
    status: 'In Campaign', fee: '₹22,000', location: 'Pune', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
  },
];

// ─── TASKS DATA ───────────────────────────────────────────────────────────────
export const tasks: Task[] = [
  {
    id: '1', title: 'Create Q3 Ad Creatives for Prestige Estates', assignedTo: 'Aditya Kumar',
    department: 'Creative', campaign: 'Q3 Google Ads – Prestige Estates',
    priority: 'Critical', status: 'In Progress', dueDate: '2024-07-25',
    description: '10 banner ads in multiple sizes for Google Display. Festival theme with brand guidelines.',
  },
  {
    id: '2', title: 'Publish July Social Calendar – NutriBlend', assignedTo: 'Arjun Rathore',
    department: 'Social Media', campaign: 'Instagram Brand – NutriBlend',
    priority: 'High', status: 'Review', dueDate: '2024-07-22',
    description: '20 posts + 8 reels scheduled across Instagram and Facebook for July.',
  },
  {
    id: '3', title: 'Monthly SEO Report – EduPath', assignedTo: 'Divya Krishnamurti',
    department: 'SEO', campaign: 'SEO Authority – EduPath',
    priority: 'Medium', status: 'Todo', dueDate: '2024-07-31',
    description: 'Compile keyword rankings, traffic analysis, backlinks gained, and technical fixes.',
  },
  {
    id: '4', title: 'LinkedIn Content – TechNova (Week 3)', assignedTo: 'Sneha Patel',
    department: 'Content', campaign: 'LinkedIn B2B – TechNova',
    priority: 'High', status: 'In Progress', dueDate: '2024-07-24',
    description: '4 LinkedIn thought leadership articles for C-suite audience.',
  },
  {
    id: '5', title: 'Influencer Brief – NutriBlend Collaborations', assignedTo: 'Riya Anand',
    department: 'Influencer', campaign: 'Instagram Brand – NutriBlend',
    priority: 'Medium', status: 'Done', dueDate: '2024-07-20',
    description: 'Briefs sent to 6 fitness influencers. 4 confirmed, 2 pending.',
  },
  {
    id: '6', title: 'Landing Page A/B Test – Prestige Lead Gen', assignedTo: 'Rohit Mehra',
    department: 'Technology', campaign: 'Q3 Google Ads – Prestige Estates',
    priority: 'High', status: 'In Progress', dueDate: '2024-07-26',
    description: 'Implement 2 landing page variants for A/B testing. Integrate with CRM.',
  },
];

// ─── CHART DATA ────────────────────────────────────────────────────────────────
export const performanceChartData = [
  { month: 'Jan', impressions: 1.2, clicks: 85, conversions: 42, spend: 1.8 },
  { month: 'Feb', impressions: 1.8, clicks: 102, conversions: 58, spend: 2.1 },
  { month: 'Mar', impressions: 2.1, clicks: 118, conversions: 64, spend: 2.4 },
  { month: 'Apr', impressions: 1.9, clicks: 95, conversions: 51, spend: 2.2 },
  { month: 'May', impressions: 2.6, clicks: 134, conversions: 78, spend: 2.8 },
  { month: 'Jun', impressions: 3.1, clicks: 142, conversions: 89, spend: 3.2 },
];

export const channelData = [
  { channel: 'SEO', value: 34, color: '#4C1D95' },
  { channel: 'Paid Ads', value: 28, color: '#7C3AED' },
  { channel: 'Social', value: 22, color: '#06B6D4' },
  { channel: 'Email', value: 16, color: '#EC4899' },
];

export const revenueData = [
  { month: 'Jan', revenue: 28.4 },
  { month: 'Feb', revenue: 32.1 },
  { month: 'Mar', revenue: 38.7 },
  { month: 'Apr', revenue: 35.2 },
  { month: 'May', revenue: 42.8 },
  { month: 'Jun', revenue: 48.3 },
];

export const leadSourceData = [
  { name: 'Organic', value: 42, color: '#4C1D95' },
  { name: 'Referral', value: 28, color: '#7C3AED' },
  { name: 'Paid', value: 18, color: '#06B6D4' },
  { name: 'Direct', value: 12, color: '#EC4899' },
];

export const seoRankingsData = [
  { month: 'Jan', position: 28, traffic: 1200 },
  { month: 'Feb', position: 22, traffic: 1800 },
  { month: 'Mar', position: 15, traffic: 2400 },
  { month: 'Apr', position: 10, traffic: 3200 },
  { month: 'May', position: 6, traffic: 4800 },
  { month: 'Jun', position: 3, traffic: 5760 },
];

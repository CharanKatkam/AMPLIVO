import { Job, Application, Interview, Offer, JobType, WorkMode, JobStatus, ApplicationStatus, InterviewStatus, OfferStatus } from '@/types/hr';

// Departments
const departments = ['Technology', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

// Service Categories
const serviceCategories = ['Website Development', 'Branding & Creative Design', 'Performance Marketing', 'SEO', 'Social Media Marketing', 'Lead Generation'];

// Titles
const jobTitles = [
  'Senior Frontend Developer', 'Backend Engineer', 'Full Stack Developer', 'DevOps Engineer',
  'UI/UX Designer', 'Creative Art Director', 'Graphic Designer',
  'Performance Marketing Manager', 'SEO Strategist', 'Content Marketing Specialist',
  'Sales Executive', 'Account Manager', 'Business Development Representative',
  'HR Business Partner', 'Talent Acquisition Specialist',
  'Financial Analyst', 'Accountant',
  'Operations Manager', 'Project Manager', 'Product Manager'
];

export const mockJobs: Job[] = Array.from({ length: 20 }).map((_, i) => {
  const department = departments[i % departments.length];
  const title = jobTitles[i % jobTitles.length];
  const serviceCategory = serviceCategories[i % serviceCategories.length];
  
  const employmentTypes: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
  const workModes: WorkMode[] = ['Remote', 'Hybrid', 'On-site'];
  const statuses: JobStatus[] = ['Published', 'Draft', 'Closed'];
  
  return {
    id: `JOB-${1000 + i}`,
    title,
    department,
    serviceCategory,
    employmentType: employmentTypes[i % employmentTypes.length],
    experienceLevel: i % 2 === 0 ? '3-5 Years' : (i % 3 === 0 ? '5+ Years' : '1-3 Years'),
    location: i % 2 === 0 ? 'Hyderabad' : (i % 3 === 0 ? 'Bengaluru' : 'Remote'),
    workMode: workModes[i % workModes.length],
    salaryRange: i % 2 === 0 ? '₹12,00,000 - ₹18,00,000' : '₹8,00,000 - ₹12,00,000',
    vacancies: (i % 3) + 1,
    skillsRequired: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].slice(0, (i % 3) + 2),
    responsibilities: ['Write clean code', 'Collaborate with team', 'Participate in code reviews'],
    requirements: ['Degree in CS or related field', 'Strong problem solving skills', 'Good communication'],
    benefits: ['Health Insurance', 'Flexible Working Hours', 'Learning Budget'],
    description: `We are looking for a highly skilled ${title} to join our ${department} team.`,
    applicationDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * (i + 5)).toISOString().split('T')[0],
    status: i < 15 ? 'Published' : (i < 18 ? 'Draft' : 'Closed'),
    postedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * i).toISOString().split('T')[0],
  };
});

const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Sai', 'Arjun', 'Siddharth', 'Rahul', 'Rohan', 'Amit', 'Vikram', 'Ananya', 'Diya', 'Ishita', 'Kavya', 'Neha', 'Pooja', 'Riya', 'Sana', 'Sneha', 'Tanvi'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Patel', 'Singh', 'Kumar', 'Reddy', 'Rao', 'Desai', 'Joshi', 'Mehta', 'Nair', 'Pillai', 'Menon', 'Choudhary', 'Yadav', 'Ahluwalia', 'Iyer', 'Bose', 'Das'];
const statuses: ApplicationStatus[] = ['New', 'Screening', 'Shortlisted', 'Interviewing', 'Offered', 'Hired', 'Rejected'];

// Generating applications based on requested counts
// 300 Total Applications
// Distribution to match prompt: 120 Shortlisted (meaning passed initial), 80 Interviews (in Interviewing/Offered/Hired/Rejected), 35 Hired, 65 Rejected
export const mockApplications: Application[] = Array.from({ length: 300 }).map((_, i) => {
  const job = mockJobs[i % mockJobs.length];
  const firstName = firstNames[i % firstNames.length];
  const lastName = lastNames[i % lastNames.length];
  
  let status: ApplicationStatus = 'New';
  if (i < 35) status = 'Hired'; // 35 Hired
  else if (i < 100) status = 'Rejected'; // 65 Rejected
  else if (i < 140) status = 'Interviewing'; // 40 actively interviewing
  else if (i < 155) status = 'Offered'; // 15 Offered
  else if (i < 200) status = 'Shortlisted'; // 45 Shortlisted
  else if (i < 250) status = 'Screening'; // 50 Screening
  // Remaining 50 are New
  
  return {
    id: `APP-${10000 + i}`,
    jobId: job.id,
    jobTitle: job.title,
    department: job.department,
    candidateName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
    phone: `+91 98765 4${String(i).padStart(3, '0')}2`,
    experience: (i % 5) + 1 + ' Years',
    skills: job.skillsRequired,
    resumeUrl: '#',
    portfolioUrl: i % 3 === 0 ? 'https://portfolio.example.com' : undefined,
    coverLetter: `I am very interested in the ${job.title} role.`,
    education: [
      { degree: 'B.Tech in Computer Science', institution: 'XYZ University', year: '2020' }
    ],
    workHistory: [
      { title: 'Software Engineer', company: 'ABC Corp', duration: '2020 - 2023' }
    ],
    appliedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i % 30)).toISOString().split('T')[0],
    status,
    notes: 'Strong candidate, good cultural fit.',
    recruitmentScore: 70 + (i % 30),
  };
});

// 80 Interviews
export const mockInterviews: Interview[] = Array.from({ length: 80 }).map((_, i) => {
  const app = mockApplications[i + 35]; // Start from rejected/interviewing to map logically
  const interviewStatuses: InterviewStatus[] = ['Scheduled', 'Completed', 'Cancelled', 'Rescheduled'];
  
  return {
    id: `INT-${5000 + i}`,
    applicationId: app.id,
    candidateName: app.candidateName,
    jobTitle: app.jobTitle,
    jobId: app.jobId,
    interviewer: 'Sarah Manager',
    department: app.department,
    type: i % 2 === 0 ? 'Technical' : 'HR',
    date: new Date(Date.now() + (i % 10 - 5) * 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    time: `${10 + (i % 6)}:00 AM`,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: interviewStatuses[i % interviewStatuses.length],
    feedback: i % 2 === 0 ? 'Good technical skills.' : undefined,
    notes: 'Discussed past projects.',
    recommendation: i % 2 === 0 ? 'Hire' : 'Hold',
  };
});

// 15 Offers
export const mockOffers: Offer[] = Array.from({ length: 15 }).map((_, i) => {
  const app = mockApplications[140 + i]; // Match with offered status
  const offerStatuses: OfferStatus[] = ['Generated', 'Sent', 'Accepted', 'Declined'];
  
  return {
    id: `OFF-${8000 + i}`,
    applicationId: app.id,
    candidateName: app.candidateName,
    jobTitle: app.jobTitle,
    department: app.department,
    salary: '₹15,00,000 PA',
    joiningDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
    status: offerStatuses[i % offerStatuses.length],
    offerLetterUrl: '#',
  };
});

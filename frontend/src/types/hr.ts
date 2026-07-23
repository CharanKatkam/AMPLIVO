export type JobStatus = 'Published' | 'Draft' | 'Closed';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
export type WorkMode = 'Remote' | 'Hybrid' | 'On-site';
export type ApplicationStatus = 'New' | 'Screening' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected';
export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled';
export type OfferStatus = 'Generated' | 'Sent' | 'Accepted' | 'Declined';

export interface Job {
  id: string;
  title: string;
  department: string;
  serviceCategory: string;
  employmentType: JobType;
  experienceLevel: string;
  location: string;
  workMode: WorkMode;
  salaryRange: string;
  vacancies: number;
  skillsRequired: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  description: string;
  applicationDeadline: string;
  status: JobStatus;
  postedDate: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  department: string;
  
  // Candidate Info
  candidateName: string;
  email: string;
  phone: string;
  experience: string;
  skills: string[];
  resumeUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  
  // Timeline/History
  education: { degree: string; institution: string; year: string }[];
  workHistory: { title: string; company: string; duration: string }[];
  
  appliedDate: string;
  status: ApplicationStatus;
  notes: string;
  recruitmentScore?: number;
}

export interface Interview {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  jobId: string;
  interviewer: string;
  department: string;
  type: string;
  date: string;
  time: string;
  meetingLink: string;
  status: InterviewStatus;
  feedback?: string;
  notes?: string;
  recommendation?: 'Hire' | 'Reject' | 'Next Round' | 'Hold';
}

export interface Offer {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  department: string;
  salary: string;
  joiningDate: string;
  status: OfferStatus;
  offerLetterUrl?: string;
}

export interface HRStats {
  totalOpenPositions: number;
  activeJobs: number;
  closedJobs: number;
  totalApplications: number;
  newApplications: number;
  shortlistedCandidates: number;
  interviewsToday: number;
  pendingInterviews: number;
  hiredCandidates: number;
  rejectedCandidates: number;
  offerLettersSent: number;
}

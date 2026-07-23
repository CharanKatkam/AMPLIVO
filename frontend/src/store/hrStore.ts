import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Job, Application, Interview, Offer, HRStats, ApplicationStatus, JobStatus, InterviewStatus } from '@/types/hr';
import { careersService } from '@/services/moduleServices';

interface HrState {
  jobs: Job[];
  applications: Application[];
  interviews: Interview[];
  offers: Offer[];
  isLoading: boolean;
  dataLoaded: boolean;
  
  // API Actions
  fetchAllData: () => Promise<void>;
  fetchJobs: () => Promise<void>;
  fetchApplications: (jobId?: string) => Promise<void>;

  // Actions
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  
  addApplication: (app: Application) => void;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
  
  addInterview: (interview: Interview) => void;
  updateInterviewStatus: (id: string, status: InterviewStatus) => void;
  addOffer: (offer: Offer) => void;
}

export const useHrStore = create<HrState>()(
  persist(
    (set, get) => ({
      jobs: [],
      applications: [],
      interviews: [],
      offers: [],
      isLoading: false,
      dataLoaded: false,
      
      // ─── API FETCH ACTIONS ────────────────────────────────────────────────
      fetchAllData: async () => {
        set({ isLoading: true });
        try {
          const [jobsRes] = await Promise.allSettled([
            careersService.getJobs({ page_size: 100 }),
          ]);
          
          const jobs = jobsRes.status === 'fulfilled' ? (jobsRes.value.items || jobsRes.value || []) : get().jobs;
          set({ jobs, isLoading: false, dataLoaded: true });
        } catch {
          set({ isLoading: false });
        }
      },

      fetchJobs: async () => {
        try {
          const res = await careersService.getJobs({ page_size: 100 });
          set({ jobs: res.items || res || [] });
        } catch { /* keep existing */ }
      },

      fetchApplications: async (jobId?: string) => {
        try {
          if (jobId) {
            const res = await careersService.getApplications(jobId, { page_size: 100 });
            set({ applications: res.items || res || [] });
          }
        } catch { /* keep existing */ }
      },

      addJob: (job) => set((state) => ({ jobs: [job, ...state.jobs] })),
      
      updateJob: (id, updates) => set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...updates } : j)),
      })),
      
      deleteJob: (id) => set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== id),
      })),
      
      addApplication: (app) => set((state) => ({ applications: [app, ...state.applications] })),
      
      updateApplicationStatus: (id, status) => set((state) => ({
        applications: state.applications.map((app) => (app.id === id ? { ...app, status } : app)),
      })),
      
      addInterview: (interview) => set((state) => ({ interviews: [interview, ...state.interviews] })),
      
      updateInterviewStatus: (id, status) => set((state) => ({
        interviews: state.interviews.map((int) => (int.id === id ? { ...int, status } : int)),
      })),
      
      addOffer: (offer) => set((state) => ({ offers: [offer, ...state.offers] })),
    }),
    {
      name: 'amplivo-hr-storage',
      partialize: () => ({}),
    }
  )
);

export const useHrStats = (): HRStats => {
  const jobs = useHrStore(state => state.jobs);
  const applications = useHrStore(state => state.applications);
  const interviews = useHrStore(state => state.interviews);
  const offers = useHrStore(state => state.offers);

  return useMemo(() => {
    return {
      totalOpenPositions: jobs.filter(j => j.status === 'Published').reduce((acc, curr) => acc + curr.vacancies, 0),
      activeJobs: jobs.filter(j => j.status === 'Published').length,
      closedJobs: jobs.filter(j => j.status === 'Closed').length,
      totalApplications: applications.length,
      newApplications: applications.filter(a => a.status === 'New').length,
      shortlistedCandidates: applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interviewing' || a.status === 'Offered' || a.status === 'Hired').length,
      interviewsToday: interviews.filter(i => i.date === new Date().toISOString().split('T')[0]).length,
      pendingInterviews: interviews.filter(i => i.status === 'Scheduled').length,
      hiredCandidates: applications.filter(a => a.status === 'Hired').length,
      rejectedCandidates: applications.filter(a => a.status === 'Rejected').length,
      offerLettersSent: offers.filter(o => o.status === 'Sent' || o.status === 'Accepted').length,
    };
  }, [jobs, applications, interviews, offers]);
};

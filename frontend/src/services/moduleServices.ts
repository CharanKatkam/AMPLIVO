/**
 * Module-level API services for all remaining backend modules.
 * Each service maps directly to a backend router prefix.
 */
import { api } from './api';

const paginated = (path: string) => ({
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await api.get(path, { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`${path}/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post(path, payload);
    return data;
  },
  update: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`${path}/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`${path}/${id}`);
  },
});

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsService = {
  getDashboard: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/analytics/dashboards', { params });
    return data;
  },
  createDashboard: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/analytics/dashboards', payload);
    return data;
  },
  getReports: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/analytics/reports', { params });
    return data;
  },
  createReport: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/analytics/reports', payload);
    return data;
  },
  getIntegrations: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/analytics/integrations', { params });
    return data;
  },
};

// ── Activity Timeline ─────────────────────────────────────────────────────────
export const activityTimelineService = {
  getAll: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/activity-logs', { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/activity-logs/${id}`);
    return data;
  },
  create: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/activity-logs', payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/activity-logs/${id}`);
  },
};

// ── Approval System ───────────────────────────────────────────────────────────
export const approvalService = {
  ...paginated('/approvals'),
  getPolicies: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/approvals/policies', { params });
    return data;
  },
  createPolicy: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/approvals/policies', payload);
    return data;
  },
  deletePolicy: async (id: string) => {
    await api.delete(`/approvals/policies/${id}`);
  },
  createDecision: async (id: string, payload: { decision: string; notes?: string }) => {
    const { data } = await api.post(`/approvals/${id}/decisions`, payload);
    return data;
  },
  getDecisions: async (id: string) => {
    const { data } = await api.get(`/approvals/${id}/decisions`);
    return data;
  },
};

// ── Careers ───────────────────────────────────────────────────────────────────
export const careersService = {
  getJobs: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/careers', { params });
    return data;
  },
  getJob: async (id: string) => {
    const { data } = await api.get(`/careers/${id}`);
    return data;
  },
  createJob: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/careers', payload);
    return data;
  },
  updateJob: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/careers/${id}`, payload);
    return data;
  },
  deleteJob: async (id: string) => {
    await api.delete(`/careers/${id}`);
  },
  getApplications: async (jobId: string, params?: Record<string, unknown>) => {
    const { data } = await api.get(`/careers/${jobId}/applications`, { params });
    return data;
  },
  getApplication: async (appId: string) => {
    const { data } = await api.get(`/careers/applications/${appId}`);
    return data;
  },
  createApplication: async (jobId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/careers/${jobId}/applications`, payload);
    return data;
  },
  updateApplication: async (appId: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/careers/applications/${appId}`, payload);
    return data;
  },
};

// ── Case Studies ──────────────────────────────────────────────────────────────
export const caseStudiesService = paginated('/case-studies');

// ── Client Portal ─────────────────────────────────────────────────────────────
export const clientPortalService = {
  getSettings: async (clientId: string) => {
    const { data } = await api.get(`/portal/settings/${clientId}`);
    return data;
  },
  updateSettings: async (clientId: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/portal/settings/${clientId}`, payload);
    return data;
  },
  getAnnouncements: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/portal/announcements', { params });
    return data;
  },
  getResources: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/portal/resources', { params });
    return data;
  },
};

// ── CMS ───────────────────────────────────────────────────────────────────────
export const cmsService = {
  getCategories: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/cms/categories', { params });
    return data;
  },
  createCategory: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/cms/categories', payload);
    return data;
  },
  getItems: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/cms/items', { params });
    return data;
  },
  createItem: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/cms/items', payload);
    return data;
  },
  getItem: async (id: string) => {
    const { data } = await api.get(`/cms/items/${id}`);
    return data;
  },
  updateItem: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/cms/items/${id}`, payload);
    return data;
  },
  deleteItem: async (id: string) => {
    await api.delete(`/cms/items/${id}`);
  },
};

// ── Companies ─────────────────────────────────────────────────────────────────
export const companiesService = paginated('/companies');

// ── Consultation Requests ─────────────────────────────────────────────────────
export const consultationService = {
  ...paginated('/consultation-requests'),
  submit: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/consultation-requests', payload);
    return data;
  },
};

// ── Contact Forms ─────────────────────────────────────────────────────────────
export const contactFormsService = {
  ...paginated('/contact-submissions'),
  submit: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/contact-submissions', payload);
    return data;
  },
};

// ── Content Calendar ──────────────────────────────────────────────────────────
export const contentCalendarService = paginated('/content-calendar');

// ── Creative ──────────────────────────────────────────────────────────────────
export const creativeService = {
  getProjects: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/creative/projects', { params });
    return data;
  },
  getProject: async (id: string) => {
    const { data } = await api.get(`/creative/projects/${id}`);
    return data;
  },
  createProject: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/creative/projects', payload);
    return data;
  },
  updateProject: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/creative/projects/${id}`, payload);
    return data;
  },
  deleteProject: async (id: string) => {
    await api.delete(`/creative/projects/${id}`);
  },
  getAssets: async (projectId: string) => {
    const { data } = await api.get(`/creative/projects/${projectId}/assets`);
    return data;
  },
  createAsset: async (projectId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/creative/projects/${projectId}/assets`, payload);
    return data;
  },
  getAsset: async (assetId: string) => {
    const { data } = await api.get(`/creative/assets/${assetId}`);
    return data;
  },
  updateAsset: async (assetId: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/creative/assets/${assetId}`, payload);
    return data;
  },
  deleteAsset: async (assetId: string) => {
    await api.delete(`/creative/assets/${assetId}`);
  },
  getFeedback: async (assetId: string) => {
    const { data } = await api.get(`/creative/assets/${assetId}/feedback`);
    return data;
  },
  createFeedback: async (assetId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/creative/assets/${assetId}/feedback`, payload);
    return data;
  },
};

// ── FAQs ──────────────────────────────────────────────────────────────────────
export const faqsService = {
  ...paginated('/faqs'),
  getCategories: async () => {
    const { data } = await api.get('/faqs/categories/list');
    return data;
  },
  createCategory: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/faqs/categories', payload);
    return data;
  },
};

// ── File Manager ──────────────────────────────────────────────────────────────
export const fileManagerService = {
  getFolders: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/files/folders', { params });
    return data;
  },
  getFolder: async (id: string) => {
    const { data } = await api.get(`/files/folders/${id}`);
    return data;
  },
  createFolder: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/files/folders', payload);
    return data;
  },
  deleteFolder: async (id: string) => {
    await api.delete(`/files/folders/${id}`);
  },
  getFiles: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/files', { params });
    return data;
  },
  getFile: async (id: string) => {
    const { data } = await api.get(`/files/${id}`);
    return data;
  },
  uploadFile: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/files', payload);
    return data;
  },
  /** Real binary upload — sends the file as multipart/form-data to POST /files/upload. */
  uploadBinary: async (file: globalThis.File, folderId?: string) => {
    const form = new FormData();
    form.append('upload', file);
    if (folderId) form.append('folder_id', folderId);
    const { data } = await api.post('/files/upload', form, {
      headers: { 'Content-Type': undefined },
    });
    return data;
  },
  deleteFile: async (id: string) => {
    await api.delete(`/files/${id}`);
  },
};

// ── Influencers ───────────────────────────────────────────────────────────────
export const influencersService = {
  ...paginated('/influencers'),
  getCampaigns: async (influencerId: string) => {
    const { data } = await api.get(`/influencers/${influencerId}/campaigns`);
    return data;
  },
  createCampaign: async (influencerId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/influencers/${influencerId}/campaigns`, payload);
    return data;
  },
  getContracts: async (influencerId: string) => {
    const { data } = await api.get(`/influencers/${influencerId}/contracts`);
    return data;
  },
  createContract: async (influencerId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/influencers/${influencerId}/contracts`, payload);
    return data;
  },
};

// ── Marketing Automation ──────────────────────────────────────────────────────
export const marketingAutomationService = paginated('/automation');

// ── Paid Ads ──────────────────────────────────────────────────────────────────
export const paidAdsService = {
  getCampaigns: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/paidads/campaigns', { params });
    return data;
  },
  getCampaign: async (id: string) => {
    const { data } = await api.get(`/paidads/campaigns/${id}`);
    return data;
  },
  createCampaign: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/paidads/campaigns', payload);
    return data;
  },
  updateCampaign: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/paidads/campaigns/${id}`, payload);
    return data;
  },
  deleteCampaign: async (id: string) => {
    await api.delete(`/paidads/campaigns/${id}`);
  },
  getGroups: async (campaignId: string) => {
    const { data } = await api.get(`/paidads/campaigns/${campaignId}/groups`);
    return data;
  },
  createGroup: async (campaignId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/paidads/campaigns/${campaignId}/groups`, payload);
    return data;
  },
  getMetrics: async (campaignId: string) => {
    const { data } = await api.get(`/paidads/campaigns/${campaignId}/metrics`);
    return data;
  },
  createMetric: async (campaignId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/paidads/campaigns/${campaignId}/metrics`, payload);
    return data;
  },
};

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolioService = paginated('/portfolio');

// ── SEO ───────────────────────────────────────────────────────────────────────
export const seoService = {
  getProjects: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/seo/projects', { params });
    return data;
  },
  getProject: async (id: string) => {
    const { data } = await api.get(`/seo/projects/${id}`);
    return data;
  },
  createProject: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/seo/projects', payload);
    return data;
  },
  updateProject: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/seo/projects/${id}`, payload);
    return data;
  },
  deleteProject: async (id: string) => {
    await api.delete(`/seo/projects/${id}`);
  },
  getKeywords: async (projectId: string) => {
    const { data } = await api.get(`/seo/projects/${projectId}/keywords`);
    return data;
  },
  createKeyword: async (projectId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/seo/projects/${projectId}/keywords`, payload);
    return data;
  },
  getAudits: async (projectId: string) => {
    const { data } = await api.get(`/seo/projects/${projectId}/audits`);
    return data;
  },
  createAudit: async (projectId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/seo/projects/${projectId}/audits`, payload);
    return data;
  },
  getBacklinks: async (projectId: string) => {
    const { data } = await api.get(`/seo/projects/${projectId}/backlinks`);
    return data;
  },
  createBacklink: async (projectId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/seo/projects/${projectId}/backlinks`, payload);
    return data;
  },
};

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsService = {
  getSystemSettings: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/settings/system', { params });
    return data;
  },
  createSystemSetting: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/settings/system', payload);
    return data;
  },
  getSystemSetting: async (id: string) => {
    const { data } = await api.get(`/settings/system/${id}`);
    return data;
  },
  updateSystemSetting: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/settings/system/${id}`, payload);
    return data;
  },
  deleteSystemSetting: async (id: string) => {
    await api.delete(`/settings/system/${id}`);
  },
  getMyPreferences: async () => {
    const { data } = await api.get('/settings/user/me');
    return data;
  },
  updateMyPreferences: async (payload: Record<string, unknown>) => {
    const { data } = await api.put('/settings/user/me', payload);
    return data;
  },
};

// ── Social Media ──────────────────────────────────────────────────────────────
export const socialService = {
  getProfiles: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/social/profiles', { params });
    return data;
  },
  getProfile: async (id: string) => {
    const { data } = await api.get(`/social/profiles/${id}`);
    return data;
  },
  createProfile: async (payload: Record<string, unknown>) => {
    const { data } = await api.post('/social/profiles', payload);
    return data;
  },
  updateProfile: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/social/profiles/${id}`, payload);
    return data;
  },
  deleteProfile: async (id: string) => {
    await api.delete(`/social/profiles/${id}`);
  },
  getPosts: async (profileId: string) => {
    const { data } = await api.get(`/social/profiles/${profileId}/posts`);
    return data;
  },
  createPost: async (profileId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/social/profiles/${profileId}/posts`, payload);
    return data;
  },
  getPost: async (postId: string) => {
    const { data } = await api.get(`/social/posts/${postId}`);
    return data;
  },
  updatePost: async (postId: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/social/posts/${postId}`, payload);
    return data;
  },
  deletePost: async (postId: string) => {
    await api.delete(`/social/posts/${postId}`);
  },
};

// ── Testimonials ──────────────────────────────────────────────────────────────
export const testimonialsService = paginated('/testimonials');

// ── Timesheets ────────────────────────────────────────────────────────────────
export const timesheetsService = paginated('/timesheets');

// ── Websites ──────────────────────────────────────────────────────────────────
export const websitesService = {
  ...paginated('/websites'),
  getPages: async (websiteId: string) => {
    const { data } = await api.get(`/websites/${websiteId}/pages`);
    return data;
  },
  createPage: async (websiteId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/websites/${websiteId}/pages`, payload);
    return data;
  },
  updatePage: async (pageId: string, payload: Record<string, unknown>) => {
    const { data } = await api.put(`/websites/pages/${pageId}`, payload);
    return data;
  },
  deletePage: async (pageId: string) => {
    await api.delete(`/websites/pages/${pageId}`);
  },
  getMetrics: async (websiteId: string) => {
    const { data } = await api.get(`/websites/${websiteId}/metrics`);
    return data;
  },
  createMetric: async (websiteId: string, payload: Record<string, unknown>) => {
    const { data } = await api.post(`/websites/${websiteId}/metrics`, payload);
    return data;
  },
};

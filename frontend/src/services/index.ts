// Central export for all API services
export { api } from './api';
export { authService } from './authService';
export { leadService } from './leadService';
export { campaignService } from './campaignService';
export {
  clientService,
  projectService,
  taskService,
  notificationService,
  financeService,
  userManagementService,
} from './crmService';
export type {
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
  TokenResponse,
} from './authService';
export type {
  LeadCreatePayload,
  LeadUpdatePayload,
  PaginatedLeads,
  LeadRead,
} from './leadService';
export type {
  CampaignCreatePayload,
  CampaignUpdatePayload,
  CampaignRead,
} from './campaignService';
export * from './moduleServices';
export * from './portalServices';

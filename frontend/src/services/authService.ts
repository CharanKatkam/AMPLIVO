import { api } from './api';
import { User } from '@/store/authStore';

export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  full_name: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const VALID_ROLES = ['admin', 'client', 'sales', 'hr', 'employee'] as const;
type ValidRole = (typeof VALID_ROLES)[number];

// Map backend role_name (may be capitalized) to frontend lowercase role
const mapRole = (roleName?: string | null): ValidRole => {
  if (!roleName) return 'admin';
  const lower = roleName.toLowerCase() as ValidRole;
  return VALID_ROLES.includes(lower) ? lower : 'admin';
};

// Map backend UserRead to frontend User shape
const mapUser = (backendUser: {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  role_name?: string | null;
}): User => ({
  id: backendUser.id,
  name: backendUser.full_name,
  email: backendUser.email,
  username: backendUser.username,
  role: mapRole(backendUser.role_name),
  is_active: backendUser.is_active,
  is_verified: backendUser.is_verified,
});

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data: tokens } = await api.post<TokenResponse>('/auth/login', {
      identifier: credentials.identifier,
      password: credentials.password,
    });

    // Fetch current user profile with the new access token
    const { data: backendUser } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    return {
      user: mapUser(backendUser),
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await api.post('/auth/register', payload);
    return mapUser(data);
  },

  logout: async (refreshToken: string): Promise<void> => {
    await api.post('/auth/logout', { refresh_token: refreshToken });
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return mapUser(data);
  },

  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const { data } = await api.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, new_password: newPassword });
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword });
  },

  sendVerification: async (): Promise<void> => {
    await api.post('/auth/send-verification');
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post('/auth/verify-email', { token });
  },

  checkEmail: async (email: string): Promise<boolean> => {
    const { data } = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
    return data.exists;
  },

  checkUsername: async (username: string): Promise<boolean> => {
    const { data } = await api.get(`/auth/check-username?username=${encodeURIComponent(username)}`);
    return data.exists;
  },
};

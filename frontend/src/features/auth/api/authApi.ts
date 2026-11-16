import { apiRequest, setAccessToken } from '../../../services/apiClient';
import {
  AuthResponseData,
  LoginPayload,
  RegisterPayload,
  User,
} from '../../../types/auth';

interface StandardResponse<T> {
  success: boolean;
  data: T;
}

export const authApi = {
  /**
   * Registers a new student account.
   */
  async register(payload: RegisterPayload): Promise<AuthResponseData> {
    const res = await apiRequest<StandardResponse<AuthResponseData>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  /**
   * Logs in with email and password.
   */
  async login(payload: LoginPayload): Promise<AuthResponseData> {
    const res = await apiRequest<StandardResponse<AuthResponseData>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  /**
   * Silently restores or rotates session using the secure HttpOnly refresh token cookie.
   */
  async refreshSession(): Promise<AuthResponseData> {
    const res = await apiRequest<StandardResponse<AuthResponseData>>('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  /**
   * Revokes the refresh token on backend and clears client in-memory token.
   */
  async logout(): Promise<void> {
    try {
      await apiRequest<StandardResponse<{ message: string }>>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      setAccessToken(null);
    }
  },

  /**
   * Retrieves profile of current authenticated user.
   */
  async getCurrentUser(): Promise<User> {
    const res = await apiRequest<StandardResponse<{ user: User }>>('/auth/me', {
      method: 'GET',
    });
    return res.data.user;
  },
};

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '../../config';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/api/tokenStorage';
import { navigate } from '@/api/navigation';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const axiosClient = axios.create({
  baseURL: `${config.baseUrl}/api/v1`,
  timeout: 15_000,
});

axiosClient.interceptors.request.use((requestConfig) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    requestConfig.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return requestConfig;
});

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  const { data } = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${config.baseUrl}/api/v1/auth/refresh`,
    { refreshToken },
    { timeout: 15_000 },
  );
  setTokens(data);
  return data.accessToken;
};

const NO_REFRESH_PATHS = ['/auth/login', '/auth/refresh'];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint = NO_REFRESH_PATHS.some((path) => requestUrl.includes(path));

    if (
      error.response?.status !== 401 ||
      isAuthEndpoint ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise = refreshPromise ?? refreshAccessToken();
      const newAccessToken = await refreshPromise;
      originalRequest.headers.set('Authorization', `Bearer ${newAccessToken}`);
      return axiosClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      const { store } = await import('../store/store');
      const { logoutLocal } = await import('../features/auth/authSlice');
      store.dispatch(logoutLocal());
      navigate('/login');
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);

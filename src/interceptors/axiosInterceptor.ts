import axios, { type InternalAxiosRequestConfig } from 'axios';
import { store } from '@/store/store';
import { logOut, tokenRefresh } from '@/store/authSlice/authSlice';
import { API_BASE_URL } from '@/utils/apiBaseUrl';

type RetryableRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if ((status !== 401 && status !== 403) || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      const result = await store.dispatch(tokenRefresh());
      if (tokenRefresh.rejected.match(result)) {
        throw result.payload;
      }
      const { accessToken } = result.payload;
      originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      store.dispatch(logOut());
      return Promise.reject(refreshError);
    }
  },
);

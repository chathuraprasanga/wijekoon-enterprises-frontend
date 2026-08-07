import { axiosClient } from '@/api/axiosClient';
import type { SafeUser } from '@/types/user';

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface LoginResponse {
  user: SafeUser;
  accessToken: string;
  refreshToken: string;
}

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await axiosClient.post<LoginResponse>('/auth/login', payload);
  return data;
};

export const logout = async (): Promise<void> => {
  await axiosClient.post('/auth/logout');
};

export const getMe = async (): Promise<SafeUser> => {
  const { data } = await axiosClient.get<SafeUser>('/users/me');
  return data;
};

export const forgotPassword = async (identifier: string): Promise<{ message: string }> => {
  const { data } = await axiosClient.post<{ message: string }>('/auth/forgot-password', {
    identifier,
  });
  return data;
};

export interface VerifyOtpPayload {
  identifier: string;
  code: string;
}

export interface VerifyOtpResponse {
  message: string;
  resetToken: string;
}

export const verifyOtp = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  const { data } = await axiosClient.post<VerifyOtpResponse>('/auth/verify-otp', payload);
  return data;
};

export interface ResetPasswordPayload {
  identifier: string;
  resetToken: string;
  newPassword: string;
}

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<{ message: string }> => {
  const { data } = await axiosClient.post<{ message: string }>('/auth/reset-password', payload);
  return data;
};

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<{ message: string }> => {
  const { data } = await axiosClient.post<{ message: string }>('/auth/change-password', payload);
  return data;
};

export const verifyEmail = async (code: string): Promise<SafeUser> => {
  const { data } = await axiosClient.post<SafeUser>('/auth/verify-email', { code });
  return data;
};

export const resendEmailCode = async (): Promise<{ message: string }> => {
  const { data } = await axiosClient.post<{ message: string }>('/auth/resend-email-code');
  return data;
};

export const verifyMobile = async (code: string): Promise<SafeUser> => {
  const { data } = await axiosClient.post<SafeUser>('/auth/verify-mobile', { code });
  return data;
};

export const resendMobileCode = async (): Promise<{ message: string }> => {
  const { data } = await axiosClient.post<{ message: string }>('/auth/resend-mobile-code');
  return data;
};

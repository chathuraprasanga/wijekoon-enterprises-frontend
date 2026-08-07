import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
};

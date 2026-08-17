import { AxiosError } from 'axios';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? FALLBACK_MESSAGE;
  }
  return FALLBACK_MESSAGE;
};

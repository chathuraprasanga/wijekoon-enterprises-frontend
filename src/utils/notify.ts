import { notifications } from '@mantine/notifications';
import { getApiErrorMessage } from '@/api/errors';

export const notifySuccess = (message: string): void => {
  notifications.show({
    color: 'brandGreen',
    title: 'Success',
    message,
  });
};

export const notifyError = (error: unknown): void => {
  notifications.show({
    color: 'red',
    title: 'Error',
    message: getApiErrorMessage(error),
  });
};

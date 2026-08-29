import { notifications } from '@mantine/notifications';
import { NOTIFY_VISUALS, type NotifyType } from '@/hooks/notifyConfig';

export type { NotifyType };

export const toNotify = (title: string, message: string, type: NotifyType) => {
  const { color, icon, autoClose } = NOTIFY_VISUALS[type];
  notifications.show({
    title,
    message,
    color,
    icon,
    autoClose,
    loading: type === 'LOADING',
  });
};

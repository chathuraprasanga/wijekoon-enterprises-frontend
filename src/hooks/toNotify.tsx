import { notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconX } from '@tabler/icons-react';

export type NotifyType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'LOADING';

const NOTIFY_CONFIG: Record<
  NotifyType,
  { color: string; icon: React.ReactNode; autoClose: number | false }
> = {
  SUCCESS: { color: 'green', icon: <IconCheck size={18} />, autoClose: 4000 },
  ERROR: { color: 'red', icon: <IconX size={18} />, autoClose: 5000 },
  WARNING: { color: 'yellow', icon: <IconAlertTriangle size={18} />, autoClose: 5000 },
  LOADING: { color: 'gray', icon: <IconInfoCircle size={18} />, autoClose: false },
};

export const toNotify = (title: string, message: string, type: NotifyType) => {
  const { color, icon, autoClose } = NOTIFY_CONFIG[type];
  notifications.show({ title, message, color, icon, autoClose, loading: type === 'LOADING' });
};

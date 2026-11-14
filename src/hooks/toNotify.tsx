import { notifications } from '@mantine/notifications';
import { NOTIFY_VISUALS, type NotifyType } from '@/hooks/notifyConfig';

export type { NotifyType };

// Ids of toasts currently on screen, so an identical toast never stacks twice.
const active = new Set<string>();

export const toNotify = (title: string, message: string, type: NotifyType) => {
  const id = `${type}:${title}:${message}`;
  if (active.has(id)) return;
  active.add(id);
  const { icon, autoClose } = NOTIFY_VISUALS[type];
  notifications.show({
    id,
    title,
    message,
    icon,
    autoClose,
    loading: type === 'LOADING',
    withCloseButton: true,
    role: type === 'ERROR' ? 'alert' : 'status',
    onClose: () => active.delete(id),
  });
};

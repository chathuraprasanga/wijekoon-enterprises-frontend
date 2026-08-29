import type { ReactNode } from 'react';
import { IconCheck, IconExclamationMark, IconInfoCircle, IconX } from '@tabler/icons-react';

export type NotifyType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'LOADING';

type NotifyVisual = {
  color: string;
  icon: ReactNode;
  autoClose: number | false;
};

export const NOTIFY_VISUALS: Record<NotifyType, NotifyVisual> = {
  SUCCESS: { color: 'green', icon: <IconCheck size={20} />, autoClose: 4000 },
  ERROR: { color: 'red', icon: <IconX size={20} />, autoClose: 5000 },
  WARNING: { color: 'orange', icon: <IconExclamationMark size={20} />, autoClose: 5000 },
  LOADING: { color: 'blue', icon: <IconInfoCircle size={20} />, autoClose: false },
};

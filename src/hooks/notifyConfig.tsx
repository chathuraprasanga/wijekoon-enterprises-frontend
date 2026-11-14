import type { ReactNode } from 'react';
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconAlertCircle,
} from '@tabler/icons-react';

export type NotifyType = 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO' | 'LOADING';

type NotifyVisual = { icon: ReactNode; autoClose: number | false };

const tone = (token: string) => ({ color: `var(--ldg-${token}-text)` });
const icon = (Icon: typeof IconCircleCheck, token: string) => (
  <Icon size={20} style={tone(token)} aria-hidden />
);

// Every toast dismisses after 5 seconds, except errors, which stay until dismissed.
export const NOTIFY_VISUALS: Record<NotifyType, NotifyVisual> = {
  SUCCESS: { icon: icon(IconCircleCheck, 'success'), autoClose: 5000 },
  ERROR: { icon: icon(IconAlertCircle, 'danger'), autoClose: false },
  WARNING: { icon: icon(IconAlertTriangle, 'warning'), autoClose: 5000 },
  INFO: { icon: icon(IconInfoCircle, 'info'), autoClose: 5000 },
  LOADING: { icon: icon(IconInfoCircle, 'info'), autoClose: false },
};

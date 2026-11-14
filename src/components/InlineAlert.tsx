import type { ReactNode } from 'react';
import { Alert } from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
} from '@tabler/icons-react';

const TONES = {
  success: { icon: IconCircleCheck, color: 'success' },
  warning: { icon: IconAlertTriangle, color: 'warning' },
  danger: { icon: IconAlertCircle, color: 'danger' },
  info: { icon: IconInfoCircle, color: 'info' },
} as const;

type Props = { tone: keyof typeof TONES; title: string; children?: ReactNode; action?: ReactNode };

// Persistent in-page message (toasts are for transient feedback).
export const InlineAlert = ({ tone, title, children, action }: Props) => {
  const { icon: Glyph, color } = TONES[tone];
  return (
    <Alert
      role={tone === 'danger' ? 'alert' : 'status'}
      icon={<Glyph size={18} aria-hidden />}
      title={title}
      styles={{
        root: {
          background: `var(--ldg-${color}-subtle)`,
          border: `1px solid var(--ldg-${color}-border)`,
          color: `var(--ldg-${color}-text)`,
        },
        title: { fontWeight: 600, color: 'var(--ldg-text)' },
        message: { color: 'var(--ldg-text-muted)' },
        icon: { color: `var(--ldg-${color}-text)` },
      }}
    >
      {children}
      {action}
    </Alert>
  );
};

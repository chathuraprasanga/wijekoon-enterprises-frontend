import { Badge } from '@mantine/core';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCalendar,
  IconCircleCheck,
  IconBuildingStore,
  IconCircleMinus,
  IconClock,
  IconHourglass,
  IconUser,
  type Icon,
} from '@tabler/icons-react';

// Hue + icon + text: remove the colour and every status still reads.
const TONES = {
  success: { bg: 'success-subtle', fg: 'success-text', bd: 'success-border' },
  warning: { bg: 'warning-subtle', fg: 'warning-text', bd: 'warning-border' },
  danger: { bg: 'danger-subtle', fg: 'danger-text', bd: 'danger-border' },
  info: { bg: 'info-subtle', fg: 'info-text', bd: 'info-border' },
  accent: { bg: 'accent-subtle', fg: 'accent-subtle-text', bd: 'accent-border' },
  neutral: { bg: 'surface-sunken', fg: 'text-muted', bd: 'border-strong' },
} as const;

type Props = { tone: keyof typeof TONES; label: string; icon?: Icon };

export const StatusBadge = ({ tone, label, icon: Glyph }: Props) => {
  const t = TONES[tone];
  return (
    <Badge
      leftSection={Glyph ? <Glyph size={14} aria-hidden /> : undefined}
      styles={{
        root: {
          background: `var(--ldg-${t.bg})`,
          color: `var(--ldg-${t.fg})`,
          border: `1px solid var(--ldg-${t.bd})`,
          textTransform: 'none',
        },
      }}
    >
      {label}
    </Badge>
  );
};

export const ActiveBadge = ({ active }: { active: boolean }) =>
  active ? (
    <StatusBadge tone="success" label="Active" icon={IconCircleCheck} />
  ) : (
    <StatusBadge tone="neutral" label="Inactive" icon={IconCircleMinus} />
  );

// Same hues as the map pins: amber storefront for hardware stores, forest person for individuals.
// A missing type (records from before types existed) is a hardware store.
export const CustomerTypeBadge = ({ type }: { type?: 'HARDWARE_STORE' | 'INDIVIDUAL' }) =>
  type === 'INDIVIDUAL' ? (
    <StatusBadge tone="accent" label="Individual" icon={IconUser} />
  ) : (
    <StatusBadge tone="warning" label="Hardware store" icon={IconBuildingStore} />
  );

// Customer cheque lifecycle (RECEIVED -> DEPOSITED | TRANSFERRED -> CLEARED, auto after the clearing date; RETURNED any time, then DEPOSITED again).
export const ChequeLifecycleBadge = ({ status }: { status?: string }) => {
  switch (status) {
    case 'DEPOSITED':
      return <StatusBadge tone="accent" label="Deposited" icon={IconClock} />;
    case 'TRANSFERRED':
      return <StatusBadge tone="info" label="Transferred" icon={IconHourglass} />;
    case 'CLEARED':
      return <StatusBadge tone="success" label="Cleared" icon={IconCircleCheck} />;
    case 'ISSUED':
      return <StatusBadge tone="info" label="Issued" icon={IconHourglass} />;
    case 'RETURNED':
      return <StatusBadge tone="danger" label="Returned" icon={IconAlertCircle} />;
    default:
      return <StatusBadge tone="warning" label="Received" icon={IconCalendar} />;
  }
};

export const SaleStatusBadge = ({ status }: { status: 'paid' | 'partially_paid' | 'not_paid' }) =>
  status === 'paid' ? (
    <StatusBadge tone="success" label="Paid" icon={IconCircleCheck} />
  ) : status === 'partially_paid' ? (
    <StatusBadge tone="info" label="Partially paid" icon={IconClock} />
  ) : (
    <StatusBadge tone="warning" label="Not paid" icon={IconAlertTriangle} />
  );

export const NotAvailableBadge = () => (
  <StatusBadge tone="info" label="Not available yet" icon={IconHourglass} />
);

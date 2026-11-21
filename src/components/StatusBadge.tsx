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

export const SaleStatusBadge = ({ status }: { status: 'paid' | 'partially_paid' | 'not_paid' }) =>
  status === 'paid' ? (
    <StatusBadge tone="success" label="Paid" icon={IconCircleCheck} />
  ) : status === 'partially_paid' ? (
    <StatusBadge tone="info" label="Partially paid" icon={IconClock} />
  ) : (
    <StatusBadge tone="warning" label="Not paid" icon={IconAlertTriangle} />
  );

// The API stores no clearance state, so cheque status comes from the deposit date alone.
export const ChequeStatusBadge = ({ depositDate }: { depositDate: string }) => {
  const today = new Date().toISOString().slice(0, 10);
  const day = depositDate.slice(0, 10);
  if (day < today)
    return <StatusBadge tone="danger" label="Deposit date passed" icon={IconAlertCircle} />;
  if (day === today) return <StatusBadge tone="warning" label="Due today" icon={IconClock} />;
  return <StatusBadge tone="info" label="Upcoming" icon={IconCalendar} />;
};

export const NotAvailableBadge = () => (
  <StatusBadge tone="info" label="Not available yet" icon={IconHourglass} />
);

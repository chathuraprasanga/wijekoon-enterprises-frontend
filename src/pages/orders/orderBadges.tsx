import {
  IconAlertTriangle,
  IconBan,
  IconCircleCheck,
  IconClock,
  IconPackage,
  IconPackageImport,
  IconHourglass,
  IconArrowBackUp,
} from '@tabler/icons-react';
import { StatusBadge } from '@/components/StatusBadge';
import type { OrderPaymentStatus, OrderStatus, PaymentStatus } from '@/store/orderSlice/orderSlice';

export const PaymentStatusBadge = ({ status }: { status: OrderPaymentStatus }) =>
  status === 'paid' ? (
    <StatusBadge tone="success" label="Paid" icon={IconCircleCheck} />
  ) : status === 'partially_paid' ? (
    <StatusBadge tone="info" label="Partially paid" icon={IconClock} />
  ) : (
    <StatusBadge tone="warning" label="Unpaid" icon={IconAlertTriangle} />
  );

export const OverdueBadge = () => (
  <StatusBadge tone="danger" label="Overdue" icon={IconAlertTriangle} />
);

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) =>
  status === 'received' ? (
    <StatusBadge tone="success" label="Received" icon={IconPackage} />
  ) : status === 'partially_received' ? (
    <StatusBadge tone="info" label="Partly received" icon={IconPackageImport} />
  ) : status === 'cancelled' ? (
    <StatusBadge tone="neutral" label="Cancelled" icon={IconBan} />
  ) : (
    <StatusBadge tone="warning" label="Pending" icon={IconHourglass} />
  );

export const PaymentRowStatusBadge = ({ status }: { status: PaymentStatus }) =>
  status === 'completed' ? (
    <StatusBadge tone="success" label="Paid" icon={IconCircleCheck} />
  ) : status === 'returned' ? (
    <StatusBadge tone="danger" label="Returned" icon={IconAlertTriangle} />
  ) : (
    <StatusBadge tone="neutral" label="Reversed" icon={IconArrowBackUp} />
  );

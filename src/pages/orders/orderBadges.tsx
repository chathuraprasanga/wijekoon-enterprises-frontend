import {
  IconAlertTriangle,
  IconBan,
  IconCircleCheck,
  IconClock,
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

/// Every order counts as received when placed, so only a cancelled one gets an order badge.
export const OrderStatusBadge = ({ status }: { status: OrderStatus }) =>
  status === 'cancelled' ? <StatusBadge tone="neutral" label="Cancelled" icon={IconBan} /> : null;

export const PaymentRowStatusBadge = ({ status }: { status: PaymentStatus }) =>
  status === 'completed' ? (
    <StatusBadge tone="success" label="Paid" icon={IconCircleCheck} />
  ) : status === 'returned' ? (
    <StatusBadge tone="danger" label="Returned" icon={IconAlertTriangle} />
  ) : (
    <StatusBadge tone="neutral" label="Reversed" icon={IconArrowBackUp} />
  );

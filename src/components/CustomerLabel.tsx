import type { Customer } from '@/store/customerSlice/customerSlice';
import { customerName } from '@/pages/sales/saleLabels';

export const CustomerLabel = ({ customer }: { customer?: Customer }) => (
  <>{customerName(customer)}</>
);

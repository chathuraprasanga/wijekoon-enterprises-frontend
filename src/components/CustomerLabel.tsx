import { Group, Tooltip } from '@mantine/core';
import { IconBuildingStore, IconUser } from '@tabler/icons-react';
import type { Customer } from '@/store/customerSlice/customerSlice';
import { customerName } from '@/pages/sales/saleLabels';

// Customer name with a small type icon (storefront = hardware store, person = individual).
export const CustomerLabel = ({ customer }: { customer?: Customer }) => {
  if (!customer) return <>{customerName(customer)}</>;
  const individual = customer.customerType === 'INDIVIDUAL';
  const Glyph = individual ? IconUser : IconBuildingStore;
  return (
    <Group gap={6} wrap="nowrap">
      <Tooltip label={individual ? 'Individual' : 'Hardware store'}>
        <Glyph
          size={14}
          aria-label={individual ? 'Individual' : 'Hardware store'}
          style={{ flexShrink: 0, color: 'var(--ldg-text-muted)' }}
        />
      </Tooltip>
      <span>{customerName(customer)}</span>
    </Group>
  );
};

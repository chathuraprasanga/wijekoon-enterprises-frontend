import { Box, Button, Group } from '@mantine/core';
import { IconShoppingCart } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { NotAvailableBadge } from '@/components/StatusBadge';

const OrdersPage = () => (
  <>
    <PageHeader
      title="Orders"
      badge={<NotAvailableBadge />}
      description="Customer and supplier orders."
    />
    <Box
      style={{
        background: 'var(--ldg-surface-raised)',
        border: '1px solid var(--ldg-border)',
        borderRadius: 8,
      }}
    >
      <EmptyState
        icon={<IconShoppingCart size={20} />}
        title="Orders aren't available yet"
        description="This section isn't switched on. Sales and cheques already cover day-to-day trading, and nothing here needs your attention."
        action={
          <Group gap="xs" justify="center">
            <Button component={Link} to="/app/sales">
              Go to Sales
            </Button>
            <Button component={Link} to="/app/dashboard" variant="default">
              Back to Dashboard
            </Button>
          </Group>
        }
      />
    </Box>
  </>
);

export default OrdersPage;

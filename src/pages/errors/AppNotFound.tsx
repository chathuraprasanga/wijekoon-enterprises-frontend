import { Button, Group } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { ErrorCard } from './ErrorCard';

// 404 inside the app shell (signed-in users keep their navigation).
const AppNotFound = () => (
  <>
    <PageHeader
      title="Page not found"
      crumbs={[{ label: 'Home', to: '/app/dashboard' }, { label: 'Page not found' }]}
    />
    <ErrorCard
      icon={<IconSearch size={22} />}
      code="404"
      title="We can't find that page"
      actions={
        <Group gap="xs" justify="center">
          <Button component={Link} to="/app/dashboard">
            Back to Dashboard
          </Button>
          <Button component={Link} to="/app/customers" variant="default">
            Open Customers
          </Button>
        </Group>
      }
    >
      The link may be old, or the record may have been deleted. Check the address, or go back to
      somewhere familiar.
    </ErrorCard>
  </>
);

export default AppNotFound;

import { Button } from '@mantine/core';
import { IconShieldLock } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { ErrorCard } from './ErrorCard';

// Shown inside the shell when a role lacks access. Pass { section } in router state to name the area.
const ForbiddenPage = () => {
  const section = (useLocation().state as { section?: string } | null)?.section ?? 'this page';

  return (
    <>
      <PageHeader title={section === 'this page' ? 'No access' : section} />
      <ErrorCard
        icon={<IconShieldLock size={22} />}
        code="403"
        title={`You don't have permission to view ${section}`}
        actions={
          <Button component={Link} to="/app/dashboard">
            Back to Dashboard
          </Button>
        }
      >
        Your role doesn&apos;t include access to {section}. Ask an administrator to add it to your
        role.
      </ErrorCard>
    </>
  );
};

export default ForbiddenPage;

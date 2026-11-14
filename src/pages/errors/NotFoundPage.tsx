import { Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import { StatusPage } from './StatusPage';

const NotFoundPage = () => (
  <StatusPage
    code="404"
    title="Page not found"
    actions={
      <Button component={Link} to="/app/dashboard">
        Go to dashboard
      </Button>
    }
  >
    The page you're looking for doesn't exist or has moved.
  </StatusPage>
);

export default NotFoundPage;

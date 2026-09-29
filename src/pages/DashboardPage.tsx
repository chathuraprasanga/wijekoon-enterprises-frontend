import { useAppSelector } from '@/store/hooks';
import { PageHeader } from '@/components/PageHeader';

const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <PageHeader
      title="Dashboard"
      description={`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}.`}
    />
  );
};

export default DashboardPage;

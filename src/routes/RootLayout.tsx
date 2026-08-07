import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { setNavigate } from '@/api/navigation';

export const RootLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate((path) => navigate(path));
  }, [navigate]);

  return <Outlet />;
};

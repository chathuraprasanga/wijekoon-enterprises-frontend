import { useState } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm, type LoginFormValues } from '@/components/LoginForm';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/authSlice/authSlice';
import { toNotify } from '@/hooks/toNotify';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      const from = (location.state as { from?: Location } | null)?.from;
      navigate(from ? `${from.pathname}${from.search}` : '/app/dashboard', { replace: true });
    } catch (error) {
      toNotify('Login failed', error as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleSubmit} loading={loading} />;
};

export default LoginPage;

import { useState } from 'react';
import { type Location, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm, type LoginFormValues } from '@/components/LoginForm';
import { useAppDispatch } from '@/store/hooks';
import { login } from '@/store/authSlice/authSlice';

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      await dispatch(login(values)).unwrap();
      const from = (location.state as { from?: Location } | null)?.from;
      navigate(from ? `${from.pathname}${from.search}` : '/app/dashboard', { replace: true });
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  };

  return <LoginForm onSubmit={handleSubmit} loading={loading} error={error} />;
};

export default LoginPage;

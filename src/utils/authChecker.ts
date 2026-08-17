import { redirect } from 'react-router-dom';
import { store } from '@/store/store';

export const AuthLoaderChecker = () => {
  const { user } = store.getState().auth;
  if (!user) {
    return redirect('/login');
  }
  return null;
};

export const redirectIfAuthenticated = () => {
  const { user } = store.getState().auth;
  if (user) {
    return redirect('/app/dashboard');
  }
  return null;
};

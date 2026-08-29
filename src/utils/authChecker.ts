import { redirect } from 'react-router-dom';
import { store } from '@/store/store';
import { getCurrentUser, logOut, tokenRefresh } from '@/store/authSlice/authSlice';

const tryRehydrateSession = async () => {
  const { refreshToken } = store.getState().auth;
  if (!refreshToken) {
    return false;
  }
  try {
    await store.dispatch(tokenRefresh()).unwrap();
    await store.dispatch(getCurrentUser()).unwrap();
    return true;
  } catch {
    store.dispatch(logOut());
    return false;
  }
};

export const AuthLoaderChecker = async () => {
  const { user } = store.getState().auth;
  if (user) {
    return null;
  }
  return (await tryRehydrateSession()) ? null : redirect('/login');
};

export const redirectIfAuthenticated = async () => {
  const { user } = store.getState().auth;
  if (user) {
    return redirect('/app/dashboard');
  }
  return (await tryRehydrateSession()) ? redirect('/app/dashboard') : null;
};

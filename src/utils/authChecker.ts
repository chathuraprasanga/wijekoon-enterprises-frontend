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

const CHANGE_PASSWORD_PATH = '/change-password-required';

// A user still on a generated temporary password goes to the change-password screen first.
const signedInDestination = () =>
  store.getState().auth.user?.mustChangePassword ? CHANGE_PASSWORD_PATH : '/app/dashboard';

export const AuthLoaderChecker = async () => {
  if (!store.getState().auth.user && !(await tryRehydrateSession())) {
    return redirect('/login');
  }
  return store.getState().auth.user?.mustChangePassword ? redirect(CHANGE_PASSWORD_PATH) : null;
};

// For the change-password screen itself: needs a session, but never bounces to itself.
export const requireSession = async () => {
  if (!store.getState().auth.user && !(await tryRehydrateSession())) {
    return redirect('/login');
  }
  return store.getState().auth.user?.mustChangePassword ? null : redirect('/app/dashboard');
};

export const redirectIfAuthenticated = async () => {
  if (store.getState().auth.user || (await tryRehydrateSession())) {
    return redirect(signedInDestination());
  }
  return null;
};

import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useAppDispatch } from './store/hooks';
import { bootstrapAuthThunk } from './features/auth/authSlice';

export const App = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuthThunk());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

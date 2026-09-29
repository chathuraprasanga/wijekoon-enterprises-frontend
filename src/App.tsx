import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { DesktopOnlyGate } from '@/components/DesktopOnlyGate';

export const App = () => {
  return (
    <DesktopOnlyGate>
      <RouterProvider router={router} />
    </DesktopOnlyGate>
  );
};

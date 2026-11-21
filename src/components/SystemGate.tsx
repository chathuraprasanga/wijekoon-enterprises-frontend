import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Loader } from '@/components/Loader';
import SystemSetupRequiredPage from '@/pages/SystemSetupRequiredPage';
import { StatusPage } from '@/pages/errors/StatusPage';
import { SystemStatusContext } from '@/hooks/useSystemStatus';
import { fetchSystemStatus, type SystemStatus } from '@/utils/systemApi';

// Root of the app. Until the initial Super Admin exists only /create-super-admin is reachable; the
// server enforces the same rule (503 on every API), so this is presentation, never the protection.
export const SystemGate = () => {
  const { pathname } = useLocation();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [failed, setFailed] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setStatus(await fetchSystemStatus());
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    let live = true;
    fetchSystemStatus()
      .then((s) => live && setStatus(s))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  if (failed && !status) {
    return (
      <StatusPage
        code="Offline"
        title="Can't reach the server"
        actions={<Button onClick={() => void refresh()}>Try again</Button>}
      >
        The application couldn&apos;t contact the server. Check your connection and try again.
      </StatusPage>
    );
  }
  if (!status) return <Loader />;

  // The setup page decides what to show itself (form, or "already initialized").
  if (!status.initialized && pathname !== '/create-super-admin') {
    return <SystemSetupRequiredPage onRetry={refresh} />;
  }

  return (
    <SystemStatusContext.Provider value={{ status, refresh }}>
      <Outlet />
    </SystemStatusContext.Provider>
  );
};

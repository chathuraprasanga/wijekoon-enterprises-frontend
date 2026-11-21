import { createContext, useContext } from 'react';
import type { SystemStatus } from '@/utils/systemApi';

export type SystemStatusContextValue = { status: SystemStatus; refresh: () => Promise<void> };

export const SystemStatusContext = createContext<SystemStatusContextValue | null>(null);

export const useSystemStatus = () => {
  const ctx = useContext(SystemStatusContext);
  if (!ctx) throw new Error('useSystemStatus must be used inside <SystemGate>');
  return ctx;
};

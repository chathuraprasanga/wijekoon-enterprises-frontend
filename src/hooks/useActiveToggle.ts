import { useState } from 'react';
import { toNotify } from '@/hooks/toNotify';

// Shared activate/deactivate flow for detail dialogs: busy flag, toasts, and a callback with the new state.
export const useActiveToggle = <T extends { _id: string; isActive: boolean }>(
  label: string,
  update: (record: T) => Promise<{ isActive: boolean }>,
  onUpdated: (id: string, isActive: boolean) => void,
) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const toggle = async (record: T) => {
    setBusyId(record._id);
    try {
      const updated = await update(record);
      toNotify('Updated', `${label} ${record.isActive ? 'deactivated' : 'activated'}.`, 'SUCCESS');
      onUpdated(record._id, updated.isActive);
    } catch (error) {
      toNotify(`Couldn't update ${label.toLowerCase()}`, error as string, 'ERROR');
    } finally {
      setBusyId(null);
    }
  };

  return { toggle, busyId };
};

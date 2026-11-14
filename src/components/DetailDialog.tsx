import type { ReactNode } from 'react';
import { Box, Button, Group } from '@mantine/core';
import { ResponsiveModal } from '@/components/ResponsiveModal';

type Props = {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Primary actions shown beside Close (e.g. Edit). */
  actions?: ReactNode;
  children: ReactNode;
};

// Record details: header with subtitle, scrolling body, Close + primary action footer.
export const DetailDialog = ({ opened, onClose, title, subtitle, actions, children }: Props) => (
  <ResponsiveModal opened={opened} onClose={onClose} title={title} subtitle={subtitle} width={540}>
    <Box p={20} style={{ maxHeight: '65dvh', overflowY: 'auto' }}>
      {children}
    </Box>
    <Group className="sheet-footer" justify="flex-end" px={20} py={12} gap="xs">
      <Button variant="default" onClick={onClose}>
        Close
      </Button>
      {actions}
    </Group>
  </ResponsiveModal>
);

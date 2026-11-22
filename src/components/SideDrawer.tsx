import type { ReactNode } from 'react';
import { Drawer } from '@mantine/core';

type Props = { opened: boolean; onClose: () => void; title: ReactNode; children: ReactNode };

// Right-hand drawer, used ONLY by the notification bell and "My activity". Everything else in the
// app is a modal (ResponsiveModal / FormModal) on purpose.
export const SideDrawer = ({ opened, onClose, title, children }: Props) => (
  <Drawer
    opened={opened}
    onClose={onClose}
    position="right"
    size={520}
    title={title}
    transitionProps={{ transition: 'slide-left', duration: 200 }}
    styles={{
      content: { maxWidth: '100vw' }, // full width on phones
      title: { fontWeight: 600, fontSize: 18 },
      body: { padding: 0 },
      close: { color: 'var(--ldg-accent-text)' },
    }}
  >
    {children}
  </Drawer>
);

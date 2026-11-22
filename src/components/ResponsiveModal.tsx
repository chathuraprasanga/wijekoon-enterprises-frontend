import type { ComponentProps, ReactNode } from 'react';
import { Modal, Stack, Text } from '@mantine/core';

type Props = Omit<ComponentProps<typeof Modal>, 'title'> & {
  title: ReactNode;
  /** Muted line under the title (record name, id, "since …"). */
  subtitle?: ReactNode;
  width?: number;
};

// Always a centered dialog (never a side/bottom sheet); full width minus margins on phones.
export const ResponsiveModal = ({ title, subtitle, width = 520, children, ...rest }: Props) => {
  return (
    <Modal
      {...rest}
      size={width}
      title={
        subtitle ? (
          <Stack gap={0}>
            <Text fw={600} fz={18} lh={1.3}>
              {title}
            </Text>
            <Text size="sm" c="dimmed" fw={400}>
              {subtitle}
            </Text>
          </Stack>
        ) : (
          title
        )
      }
      centered
      transitionProps={{ transition: 'fade', duration: 200 }}
      styles={{
        close: { color: 'var(--ldg-accent-text)' },
      }}
    >
      {children}
    </Modal>
  );
};

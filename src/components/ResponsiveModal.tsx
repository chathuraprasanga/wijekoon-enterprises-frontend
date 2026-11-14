import type { ComponentProps, ReactNode } from 'react';
import { Modal, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

type Props = Omit<ComponentProps<typeof Modal>, 'title'> & {
  title: ReactNode;
  /** Muted line under the title (record name, id, "since …"). */
  subtitle?: ReactNode;
  width?: number;
};

// Centered dialog on desktop; a bottom sheet with rounded top corners on phones.
export const ResponsiveModal = ({ title, subtitle, width = 520, children, ...rest }: Props) => {
  const sheet = useMediaQuery('(max-width: 47.99em)');

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
      centered={!sheet}
      transitionProps={{ transition: sheet ? 'slide-up' : 'fade', duration: 200 }}
      styles={{
        inner: sheet ? { alignItems: 'flex-end', padding: 0 } : undefined,
        content: sheet
          ? { width: '100%', maxWidth: '100%', borderRadius: '12px 12px 0 0', maxHeight: '92dvh' }
          : undefined,
        close: { color: 'var(--ldg-accent-text)' },
      }}
    >
      {children}
    </Modal>
  );
};

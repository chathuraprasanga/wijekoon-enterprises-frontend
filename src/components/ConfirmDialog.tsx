import type { ReactNode } from 'react';
import { Box, Button, Group, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { ResponsiveModal } from '@/components/ResponsiveModal';

type Props = {
  opened: boolean;
  title: string;
  /** Name the record and say what happens next. */
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive confirmations get the red button. */
  destructive?: boolean;
  /** Trash icon on the confirm button (deletes only). */
  trashIcon?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export const ConfirmDialog = ({
  opened,
  title,
  children,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  trashIcon = destructive,
  loading,
  onConfirm,
  onClose,
}: Props) => (
  <ResponsiveModal
    opened={opened}
    onClose={onClose}
    title={title}
    width={480}
    closeOnClickOutside={!loading}
  >
    <Box px={20} py={16}>
      <Text size="md">{children}</Text>
    </Box>
    <Group className="sheet-footer" justify="flex-end" px={20} py={12} gap="xs">
      <Button variant="default" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button
        color={destructive ? 'red' : undefined}
        leftSection={trashIcon ? <IconTrash size={16} aria-hidden /> : undefined}
        loading={loading}
        onClick={onConfirm}
      >
        {confirmLabel}
      </Button>
    </Group>
  </ResponsiveModal>
);

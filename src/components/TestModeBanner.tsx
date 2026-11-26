import { Group, Text } from '@mantine/core';
import { IconFlask } from '@tabler/icons-react';
import { formatDateTime } from '@/utils/format';

type Props = { expiresAt?: string | null };

const daysLeft = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

/** Shown at the top of every page while a test user is signed in. */
export const TestModeBanner = ({ expiresAt }: Props) => {
  const left = expiresAt ? daysLeft(expiresAt) : null;
  return (
    <Group
      role="status"
      gap={8}
      px="md"
      justify="center"
      wrap="nowrap"
      style={{
        height: 32,
        background: 'var(--ldg-warning-subtle)',
        borderBottom: '1px solid var(--ldg-warning-border)',
        color: 'var(--ldg-warning-text)',
      }}
    >
      <IconFlask size={16} aria-hidden style={{ flex: 'none' }} />
      <Text size="sm" fw={600} truncate>
        Test mode
        <Text span visibleFrom="sm" inherit fw={400}>
          {' '}
          · sample data, nothing here affects real records
        </Text>
        {expiresAt && (
          <Text span inherit fw={400}>
            {' '}
            · expires {formatDateTime(expiresAt)}
            {left != null && left >= 0 && left <= 7
              ? ` (${left <= 0 ? 'today' : `${left}d left`})`
              : ''}
          </Text>
        )}
      </Text>
    </Group>
  );
};

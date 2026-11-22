import { useEffect, useState } from 'react';
import { Alert, Anchor, Box, Button, Drawer, Group, Loader, Stack, Text } from '@mantine/core';
import { EmptyState } from '@/components/EmptyState';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDateTime } from '@/utils/format';
import { timeAgo } from '@/utils/timeAgo';

type Entry = { _id: string; action: string; description: string; createdAt: string };
type Paged = { data: Entry[]; page: number; totalPages: number; total: number };

// "My activity": the signed-in user's own audit entries, newest first, 10 at a time.
const Panel = () => {
  const [items, setItems] = useState<Entry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = (p: number, data: Paged) => {
    setItems((prev) => (p === 1 ? data.data : [...prev, ...data.data]));
    setPage(data.page);
    setTotalPages(data.totalPages);
  };
  const fetchPage = (p: number) =>
    axiosInstance
      .get<Paged>('/audit-logs/paged', { params: { page: p, limit: 10 } })
      .then(({ data }) => {
        apply(p, data);
        setError('');
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  const load = (p: number) => {
    setLoading(true);
    void fetchPage(p);
  };

  // Mounted only while the drawer is open, so it starts loading and fetches once.
  useEffect(() => {
    let live = true;
    axiosInstance
      .get<Paged>('/audit-logs/paged', { params: { page: 1, limit: 10 } })
      .then(({ data }) => live && apply(1, data))
      .catch((e) => live && setError(getErrorMessage(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, []);

  return (
    <Box p={20} style={{ height: '100%', overflowY: 'auto' }}>
      <Stack gap={0}>
        {error && (
          <Alert color="red" mb="sm">
            {error}{' '}
            <Anchor component="button" onClick={() => load(1)}>
              Retry
            </Anchor>
          </Alert>
        )}
        {!loading && !error && items.length === 0 && (
          <EmptyState title="No activity yet" description="Your actions appear here." />
        )}
        {items.map((e) => (
          <Box key={e._id} py="sm" style={{ borderBottom: '1px solid var(--ldg-border)' }}>
            <Text size="sm" fw={500}>
              {e.description}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {timeAgo(e.createdAt)} · {formatDateTime(e.createdAt)}
            </Text>
          </Box>
        ))}
        {loading && (
          <Group justify="center" py="md">
            <Loader size="sm" />
          </Group>
        )}
        {!loading && page < totalPages && (
          <Button variant="default" mt="sm" onClick={() => load(page + 1)}>
            Load more
          </Button>
        )}
      </Stack>
    </Box>
  );
};

type Props = { opened: boolean; onClose: () => void };

export const ActivityDrawer = ({ opened, onClose }: Props) => (
  <Drawer
    opened={opened}
    onClose={onClose}
    position="right"
    size={440}
    styles={{ content: { maxWidth: '100%' } }}
    title="My activity"
  >
    <Panel />
  </Drawer>
);

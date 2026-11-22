import { useCallback, useEffect, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Anchor,
  Box,
  Button,
  Drawer,
  Group,
  Indicator,
  Loader,
  Stack,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconArrowLeft, IconBell } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDateTime } from '@/utils/format';
import { timeAgo } from '@/utils/timeAgo';

type Notice = { _id: string; title: string; message: string; isRead: boolean; createdAt: string };
type Paged = { data: Notice[]; page: number; totalPages: number; unreadCount: number };

const POLL_MS = 60_000;
const PAGE = 10;

// Bell with an unread badge (refreshed every minute) and a drawer: paged list, open one to read it,
// "Mark all read".
export const NotificationsBell = () => {
  const [opened, { open, close }] = useDisclosure();
  const [items, setItems] = useState<Notice[]>([]);
  const [unread, setUnread] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [current, setCurrent] = useState<Notice | null>(null);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosInstance.get<Paged>('/notifications/paged', {
        params: { page: p, limit: PAGE },
      });
      setItems((prev) => (p === 1 ? data.data : [...prev, ...data.data]));
      setPage(data.page);
      setTotalPages(data.totalPages);
      setUnread(data.unreadCount);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  // Badge: poll the first page's unread count.
  useEffect(() => {
    const tick = () =>
      axiosInstance
        .get<Paged>('/notifications/paged', { params: { page: 1, limit: 1 } })
        .then(({ data }) => setUnread(data.unreadCount))
        .catch(() => undefined);
    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const show = () => {
    setCurrent(null);
    open();
    void load(1);
  };

  const read = async (n: Notice) => {
    setCurrent(n);
    if (n.isRead) return;
    try {
      const { data } = await axiosInstance.get<Notice>(`/notifications/${n._id}`);
      setCurrent(data);
      setItems((prev) => prev.map((i) => (i._id === n._id ? { ...i, isRead: true } : i)));
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* the text is already shown; it just stays unread */
    }
  };

  const markAll = async () => {
    try {
      await axiosInstance.patch('/notifications/read-all');
      setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
      setUnread(0);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <>
      <Indicator label={unread > 99 ? '99+' : unread} disabled={unread === 0} size={16} color="red">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={show}
          aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        >
          <IconBell size={20} aria-hidden />
        </ActionIcon>
      </Indicator>
      <Drawer
        opened={opened}
        onClose={close}
        position="right"
        size={440}
        title="Notifications"
        styles={{ content: { maxWidth: '100%' } }}
      >
        <Box p={20} style={{ height: '100%', overflowY: 'auto' }}>
          {current ? (
            <Stack gap="sm">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => setCurrent(null)}
                w="fit-content"
              >
                Back to list
              </Button>
              <Text fw={600} size="lg">
                {current.title}
              </Text>
              <Text size="sm" c="dimmed">
                {formatDateTime(current.createdAt)}
              </Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{current.message}</Text>
            </Stack>
          ) : (
            <Stack gap={0}>
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed">
                  {unread ? `${unread} unread` : 'All caught up'}
                </Text>
                <Anchor component="button" size="sm" onClick={markAll} disabled={unread === 0}>
                  Mark all read
                </Anchor>
              </Group>
              {error && (
                <Alert color="red" mb="sm">
                  {error}{' '}
                  <Anchor component="button" onClick={() => load(1)}>
                    Retry
                  </Anchor>
                </Alert>
              )}
              {!loading && !error && items.length === 0 && (
                <EmptyState title="No notifications" description="You're all caught up." />
              )}
              {items.map((n) => (
                <UnstyledButton
                  key={n._id}
                  onClick={() => read(n)}
                  py="sm"
                  w="100%"
                  style={{ borderBottom: '1px solid var(--ldg-border)', textAlign: 'left' }}
                  aria-label={`${n.isRead ? '' : 'Unread. '}${n.title}`}
                >
                  <Group wrap="nowrap" align="flex-start" gap="sm">
                    <Box
                      mt={6}
                      w={8}
                      h={8}
                      style={{
                        flex: 'none',
                        borderRadius: '50%',
                        background: n.isRead ? 'transparent' : 'var(--ldg-accent)',
                      }}
                    />
                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Text size="sm" fw={n.isRead ? 400 : 600} lineClamp={1}>
                        {n.title}
                      </Text>
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {n.message}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {timeAgo(n.createdAt)}
                      </Text>
                    </Box>
                  </Group>
                </UnstyledButton>
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
          )}
        </Box>
      </Drawer>
    </>
  );
};

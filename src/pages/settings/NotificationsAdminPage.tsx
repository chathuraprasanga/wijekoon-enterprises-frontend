import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Group, Loader, ScrollArea, Stack, Text } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import { DetailDialog } from '@/components/DetailDialog';
import { ListPage, type LoadParams } from '@/components/data/ListPage';
import { StatusBadge } from '@/components/StatusBadge';
import { SendNotificationModal } from './SendNotificationModal';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';

type SentNotification = {
  key: string;
  title: string;
  message: string;
  /** 'Administrator' when sent by hand, 'System' for automatic due reminders. */
  source?: string;
  createdAt: string;
  recipients: number;
  opened: number;
  lastOpenedAt?: string;
  /** Only when there is exactly one recipient. */
  user?: { _id: string; name: string; email: string };
};
type Recipient = { _id: string; name: string; email: string; isRead: boolean; readAt?: string };
type Group = Omit<SentNotification, 'recipients' | 'opened' | 'user' | 'lastOpenedAt'> & {
  recipients: Recipient[];
};

const when = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const startOfDay = (ymd: string) => new Date(`${ymd}T00:00:00`);
const nextDay = (ymd: string) => {
  const d = startOfDay(ymd);
  d.setDate(d.getDate() + 1);
  return d;
};

const Opened = ({ n }: { n: SentNotification }) =>
  n.recipients === 1 ? (
    <StatusBadge
      tone={n.opened ? 'success' : 'warning'}
      label={n.opened ? 'Opened' : 'Not opened'}
    />
  ) : (
    <StatusBadge
      tone={n.opened === n.recipients ? 'success' : 'warning'}
      label={`${n.opened} of ${n.recipients} opened`}
    />
  );

const to = (n: SentNotification) =>
  n.recipients === 1 && n.user ? `${n.user.name} · ${n.user.email}` : `${n.recipients} people`;

// Who got it and when each person opened it. Keyed by the notification, so state resets per row.
const Recipients = ({ id }: { id: string }) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let live = true;
    axiosInstance
      .get<Group>('/notifications/admin/group', { params: { key: id } })
      .then(({ data }) => live && setGroup(data))
      .catch((e) => live && setError(getErrorMessage(e)));
    return () => {
      live = false;
    };
  }, [id]);

  if (error) return <Alert color="red">{error}</Alert>;
  if (!group) return <Loader size="sm" />;
  return (
    <Box>
      <Text className="eyebrow" mb="xs">
        Recipients ({group.recipients.length})
      </Text>
      <ScrollArea.Autosize mah={280} type="auto">
        <Stack gap={0}>
          {group.recipients.map((r) => (
            <Group
              key={r._id}
              justify="space-between"
              wrap="nowrap"
              align="flex-start"
              py={8}
              style={{ borderBottom: '1px solid var(--ldg-border)' }}
            >
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" truncate>
                  {r.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {r.email}
                </Text>
              </Box>
              <Stack gap={2} align="flex-end" style={{ flex: 'none' }}>
                <StatusBadge
                  tone={r.isRead ? 'success' : 'warning'}
                  label={r.isRead ? 'Opened' : 'Not opened'}
                />
                <Text size="xs" c="dimmed" className="num">
                  {when(r.readAt)}
                </Text>
              </Stack>
            </Group>
          ))}
        </Stack>
      </ScrollArea.Autosize>
    </Box>
  );
};

const NotificationDetail = ({
  row,
  onClose,
}: {
  row: SentNotification | null;
  onClose: () => void;
}) => (
  <DetailDialog
    opened={!!row}
    onClose={onClose}
    title={row?.title ?? ''}
    subtitle={row ? `${when(row.createdAt)} · ${row.source ?? 'System'}` : undefined}
  >
    {row && (
      <Stack gap="md">
        <Text style={{ whiteSpace: 'pre-wrap' }}>{row.message}</Text>
        <Recipients key={row.key} id={row.key} />
      </Stack>
    )}
  </DetailDialog>
);

// Settings > Notifications (super admin only): every notification sent to anyone, and whether it was opened.
const NotificationsAdminPage = () => {
  const [items, setItems] = useState<SentNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<SentNotification | null>(null);
  const [sending, setSending] = useState(false);

  const load = useCallback(
    async ({ page, limit, searchText, sortBy, sortType, filters }: LoadParams) => {
      try {
        const { data } = await axiosInstance.get<{ data: SentNotification[]; total: number }>(
          '/notifications/admin/paged',
          {
            params: {
              page,
              limit,
              searchText,
              sortBy,
              sortType,
              read: filters.read || undefined,
              from: filters.from ? startOfDay(filters.from).toISOString() : undefined,
              to: filters.to ? nextDay(filters.to).toISOString() : undefined,
            },
          },
        );
        setItems(data.data);
        setTotal(data.total);
      } catch (e) {
        throw getErrorMessage(e);
      }
    },
    [],
  );

  return (
    <ListPage<SentNotification>
      embedded
      title="Notifications"
      description="Everything the system sent to people, and whether they opened it."
      entity={{ singular: 'notification', plural: 'notifications' }}
      searchPlaceholder="Search the title or message"
      filters={[
        {
          type: 'select',
          key: 'read',
          label: 'Status',
          placeholder: 'Any status',
          options: [
            { value: 'true', label: 'Opened by everyone' },
            { value: 'false', label: 'Not opened by everyone' },
          ],
        },
        { type: 'dateRange', fromKey: 'from', toKey: 'to', label: 'Sent', placeholder: 'Any date' },
      ]}
      records={items}
      total={total}
      rowKey={(n) => n.key}
      rowName={(n) => n.title}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      load={load}
      onView={setView}
      onCreate={() => setSending(true)}
      createLabel="Send notification"
      emptyDescription="Notifications appear here as the system sends them."
      emptyIcon={<IconBell size={20} />}
      columns={[
        {
          key: 'createdAt',
          header: 'Sent at',
          primary: true,
          sortable: true,
          render: (n) => <span className="num">{when(n.createdAt)}</span>,
        },
        {
          key: 'user',
          header: 'To',
          render: (n) =>
            n.user ? (
              <>
                <Text size="sm">{n.user.name}</Text>
                <Text size="xs" c="dimmed">
                  {n.user.email}
                </Text>
              </>
            ) : (
              <Text size="sm">{to(n)}</Text>
            ),
        },
        {
          key: 'source',
          header: 'From',
          hideBelow: 'md',
          render: (n) => n.source ?? 'System',
        },
        { key: 'title', header: 'Title', sortable: true, render: (n) => n.title },
        {
          key: 'message',
          header: 'Message',
          hideBelow: 'md',
          render: (n) => (
            <Text size="sm" lineClamp={2} maw={360}>
              {n.message}
            </Text>
          ),
        },
        { key: 'opened', header: 'Opened', badge: true, render: (n) => <Opened n={n} /> },
        {
          key: 'lastOpenedAt',
          header: 'Last opened at',
          sortable: true,
          hideBelow: 'md',
          render: (n) => <span className="num">{when(n.lastOpenedAt)}</span>,
        },
      ]}
    >
      {({ reload }) => (
        <>
          {sending && <SendNotificationModal onClose={() => setSending(false)} onSent={reload} />}
          <NotificationDetail row={view} onClose={() => setView(null)} />
        </>
      )}
    </ListPage>
  );
};

export default NotificationsAdminPage;

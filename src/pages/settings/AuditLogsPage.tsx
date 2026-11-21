import { useCallback, useEffect, useState } from 'react';
import { Text } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { ListPage, type LoadParams } from '@/components/data/ListPage';
import { StatusBadge } from '@/components/StatusBadge';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { AuditDetailDialog } from './AuditDetailDialog';

type AuditUser = {
  _id: string | null;
  firstName: string;
  lastName?: string | null;
  email: string;
  type?: string;
};
type AuditEntry = {
  _id: string;
  action: string;
  operation: string;
  module: string;
  entity: string | null;
  entityId: string | null;
  status: 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: string;
  user: AuditUser | null;
};
type FilterData = {
  users: { _id: string; firstName: string; lastName?: string | null }[];
  actions: string[];
  modules: string[];
  operations: string[];
  statuses: string[];
};
const EMPTY_FILTERS: FilterData = {
  users: [],
  actions: [],
  modules: [],
  operations: [],
  statuses: [],
};

const nameOf = (u: { firstName: string; lastName?: string | null }) =>
  `${u.firstName} ${u.lastName ?? ''}`.trim();

// "CUSTOMER_CREATED" -> "Customer created"
const actionLabel = (a: string) => {
  const s = a.toLowerCase().replace(/_/g, ' ');
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};

const startOfDay = (ymd: string) => new Date(`${ymd}T00:00:00`);
const nextDay = (ymd: string) => {
  const d = startOfDay(ymd);
  d.setDate(d.getDate() + 1);
  return d;
};

// Settings > Audit logs: everyone's activity (needs audit-log:read). Filter by person, action and a
// date range (pick the same day twice for a single day); the server never includes the super admin.
const AuditLogsPage = () => {
  const [items, setItems] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [viewId, setViewId] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<FilterData>(EMPTY_FILTERS);

  useEffect(() => {
    let live = true;
    axiosInstance
      .get<FilterData>('/audit-logs/filters')
      .then(({ data }) => live && setFilterData(data))
      .catch(() => undefined); // the filters just stay empty; the list reports its own errors
    return () => {
      live = false;
    };
  }, []);

  const load = useCallback(async ({ page, limit, searchText, sortType, filters }: LoadParams) => {
    try {
      const { data } = await axiosInstance.get<{ data: AuditEntry[]; total: number }>(
        '/audit-logs/all',
        {
          params: {
            page,
            limit,
            searchText,
            sortType,
            module: filters.module || undefined,
            operation: filters.operation || undefined,
            status: filters.status || undefined,
            user: filters.user || undefined,
            action: filters.action || undefined,
            // inclusive day range: from the start of "from" to the start of the day after "to"
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
  }, []);

  return (
    <ListPage<AuditEntry>
      embedded
      title="Audit logs"
      description="What people did, newest first."
      entity={{ singular: 'entry', plural: 'entries' }}
      searchPlaceholder="Search the description"
      filters={[
        {
          type: 'select',
          key: 'user',
          label: 'User',
          placeholder: 'All users',
          options: filterData.users.map((u) => ({ value: u._id, label: nameOf(u) })),
        },
        {
          type: 'select',
          key: 'action',
          label: 'Action',
          placeholder: 'All actions',
          options: filterData.actions.map((a) => ({ value: a, label: actionLabel(a) })),
        },
        {
          type: 'select',
          key: 'module',
          label: 'Module',
          placeholder: 'All modules',
          options: filterData.modules.map((m) => ({ value: m, label: m })),
        },
        {
          type: 'select',
          key: 'status',
          label: 'Status',
          placeholder: 'Any status',
          options: filterData.statuses.map((m) => ({ value: m, label: actionLabel(m) })),
        },
        {
          type: 'dateRange',
          fromKey: 'from',
          toKey: 'to',
          label: 'Date range',
          placeholder: 'Any date',
        },
      ]}
      records={items}
      total={total}
      rowKey={(e) => e._id}
      rowName={(e) => e.description}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      load={load}
      onView={(e) => setViewId(e._id)}
      emptyDescription="Activity appears here as people sign in and work."
      emptyIcon={<IconHistory size={20} />}
      columns={[
        {
          key: 'createdAt',
          header: 'When',
          primary: true,
          sortable: true,
          render: (e) => (
            <span className="num">
              {new Date(e.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          ),
        },
        {
          key: 'user',
          header: 'User',
          render: (e) =>
            e.user ? (
              <>
                <Text size="sm">{nameOf(e.user)}</Text>
                <Text size="xs" c="dimmed">
                  {e.user.email}
                </Text>
              </>
            ) : (
              <Text size="sm" c="dimmed">
                Unknown
              </Text>
            ),
        },
        {
          key: 'action',
          header: 'Action',
          badge: true,
          hideBelow: 'md',
          render: (e) => <StatusBadge tone="neutral" label={actionLabel(e.action)} />,
        },
        { key: 'module', header: 'Module', hideBelow: 'md', render: (e) => e.module },
        {
          key: 'entity',
          header: 'Entity',
          hideBelow: 'md',
          render: (e) => e.entity ?? '—',
        },
        { key: 'description', header: 'Description', render: (e) => e.description },
        {
          key: 'status',
          header: 'Status',
          badge: true,
          render: (e) => (
            <StatusBadge
              tone={e.status === 'FAILED' ? 'danger' : 'success'}
              label={e.status === 'FAILED' ? 'Failed' : 'Success'}
            />
          ),
        },
      ]}
    >
      {() => <AuditDetailDialog id={viewId} onClose={() => setViewId(null)} />}
    </ListPage>
  );
};

export default AuditLogsPage;

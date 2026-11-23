import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Pagination,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import {
  IconEye,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { PageHeader } from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { DataTable, type Column } from '@/components/data/DataTable';
import { ListToolbar, type FilterField } from '@/components/data/ListToolbar';
import { filterKeys } from '@/components/data/filterKeys';
import { PAGE_SIZES, useListQuery, type SortDir } from '@/hooks/useListQuery';
import { toNotify } from '@/hooks/toNotify';

export type LoadParams = {
  page: number;
  limit: number;
  searchText?: string;
  sortBy: string;
  sortType: SortDir;
  filters: Record<string, string | undefined>;
};

type DeleteConfig<T> = {
  title: string;
  describe: (record: T) => ReactNode;
  run: (record: T) => Promise<unknown>;
  /** Shown in the success toast. */
  done: string;
};

type Props<T> = {
  title: string;
  description: string;
  entity: { singular: string; plural: string };
  searchPlaceholder: string;
  filters?: FilterField[];
  columns: Column<T>[];
  records: T[];
  total: number;
  rowKey: (record: T) => string;
  /** Visible name of a row, for button labels. */
  rowName: (record: T) => string;
  defaultSort: { key: string; dir: SortDir };
  /** Maps a column key to the API's sort field when they differ. */
  sortMap?: Record<string, string>;
  load: (params: LoadParams) => Promise<unknown>;
  createLabel?: string;
  /** Replaces the + on the create button. */
  createIcon?: ReactNode;
  /** First-use empty state: what to add and why. */
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  /** Inside another page (e.g. a Settings tab): no page header of its own. */
  embedded?: boolean;
  onCreate?: () => void;
  /** Adds a Refresh button next to the primary action; reloads without resetting filters or page. */
  refreshable?: boolean;
  /** Extra buttons in the page header, after the primary action. */
  extraActions?: ReactNode;
  /** Shown at the left of the count row inside the card (e.g. a view toggle). */
  leading?: ReactNode;
  onView?: (record: T) => void;
  onEdit?: (record: T) => void;
  remove?: DeleteConfig<T>;
  /** Hide Edit / Delete on rows where they don't apply (default: shown on every row). */
  rowCanEdit?: (record: T) => boolean;
  rowCanRemove?: (record: T) => boolean;
  /** Overlays (forms, dialogs) that may need to refresh the list. */
  children?: (ctx: { reload: () => void }) => ReactNode;
};

export const ListPage = <T,>({
  title,
  description,
  entity,
  searchPlaceholder,
  filters = [],
  columns,
  records,
  total,
  rowKey,
  rowName,
  defaultSort,
  sortMap,
  load,
  createLabel,
  createIcon,
  emptyDescription,
  emptyIcon,
  embedded,
  onCreate,
  extraActions,
  leading,
  refreshable,
  onView,
  onEdit,
  remove,
  rowCanEdit,
  rowCanRemove,
  children,
}: Props<T>) => {
  const { query, setPage, setSize, setSort, applyFilters, clear, hasFilters } = useListQuery({
    filterKeys: filters.flatMap(filterKeys),
    defaultSort,
    sortableKeys: columns.filter((c) => c.sortable).map((c) => c.key),
  });
  const [density, setDensity] = useLocalStorage<'comfortable' | 'dense'>({
    key: 'ldg-density',
    defaultValue: 'comfortable',
  });
  const [nonce, setNonce] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);
  const slot = useOutletContext<{ actionSlot: HTMLElement | null } | null>()?.actionSlot ?? null;
  const requestId = useRef(0);
  const loadRef = useRef(load);
  // Keep the latest loader in a ref without re-running the fetch effect when it changes identity.
  useEffect(() => {
    loadRef.current = load;
  });

  useEffect(() => {
    const id = ++requestId.current;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadRef.current({
          page: query.page,
          limit: query.size,
          searchText: query.q || undefined,
          sortBy: sortMap?.[query.sort] ?? query.sort,
          sortType: query.dir,
          filters: Object.fromEntries(
            Object.entries(query.filters).map(([k, v]) => [k, v || undefined]),
          ),
        });
      } catch (e) {
        if (id === requestId.current) setError(typeof e === 'string' ? e : 'Please try again.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    };
    void run();
  }, [query, sortMap, nonce]);

  const reload = () => setNonce((n) => n + 1);

  const handleDelete = async () => {
    if (!toDelete || !remove) return;
    setDeleting(true);
    try {
      await remove.run(toDelete);
      toNotify('Deleted', remove.done, 'SUCCESS');
      setToDelete(null);
      reload();
    } catch (e) {
      toNotify(`Couldn't delete ${entity.singular}`, e as string, 'ERROR');
    } finally {
      setDeleting(false);
    }
  };

  const showActions = onView || onEdit || remove;
  const totalPages = Math.max(1, Math.ceil(total / query.size));
  const from = total === 0 ? 0 : (query.page - 1) * query.size + 1;
  const to = Math.min(total, query.page * query.size);
  const noResults = !loading && !error && records.length === 0;
  const headerActions = (
    <Group gap="xs" wrap="nowrap">
      {refreshable && (
        <Button
          variant="default"
          leftSection={<IconRefresh size={16} aria-hidden />}
          loading={loading}
          onClick={reload}
        >
          Refresh
        </Button>
      )}
      {onCreate && (
        <Button leftSection={createIcon ?? <IconPlus size={16} aria-hidden />} onClick={onCreate}>
          {createLabel}
        </Button>
      )}
      {extraActions}
    </Group>
  );

  return (
    <>
      {embedded ? (
        (onCreate || refreshable || extraActions) && slot && createPortal(headerActions, slot)
      ) : (
        <PageHeader
          title={title}
          description={description}
          action={onCreate || refreshable || extraActions ? headerActions : undefined}
        />
      )}
      <Box
        style={{
          background: 'var(--ldg-surface-raised)',
          border: '1px solid var(--ldg-border)',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Stack gap="sm" p="md">
          <ListToolbar
            key={JSON.stringify([query.q, query.filters])}
            searchPlaceholder={searchPlaceholder}
            filters={filters}
            q={query.q}
            values={query.filters}
            hasFilters={hasFilters}
            disabled={loading && records.length === 0}
            onApply={applyFilters}
            onClear={clear}
          />
          <Group justify="space-between" gap="sm">
            <Group gap="sm">
              {leading}
              <Text size="sm" c="dimmed" aria-live="polite">
                {loading
                  ? 'Loading…'
                  : `${total.toLocaleString('en-US')} ${total === 1 ? entity.singular : entity.plural}`}
              </Text>
            </Group>
            <SegmentedControl
              visibleFrom="sm"
              size="xs"
              aria-label="Row density"
              value={density}
              onChange={(v) => setDensity(v as 'comfortable' | 'dense')}
              data={[
                { value: 'comfortable', label: 'Comfortable' },
                { value: 'dense', label: 'Dense' },
              ]}
            />
          </Group>
        </Stack>
        <Box style={{ borderTop: '1px solid var(--ldg-border)' }}>
          {error ? (
            <Stack gap="sm" p="md">
              <InlineAlert
                tone="danger"
                title={`${entity.plural[0].toUpperCase()}${entity.plural.slice(1)} couldn't be loaded`}
              >
                {error.startsWith('Something went wrong')
                  ? "We couldn't reach the server."
                  : error.replace(/\.?$/, '.')}{' '}
                Your changes are safe. Try again, or check your connection.
              </InlineAlert>
              <Group>
                <Button leftSection={<IconRefresh size={16} aria-hidden />} onClick={reload}>
                  Try again
                </Button>
              </Group>
            </Stack>
          ) : noResults ? (
            <EmptyState
              icon={hasFilters ? <IconSearch size={20} /> : emptyIcon}
              title={
                query.q
                  ? `No ${entity.plural} match "${query.q}"`
                  : hasFilters
                    ? `No ${entity.plural} match these filters`
                    : `No ${entity.plural} yet`
              }
              description={
                hasFilters
                  ? `Check the spelling, try a different term, or clear ${query.q ? 'the search' : 'the filters'} to see all ${entity.plural}.`
                  : (emptyDescription ?? `Add your first ${entity.singular} to get started.`)
              }
              action={
                hasFilters ? (
                  <Button
                    variant="default"
                    leftSection={<IconX size={16} aria-hidden />}
                    onClick={clear}
                  >
                    {query.q ? 'Clear search' : 'Clear filters'}
                  </Button>
                ) : (
                  onCreate && (
                    <Button leftSection={<IconPlus size={16} aria-hidden />} onClick={onCreate}>
                      {createLabel}
                    </Button>
                  )
                )
              }
            />
          ) : (
            <DataTable
              caption={title}
              columns={columns}
              records={records}
              rowKey={rowKey}
              loading={loading}
              skeletonRows={Math.min(query.size, 6)}
              sort={{ key: query.sort, dir: query.dir }}
              onSort={setSort}
              rowHeight={density === 'dense' ? 40 : 52}
              cardActions={
                showActions
                  ? (r) => (
                      <Group gap="xs" wrap="nowrap">
                        {onView && (
                          <Button
                            variant="default"
                            flex={1}
                            leftSection={<IconEye size={16} aria-hidden />}
                            onClick={() => onView(r)}
                            aria-label={`View ${rowName(r)}`}
                          >
                            View
                          </Button>
                        )}
                        {onEdit && (rowCanEdit?.(r) ?? true) && (
                          <Button
                            variant="default"
                            flex={1}
                            leftSection={<IconPencil size={16} aria-hidden />}
                            onClick={() => onEdit(r)}
                            aria-label={`Edit ${rowName(r)}`}
                          >
                            Edit
                          </Button>
                        )}
                        {remove && (rowCanRemove?.(r) ?? true) && (
                          <ActionIcon
                            size={42}
                            c="var(--ldg-accent-text)"
                            aria-label={`Delete ${rowName(r)}`}
                            onClick={() => setToDelete(r)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        )}
                      </Group>
                    )
                  : undefined
              }
              rowActions={
                showActions
                  ? (r) => (
                      <Group gap={4} justify="flex-end" wrap="nowrap">
                        {onView && (
                          <Tooltip label="View">
                            <ActionIcon
                              variant="subtle"
                              aria-label={`View ${rowName(r)}`}
                              onClick={() => onView(r)}
                            >
                              <IconEye size={18} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {onEdit && (rowCanEdit?.(r) ?? true) && (
                          <Tooltip label="Edit">
                            <ActionIcon
                              variant="subtle"
                              aria-label={`Edit ${rowName(r)}`}
                              onClick={() => onEdit(r)}
                            >
                              <IconPencil size={18} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {remove && (rowCanRemove?.(r) ?? true) && (
                          <Tooltip label="Delete">
                            <ActionIcon
                              variant="subtle"
                              c="var(--ldg-accent-text)"
                              aria-label={`Delete ${rowName(r)}`}
                              onClick={() => setToDelete(r)}
                            >
                              <IconTrash size={18} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    )
                  : undefined
              }
            />
          )}
        </Box>
        {total > 0 && !error && (
          <Group
            justify="space-between"
            p="md"
            gap="sm"
            style={{ borderTop: '1px solid var(--ldg-border)' }}
          >
            <Text size="sm" c="dimmed" className="num">
              Showing {from}–{to} of {total.toLocaleString('en-US')}
            </Text>
            <Group gap="md" wrap="wrap">
              <Group gap="xs" wrap="nowrap" visibleFrom="sm">
                <Text size="sm" c="dimmed" component="label" htmlFor="page-size">
                  Rows
                </Text>
                <Select
                  placeholder="Rows"
                  id="page-size"
                  w={76}
                  data={PAGE_SIZES.map(String)}
                  value={String(query.size)}
                  onChange={(v) => v && setSize(Number(v))}
                  aria-label="Rows per page"
                />
              </Group>
              <Pagination total={totalPages} value={query.page} onChange={setPage} siblings={1} />
            </Group>
          </Group>
        )}
      </Box>
      {remove && (
        <ConfirmDialog
          opened={!!toDelete}
          title={remove.title}
          loading={deleting}
          confirmLabel={remove.title.replace('?', '')}
          onConfirm={handleDelete}
          onClose={() => setToDelete(null)}
        >
          {toDelete && remove.describe(toDelete)}
        </ConfirmDialog>
      )}
      {children?.({ reload })}
    </>
  );
};

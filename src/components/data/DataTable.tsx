import type { ReactNode } from 'react';
import { Box, Group, Skeleton, Table, Text, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconArrowDown, IconArrowUp, IconSelector } from '@tabler/icons-react';
import type { SortDir } from '@/hooks/useListQuery';

export type Column<T> = {
  key: string;
  header: string;
  render: (record: T) => ReactNode;
  /** Money, counts and other numbers: right-aligned and tabular. */
  align?: 'right';
  sortable?: boolean;
  width?: number | string;
  /** Title line of the stacked card on narrow screens. */
  primary?: boolean;
  /** Shown at the right of the card title line on narrow screens (status badges). */
  badge?: boolean;
  /** Hide this column in the table below this breakpoint (tablet keeps the essentials). */
  hideBelow?: 'md';
};

type Props<T> = {
  columns: Column<T>[];
  records: T[];
  rowKey: (record: T) => string;
  loading?: boolean;
  skeletonRows?: number;
  sort?: { key: string; dir: SortDir };
  onSort?: (key: string) => void;
  /** Row height in px: 52 comfortable (default), 40 dense. */
  rowHeight?: number;
  rowActions?: (record: T) => ReactNode;
  /** Action buttons under each stacked card (narrow screens). */
  cardActions?: (record: T) => ReactNode;
  caption: string;
};

export const DataTable = <T,>({
  columns,
  records,
  rowKey,
  loading,
  skeletonRows = 5,
  sort = { key: '', dir: 'asc' },
  onSort,
  rowHeight = 52,
  rowActions,
  cardActions,
  caption,
}: Props<T>) => {
  const stacked = useMediaQuery('(max-width: 47.99em)');

  if (stacked) {
    const primary = columns.find((c) => c.primary) ?? columns[0];
    const badge = columns.find((c) => c.badge);
    const rest = columns.filter((c) => c !== primary && c !== badge);
    return (
      <ul
        style={{ listStyle: 'none', margin: 0, padding: 0 }}
        aria-label={caption}
        aria-busy={loading}
      >
        {loading
          ? Array.from({ length: 3 }, (_, i) => (
              <li key={i} style={{ padding: 16, borderTop: '1px solid var(--ldg-border)' }}>
                <Skeleton h={16} w="55%" mb={10} />
                <Skeleton h={12} w="80%" />
              </li>
            ))
          : records.map((r) => (
              <li key={rowKey(r)} style={{ padding: 16, borderTop: '1px solid var(--ldg-border)' }}>
                <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs" mb={8}>
                  <Text fw={600} component="div" style={{ minWidth: 0 }}>
                    {primary.render(r)}
                  </Text>
                  {badge && <Box style={{ flex: 'none' }}>{badge.render(r)}</Box>}
                </Group>
                <Box
                  component="dl"
                  m={0}
                  style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 6 }}
                >
                  {rest.map((c) => (
                    <Box key={c.key} style={{ display: 'contents' }}>
                      <Text component="dt" size="sm" c="dimmed">
                        {c.header}
                      </Text>
                      <Text component="dd" size="sm" m={0} className={c.align ? 'num' : undefined}>
                        {c.render(r)}
                      </Text>
                    </Box>
                  ))}
                </Box>
                {cardActions && <Box mt={12}>{cardActions(r)}</Box>}
              </li>
            ))}
      </ul>
    );
  }

  return (
    <Table.ScrollContainer minWidth={Math.max(480, columns.length * 110)} type="native">
      <Table
        highlightOnHover={!loading}
        verticalSpacing={0}
        horizontalSpacing="md"
        aria-busy={loading}
        aria-label={caption}
        styles={{
          table: { borderCollapse: 'separate', borderSpacing: 0 },
          th: {
            background: 'var(--ldg-surface-sunken)',
            borderBottom: '1px solid var(--ldg-border)',
            height: 40,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--ldg-text)',
            whiteSpace: 'nowrap',
          },
          td: { borderBottom: '1px solid var(--ldg-border)', height: rowHeight, fontSize: 14 },
        }}
      >
        <Table.Thead>
          <Table.Tr>
            {columns.map((c) => {
              const active = sort.key === c.key;
              return (
                <Table.Th
                  key={c.key}
                  visibleFrom={c.hideBelow}
                  w={c.width}
                  ta={c.align}
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                  scope="col"
                >
                  {c.sortable && onSort ? (
                    <UnstyledButton
                      onClick={() => onSort?.(c.key)}
                      fz="inherit"
                      fw="inherit"
                      c={active ? 'var(--ldg-accent-text)' : 'inherit'}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      {c.header}
                      {active ? (
                        sort.dir === 'asc' ? (
                          <IconArrowUp size={14} aria-hidden />
                        ) : (
                          <IconArrowDown size={14} aria-hidden />
                        )
                      ) : (
                        <IconSelector size={14} aria-hidden style={{ opacity: 0.6 }} />
                      )}
                    </UnstyledButton>
                  ) : (
                    c.header
                  )}
                </Table.Th>
              );
            })}
            {rowActions && (
              <Table.Th ta="right" scope="col">
                Actions
              </Table.Th>
            )}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {loading
            ? Array.from({ length: skeletonRows }, (_, i) => (
                <Table.Tr key={i}>
                  {columns.map((c) => (
                    <Table.Td key={c.key} visibleFrom={c.hideBelow}>
                      <Skeleton h={14} w={c.align ? 80 : '70%'} ml={c.align ? 'auto' : 0} />
                    </Table.Td>
                  ))}
                  {rowActions && (
                    <Table.Td>
                      <Skeleton h={14} w={72} ml="auto" />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            : records.map((r) => (
                <Table.Tr key={rowKey(r)}>
                  {columns.map((c) => (
                    <Table.Td
                      key={c.key}
                      visibleFrom={c.hideBelow}
                      ta={c.align}
                      className={c.align ? 'num' : undefined}
                    >
                      {c.render(r)}
                    </Table.Td>
                  ))}
                  {rowActions && <Table.Td ta="right">{rowActions(r)}</Table.Td>}
                </Table.Tr>
              ))}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
};

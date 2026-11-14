import type { ReactNode } from 'react';
import { ActionIcon, Anchor, Box, Breadcrumbs, Group, Stack, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';

type Crumb = { label: string; to?: string };

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Status chip shown next to the title (e.g. Active, Not available yet). */
  badge?: ReactNode;
  /** Keep the action in the header on phones (e.g. Edit + Delete pairs) instead of the pinned bottom bar. */
  inlineAction?: boolean;
  onBack?: () => void;
  /** Overrides the breadcrumb trail derived from the route. */
  crumbs?: Crumb[];
};

const AREAS: Record<string, { area: string; label: string }> = {
  dashboard: { area: 'Overview', label: 'Dashboard' },
  customers: { area: 'Directory', label: 'Customers' },
  suppliers: { area: 'Directory', label: 'Suppliers' },
  products: { area: 'Directory', label: 'Products' },
  sales: { area: 'Trading', label: 'Sales' },
  orders: { area: 'Trading', label: 'Orders' },
  cheques: { area: 'Trading', label: 'Cheques' },
  settings: { area: 'Administration', label: 'Settings' },
};

export const PageHeader = ({
  title,
  description,
  action,
  badge,
  inlineAction,
  onBack,
  crumbs,
}: Props) => {
  const { pathname } = useLocation();
  const section = pathname.split('/')[2] ?? 'dashboard';
  const meta = AREAS[section];

  const trail: Crumb[] =
    crumbs ??
    (meta
      ? meta.label === title
        ? [{ label: meta.area }, { label: title }]
        : [{ label: meta.area }, { label: meta.label, to: `/app/${section}` }, { label: title }]
      : [{ label: title }]);

  return (
    <Stack gap={6} mb="lg">
      <Breadcrumbs
        separator={<IconChevronRight size={12} aria-hidden />}
        separatorMargin={6}
        aria-label="Breadcrumb"
      >
        {trail.map((c, i) =>
          c.to && i < trail.length - 1 ? (
            <Anchor key={c.label} component={Link} to={c.to} size="sm" c="dimmed">
              {c.label}
            </Anchor>
          ) : (
            <Text
              key={c.label}
              size="sm"
              c={i === trail.length - 1 ? undefined : 'dimmed'}
              fw={i === trail.length - 1 ? 500 : 400}
              aria-current={i === trail.length - 1 ? 'page' : undefined}
            >
              {c.label}
            </Text>
          ),
        )}
      </Breadcrumbs>
      <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
        <Group gap="sm" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
          {onBack && (
            <ActionIcon onClick={onBack} aria-label="Back" mt={2}>
              <IconArrowLeft size={18} />
            </ActionIcon>
          )}
          <Stack gap={2}>
            <Group gap="sm" align="center">
              <Title order={1}>{title}</Title>
              {badge}
            </Group>
            {description && (
              <Text size="sm" c="dimmed" maw={640}>
                {description}
              </Text>
            )}
          </Stack>
        </Group>
        {action && (
          <Box className={inlineAction ? 'page-action-inline' : 'page-action'}>{action}</Box>
        )}
      </Group>
    </Stack>
  );
};

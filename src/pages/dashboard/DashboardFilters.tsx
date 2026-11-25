import { ActionIcon, Box, Group, SegmentedControl, Select, Switch, Text } from '@mantine/core';
import { DatePickerInput, MonthPickerInput } from '@mantine/dates';
import { IconChevronLeft, IconChevronRight, IconClock } from '@tabler/icons-react';
import { toYmd } from '@/utils/format';
import {
  addMonths,
  monthLabel,
  monthRange,
  PRESETS,
  presetRange,
  rangeLabel,
  type Preset,
  type Range,
} from './dashboardUtils';

type Props = {
  range: Range;
  preset: Preset;
  compare: boolean;
  previous: Range | null;
  onChange: (range: Range, preset: Preset) => void;
  onCompare: (v: boolean) => void;
};

/** One set of controls drives every card that follows the date filter. */
export const DashboardFilters = ({
  range,
  preset,
  compare,
  previous,
  onChange,
  onCompare,
}: Props) => {
  const todayYmd = toYmd(new Date());
  const monthOf = range.from;
  const atCurrentMonth = monthOf.slice(0, 7) >= todayYmd.slice(0, 7);
  const step = (n: number) => onChange(monthRange(addMonths(monthOf, n)), 'month');

  return (
    <Box
      p="sm"
      style={{
        background: 'var(--ldg-surface-raised)',
        border: '1px solid var(--ldg-border)',
        borderRadius: 8,
      }}
    >
      <Group gap="sm" align="center" wrap="wrap">
        <Group gap={4} wrap="nowrap" style={{ flex: '1 1 220px', maxWidth: 320 }}>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Previous month"
            onClick={() => step(-1)}
          >
            <IconChevronLeft size={18} />
          </ActionIcon>
          <MonthPickerInput
            aria-label="Month"
            value={monthOf}
            maxDate={todayYmd}
            valueFormat="MMMM YYYY"
            allowDeselect={false}
            onChange={(v) => v && onChange(monthRange(v), 'month')}
            style={{ flex: 1, minWidth: 0 }}
          />
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label="Next month"
            disabled={atCurrentMonth}
            onClick={() => step(1)}
          >
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <SegmentedControl
          visibleFrom="md"
          aria-label="Quick range"
          value={PRESETS.some((p) => p.value === preset) ? preset : ''}
          data={PRESETS}
          onChange={(v) => onChange(presetRange(v as Preset), v as Preset)}
          styles={{ label: { whiteSpace: 'nowrap' } }}
        />
        <Select
          hiddenFrom="md"
          aria-label="Quick range"
          placeholder="Custom range"
          allowDeselect={false}
          value={PRESETS.some((p) => p.value === preset) ? preset : null}
          data={PRESETS}
          onChange={(v) => v && onChange(presetRange(v as Preset), v as Preset)}
          style={{ flex: '1 1 160px', maxWidth: 220 }}
        />
        <DatePickerInput
          type="range"
          aria-label="Custom date range"
          value={[range.from, range.to]}
          maxDate={todayYmd}
          valueFormat="DD MMM YYYY"
          onChange={(v) =>
            v[0] && v[1] && onChange({ from: toYmd(v[0]), to: toYmd(v[1]) }, 'custom')
          }
          style={{ flex: '1 1 240px', maxWidth: 300 }}
        />
      </Group>
      <Group justify="space-between" mt="sm" gap="xs" wrap="wrap">
        <Switch
          label="Compare to previous period"
          checked={compare}
          onChange={(e) => onCompare(e.currentTarget.checked)}
        />
        <Group gap={6} c="dimmed" wrap="nowrap" align="flex-start">
          <IconClock size={14} aria-hidden style={{ marginTop: 3, flex: 'none' }} />
          <Text size="sm" c="dimmed">
            Showing{' '}
            <b>{preset === 'month' ? monthLabel(range.from) : rangeLabel(range.from, range.to)}</b>
            {compare && previous ? ` vs ${rangeLabel(previous.from, previous.to)}` : ''}
          </Text>
        </Group>
      </Group>
    </Box>
  );
};

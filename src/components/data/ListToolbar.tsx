import { useState } from 'react';
import { Box, Button, Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconSearch } from '@tabler/icons-react';
import { filterKeys } from './filterKeys';

type Option = { value: string; label: string };

export type FilterField =
  | { type: 'select'; key: string; label: string; placeholder: string; options: Option[] }
  | { type: 'multiSelect'; key: string; label: string; placeholder: string; options: Option[] }
  // A calendar day, kept as `YYYY-MM-DD` (in the URL too).
  | { type: 'date'; key: string; label: string; placeholder: string }
  // One picker for a start and end day (same day twice = that day): stored under `fromKey` / `toKey`.
  | { type: 'dateRange'; fromKey: string; toKey: string; label: string; placeholder: string };

type Props = {
  searchPlaceholder: string;
  filters: FilterField[];
  q: string;
  values: Record<string, string>;
  hasFilters: boolean;
  /** Greys the controls while the first load is in flight. */
  disabled?: boolean;
  onApply: (q: string, values: Record<string, string>) => void;
  onClear: () => void;
};

// Labelled fields, an explicit Search button and a Clear that resets everything.
export const ListToolbar = ({
  searchPlaceholder,
  filters,
  q,
  values,
  hasFilters,
  disabled,
  onApply,
  onClear,
}: Props) => {
  // Draft edits stay local until Search; the URL value re-seeds them via `key` on the form.
  const [draftQ, setDraftQ] = useState(q);
  const [draft, setDraft] = useState(values);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onApply(draftQ, draft);
      }}
    >
      <Group align="flex-end" gap="sm" wrap="wrap">
        <TextInput
          label="Search"
          placeholder={searchPlaceholder}
          leftSection={<IconSearch size={16} aria-hidden />}
          value={draftQ}
          disabled={disabled}
          onChange={(e) => setDraftQ(e.currentTarget.value)}
          w={{ base: '100%', sm: 300 }}
        />
        {filters.map((f) =>
          f.type === 'dateRange' ? (
            <DatePickerInput
              key={f.fromKey}
              type="range"
              allowSingleDateInRange
              label={f.label}
              placeholder={f.placeholder}
              value={[draft[f.fromKey] || null, draft[f.toKey] || null]}
              onChange={([from, to]) => {
                const next = { ...draft, [f.fromKey]: from ?? '', [f.toKey]: to ?? '' };
                setDraft(next);
                if (!from && draft[f.fromKey]) onApply(draftQ, next);
              }}
              clearable
              leftSection={<IconCalendar size={16} aria-hidden />}
              disabled={disabled}
              w={{ base: '100%', sm: 260 }}
            />
          ) : f.type === 'date' ? (
            <DateInput
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              value={draft[f.key] || null}
              onChange={(v) => {
                const next = { ...draft, [f.key]: v ?? '' };
                setDraft(next);
                if (!v && draft[f.key]) onApply(draftQ, next);
              }}
              clearable
              leftSection={<IconCalendar size={16} aria-hidden />}
              disabled={disabled}
              w={{ base: '100%', sm: 170 }}
            />
          ) : f.type === 'select' ? (
            <Select
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              data={f.options}
              value={draft[f.key] || null}
              onChange={(v) => {
                const next = { ...draft, [f.key]: v ?? '' };
                setDraft(next);
                // CLEARING A FILTER WITH THE X APPLIES IMMEDIATELY, NO SEARCH CLICK NEEDED
                if (!v && draft[f.key]) onApply(draftQ, next);
              }}
              clearable
              clearButtonProps={{ 'aria-label': `Clear ${f.label}` }}
              allowDeselect
              disabled={disabled}
              w={{ base: '100%', sm: 190 }}
            />
          ) : (
            <MultiSelect
              key={f.key}
              label={f.label}
              placeholder={draft[f.key] ? undefined : f.placeholder}
              data={f.options}
              value={draft[f.key] ? draft[f.key].split(',') : []}
              onChange={(v) => {
                const next = { ...draft, [f.key]: v.join(',') };
                setDraft(next);
                if (v.length === 0 && draft[f.key]) onApply(draftQ, next);
              }}
              clearable
              clearButtonProps={{ 'aria-label': `Clear ${f.label}` }}
              disabled={disabled}
              w={{ base: '100%', sm: 240 }}
            />
          ),
        )}
        <Box className="toolbar-actions">
          <Button
            type="submit"
            variant="default"
            leftSection={<IconSearch size={16} aria-hidden />}
          >
            Search
          </Button>
          <Button
            variant="subtle"
            color="forest"
            disabled={disabled || (!hasFilters && !draftQ && !Object.values(draft).some(Boolean))}
            onClick={() => {
              setDraftQ('');
              setDraft(Object.fromEntries(filters.flatMap(filterKeys).map((k) => [k, ''])));
              onClear();
            }}
          >
            Clear
          </Button>
        </Box>
      </Group>
    </form>
  );
};

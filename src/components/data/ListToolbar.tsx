import { useState } from 'react';
import { Box, Button, Group, MultiSelect, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type Option = { value: string; label: string };

export type FilterField =
  | { type: 'select'; key: string; label: string; placeholder: string; options: Option[] }
  | { type: 'multiSelect'; key: string; label: string; placeholder: string; options: Option[] };

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
          f.type === 'select' ? (
            <Select
              key={f.key}
              label={f.label}
              placeholder={f.placeholder}
              data={f.options}
              value={draft[f.key] || null}
              onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v ?? '' }))}
              clearable
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
              onChange={(v) => setDraft((d) => ({ ...d, [f.key]: v.join(',') }))}
              clearable
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
              setDraft(Object.fromEntries(filters.map((f) => [f.key, ''])));
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

import { useState, type ReactNode } from 'react';
import { Button, Divider, Group, MultiSelect, Select, Stack, TextInput } from '@mantine/core';
import { DateInput, DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconFilter, IconSearch, IconX } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';

type SelectOption = { value: string; label: string };

// `label` is never rendered as a visible <label> — it's the field's
// accessible name (aria-label) since placeholder + a left-section icon are
// the only visible affordances. `icon` overrides the type's default icon.
export type FilterFieldConfig =
  | { type: 'search'; key: string; label?: string; placeholder?: string; icon?: ReactNode }
  | {
      type: 'select';
      key: string;
      label: string;
      placeholder?: string;
      icon?: ReactNode;
      options: SelectOption[];
    }
  | {
      type: 'multiSelect';
      key: string;
      label: string;
      placeholder?: string;
      icon?: ReactNode;
      options: SelectOption[];
    }
  | { type: 'date'; key: string; label: string; placeholder?: string; icon?: ReactNode }
  | { type: 'dateRange'; key: string; label: string; placeholder?: string; icon?: ReactNode };

const DEFAULT_ICON_SIZE = 16;
const defaultIconFor = (field: FilterFieldConfig): ReactNode => {
  if (field.icon) return field.icon;
  switch (field.type) {
    case 'search':
      return <IconSearch size={DEFAULT_ICON_SIZE} />;
    case 'date':
    case 'dateRange':
      return <IconCalendar size={DEFAULT_ICON_SIZE} />;
    default:
      return <IconFilter size={DEFAULT_ICON_SIZE} />;
  }
};

// Mantine's date components already work in YYYY-MM-DD strings, which is also
// the URL storage format — no Date<->string conversion needed anywhere here.
type DraftValue = string | string[] | null | [string | null, string | null];
type DraftState = Record<string, DraftValue>;

const emptyValueFor = (field: FilterFieldConfig): DraftValue => {
  switch (field.type) {
    case 'search':
      return '';
    case 'multiSelect':
      return [];
    case 'dateRange':
      return [null, null];
    default:
      return null;
  }
};

const readDraftFromParams = (fields: FilterFieldConfig[], params: URLSearchParams): DraftState => {
  const draft: DraftState = {};
  for (const field of fields) {
    switch (field.type) {
      case 'search':
        draft[field.key] = params.get(field.key) ?? '';
        break;
      case 'select':
      case 'date':
        draft[field.key] = params.get(field.key) ?? null;
        break;
      case 'multiSelect': {
        const raw = params.get(field.key);
        draft[field.key] = raw ? raw.split(',') : [];
        break;
      }
      case 'dateRange':
        draft[field.key] = [params.get(`${field.key}From`), params.get(`${field.key}To`)];
        break;
    }
  }
  return draft;
};

type Props = {
  fields: FilterFieldConfig[];
};

export const FilterBar = ({ fields }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Initialized once from the URL on mount, so navigating back restores the
  // same draft the user left — edits then stay local until "Search" commits
  // them to the URL (keystrokes shouldn't rewrite the URL on every change).
  const [draft, setDraft] = useState<DraftState>(() => readDraftFromParams(fields, searchParams));

  const setValue = (key: string, value: DraftValue) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    const next = new URLSearchParams(searchParams);
    for (const field of fields) {
      switch (field.type) {
        case 'search':
        case 'select':
        case 'date': {
          const value = draft[field.key] as string | null;
          if (value) next.set(field.key, value);
          else next.delete(field.key);
          break;
        }
        case 'multiSelect': {
          const value = draft[field.key] as string[];
          if (value?.length) next.set(field.key, value.join(','));
          else next.delete(field.key);
          break;
        }
        case 'dateRange': {
          const [from, to] = (draft[field.key] as [string | null, string | null]) ?? [null, null];
          if (from) next.set(`${field.key}From`, from);
          else next.delete(`${field.key}From`);
          if (to) next.set(`${field.key}To`, to);
          else next.delete(`${field.key}To`);
          break;
        }
      }
    }
    setSearchParams(next);
  };

  const handleClear = () => {
    const next = new URLSearchParams(searchParams);
    const cleared: DraftState = {};
    for (const field of fields) {
      cleared[field.key] = emptyValueFor(field);
      if (field.type === 'dateRange') {
        next.delete(`${field.key}From`);
        next.delete(`${field.key}To`);
      } else {
        next.delete(field.key);
      }
    }
    setDraft(cleared);
    setSearchParams(next);
  };

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSearch();
        }}
      >
        <Stack gap="md">
          <Group align="center" gap="md" wrap="wrap">
            {fields.map((field) => {
              switch (field.type) {
                case 'search':
                  return (
                    <TextInput
                      key={field.key}
                      aria-label={field.label ?? field.placeholder ?? 'Search'}
                      placeholder={field.placeholder ?? 'Search'}
                      leftSection={defaultIconFor(field)}
                      value={draft[field.key] as string}
                      onChange={(event) => setValue(field.key, event.currentTarget.value)}
                      w={220}
                    />
                  );
                case 'select':
                  return (
                    <Select
                      key={field.key}
                      aria-label={field.label}
                      placeholder={field.placeholder ?? field.label}
                      leftSection={defaultIconFor(field)}
                      data={field.options}
                      value={draft[field.key] as string | null}
                      onChange={(value) => setValue(field.key, value)}
                      clearable
                      w={180}
                    />
                  );
                case 'multiSelect':
                  return (
                    <MultiSelect
                      key={field.key}
                      aria-label={field.label}
                      placeholder={field.placeholder ?? field.label}
                      leftSection={defaultIconFor(field)}
                      data={field.options}
                      value={draft[field.key] as string[]}
                      onChange={(value) => setValue(field.key, value)}
                      clearable
                      w={220}
                    />
                  );
                case 'date':
                  return (
                    <DateInput
                      key={field.key}
                      aria-label={field.label}
                      placeholder={field.placeholder ?? field.label}
                      leftSection={defaultIconFor(field)}
                      value={draft[field.key] as string | null}
                      onChange={(value) => setValue(field.key, value)}
                      clearable
                      w={180}
                    />
                  );
                case 'dateRange':
                  return (
                    <DatePickerInput
                      key={field.key}
                      type="range"
                      aria-label={field.label}
                      placeholder={field.placeholder ?? field.label}
                      leftSection={defaultIconFor(field)}
                      value={draft[field.key] as [string | null, string | null]}
                      onChange={(value) => setValue(field.key, value)}
                      clearable
                      w={260}
                    />
                  );
              }
            })}
          </Group>
          {/* Always its own row, never wraps inline with the fields above. */}
          <Group gap="xs">
            <Button type="submit" leftSection={<IconSearch size={16} />}>
              Search
            </Button>
            <Button
              type="button"
              variant="default"
              leftSection={<IconX size={16} />}
              onClick={handleClear}
            >
              Clear
            </Button>
          </Group>
        </Stack>
      </form>
      <Divider mx="calc(var(--mantine-spacing-md) * -1)" />
    </>
  );
};

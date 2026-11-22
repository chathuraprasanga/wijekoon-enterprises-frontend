import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Group,
  MultiSelect,
  Select,
  NumberInput,
  SimpleGrid,
  Stack,
  Switch,
  Text,
} from '@mantine/core';
import { SectionCard } from '@/components/SectionCard';
import { Loader } from '@/components/Loader';
import { toNotify } from '@/hooks/toNotify';
import { type BusinessRules, DEFAULT_RULES, refreshBusinessRules } from '@/hooks/useBusinessRules';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { formatDateTime } from '@/utils/format';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useCan } from '@/utils/permissions';

type NumKey = Exclude<keyof BusinessRules, 'chequeStrictDeposit'>;
type Rule = { key: NumKey; label: string; description: string; max: number };
const GROUPS: { title: string; subtitle: string; rules: Rule[] }[] = [
  {
    title: 'Cheque clearing',
    subtitle:
      'How many days after the date below a cheque is expected to clear. The date is worked out automatically for each cheque.',
    rules: [
      {
        key: 'depositClearingDays',
        label: 'Customer cheques we deposit',
        description: 'Days after we deposit it at our bank',
        max: 60,
      },
      {
        key: 'transferClearingDays',
        label: 'Customer cheques we transfer to suppliers',
        description: 'Days after the transfer date',
        max: 60,
      },
      {
        key: 'issuedClearingDays',
        label: 'Cheques we issue',
        description: 'Days after the cheque date',
        max: 60,
      },
    ],
  },
  {
    title: 'Payment due dates',
    subtitle: 'Prefilled when part of a sale or order is on credit. 0 means the same day.',
    rules: [
      {
        key: 'saleDueDays',
        label: 'Customer sales',
        description: 'Days after the sale date',
        max: 365,
      },
      {
        key: 'orderDueDays',
        label: 'Supplier orders',
        description: 'Days after the order date',
        max: 365,
      },
    ],
  },
  {
    title: 'Cheque deposit limit',
    subtitle:
      'Enforced when a customer cheque is saved. Unless Strict is on, whoever saves the cheque can override it for that cheque, and the override is recorded.',
    rules: [
      {
        key: 'chequeMaxDepositDays',
        label: 'Latest deposit date',
        description: 'Days from today, for sales and customer cheques',
        max: 730,
      },
    ],
  },
];

type Num = number | '';

type Kind = 'sale' | 'order';
type Reminder = { enabled: boolean; daysBefore: Num; roles: string[] };
type Role = { _id: string; name: string };
type Schedule = { chequeClearingTime: string; dueCheckTime: string };
const DEFAULT_SCHEDULE: Schedule = { chequeClearingTime: '23:59', dueCheckTime: '06:00' };
const GRID = Array.from(
  { length: 48 },
  (_, i) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`,
);
/** 30-minute steps, plus the current value when it is off the grid (e.g. 23:59). */
const timeOptions = (current: string) => [...new Set([...GRID, current])].sort();
type SettingsResponse = {
  schedule: Schedule;
  rules: BusinessRules;
  reminders: Record<Kind, { enabled: boolean; daysBefore: number; roles: string[] }>;
  eligibleRoles: Record<Kind, Role[]>;
  reminderMaxDays: number;
  updatedAt: string | null;
};
const DEFAULT_REMINDER: Reminder = { enabled: true, daysBefore: 5, roles: [] };
const DEFAULT_REMINDERS: Record<Kind, Reminder> = {
  sale: DEFAULT_REMINDER,
  order: DEFAULT_REMINDER,
};
const REMINDER_COPY: Record<Kind, { title: string; noun: string; viewers: string }> = {
  sale: { title: 'Customer sale due reminders', noun: 'sale', viewers: 'sales' },
  order: { title: 'Supplier order due reminders', noun: 'order', viewers: 'orders' },
};

const BusinessRulesPage = () => {
  const can = useCan();
  const editable = can('business-rule:update');
  const [values, setValues] = useState<Record<NumKey, Num>>(DEFAULT_RULES);
  const [strict, setStrict] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [reminders, setReminders] = useState<Record<Kind, Reminder>>(DEFAULT_REMINDERS);
  const [eligible, setEligible] = useState<Record<Kind, Role[]>>({ sale: [], order: [] });
  const [reminderMax, setReminderMax] = useState(60);
  const [saved, setSaved] = useState<{
    rules: BusinessRules;
    reminders: Record<Kind, Reminder>;
    schedule: Schedule;
  }>({ rules: DEFAULT_RULES, reminders: DEFAULT_REMINDERS, schedule: DEFAULT_SCHEDULE });
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const apply = useCallback((d: SettingsResponse) => {
    setValues(d.rules);
    setStrict(d.rules.chequeStrictDeposit);
    setSchedule(d.schedule);
    setReminders(d.reminders);
    setEligible(d.eligibleRoles);
    setReminderMax(d.reminderMaxDays);
    setSaved({ rules: d.rules, reminders: d.reminders, schedule: d.schedule });
    setUpdatedAt(d.updatedAt);
  }, []);

  useEffect(() => {
    axiosInstance
      .get<SettingsResponse>('/settings')
      .then(({ data }) => apply(data))
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [apply]);

  const invalid = (r: Rule) => {
    const v = values[r.key];
    return v === '' || !Number.isInteger(v) || v < 0 || v > r.max;
  };
  const daysInvalid = (k: Kind) => {
    const v = reminders[k].daysBefore;
    return v === '' || !Number.isInteger(v) || v < 0 || v > reminderMax;
  };
  const anyInvalid =
    GROUPS.some((g) => g.rules.some(invalid)) || daysInvalid('sale') || daysInvalid('order');
  const setReminder = (k: Kind, patch: Partial<Reminder>) =>
    setReminders((s) => ({ ...s, [k]: { ...s[k], ...patch } }));
  const dirty =
    (Object.keys(DEFAULT_RULES) as (keyof BusinessRules)[]).some((k) =>
      k === 'chequeStrictDeposit' ? strict !== saved.rules[k] : values[k] !== saved.rules[k],
    ) ||
    schedule.chequeClearingTime !== saved.schedule.chequeClearingTime ||
    schedule.dueCheckTime !== saved.schedule.dueCheckTime ||
    (['sale', 'order'] as Kind[]).some((k) => {
      const a = reminders[k];
      const b = saved.reminders[k];
      return (
        a.enabled !== b.enabled ||
        a.daysBefore !== b.daysBefore ||
        [...a.roles].sort().join() !== [...b.roles].sort().join()
      );
    });
  const reset = () => {
    setValues(DEFAULT_RULES);
    setStrict(false);
    setReminders(DEFAULT_REMINDERS);
    setSchedule(DEFAULT_SCHEDULE);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await axiosInstance.patch<SettingsResponse>('/settings', {
        ...values,
        chequeStrictDeposit: strict,
        ...schedule,
        saleReminder: reminders.sale,
        orderReminder: reminders.order,
      });
      apply(data);
      await refreshBusinessRules();
      toNotify(
        'Business rules saved',
        'New sales, orders and cheques will use these values.',
        'SUCCESS',
      );
    } catch (e) {
      toNotify('Could not save', getErrorMessage(e), 'ERROR');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader h={240} />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Stack gap="md">
      {GROUPS.map((g) => (
        <SectionCard key={g.title} title={g.title} subtitle={g.subtitle}>
          <SimpleGrid
            cols={{ base: 1, sm: g.rules.length > 1 ? 2 : 1, lg: Math.min(3, g.rules.length) }}
          >
            {g.rules.map((r) => (
              <NumberInput
                key={r.key}
                label={r.label}
                description={r.description}
                suffix=" days"
                min={0}
                max={r.max}
                allowDecimal={false}
                allowNegative={false}
                clampBehavior="none"
                readOnly={!editable}
                value={values[r.key]}
                onChange={(v) => setValues((s) => ({ ...s, [r.key]: v === '' ? '' : Number(v) }))}
                error={editable && invalid(r) ? `Whole number from 0 to ${r.max}` : undefined}
              />
            ))}
          </SimpleGrid>
          {g.title === 'Payment due dates' && (
            <Select
              mt="md"
              maw={{ base: '100%', sm: 280 }}
              label="Due check time (Sri Lanka)"
              description="When the daily job checks dues and sends notices"
              data={timeOptions(schedule.dueCheckTime)}
              value={schedule.dueCheckTime}
              allowDeselect={false}
              readOnly={!editable}
              onChange={(v) => v && setSchedule((x) => ({ ...x, dueCheckTime: v }))}
            />
          )}
          {g.title === 'Cheque clearing' && (
            <Select
              mt="md"
              maw={{ base: '100%', sm: 280 }}
              label="Clearing time (Sri Lanka)"
              description="When the daily job marks cheques cleared on their clearing day"
              data={timeOptions(schedule.chequeClearingTime)}
              value={schedule.chequeClearingTime}
              allowDeselect={false}
              readOnly={!editable}
              onChange={(v) => v && setSchedule((x) => ({ ...x, chequeClearingTime: v }))}
            />
          )}
          {g.rules.some((r) => r.key === 'chequeMaxDepositDays') && (
            <Switch
              mt="md"
              label="Strict"
              description="When on, a later date can't be allowed: the override option disappears."
              checked={strict}
              disabled={!editable}
              onChange={(e) => setStrict(e.currentTarget.checked)}
            />
          )}
        </SectionCard>
      ))}
      {(['sale', 'order'] as Kind[]).map((k) => {
        const r = reminders[k];
        const c = REMINDER_COPY[k];
        const off = !r.enabled || !editable;
        return (
          <SectionCard
            key={k}
            title={c.title}
            subtitle={`Notifies people when a ${c.noun} is close to its due date, on the due date, and every day it stays unpaid after that. The super admin is always notified of due and overdue payments, whether this is on or not.`}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
              <Switch
                label="Send reminders"
                description={`To the roles chosen here`}
                checked={r.enabled}
                disabled={!editable}
                onChange={(e) => setReminder(k, { enabled: e.currentTarget.checked })}
              />
              <NumberInput
                label="Remind before (days)"
                description="Also notifies on the due day and every day while overdue"
                suffix=" days"
                min={0}
                max={reminderMax}
                allowDecimal={false}
                allowNegative={false}
                clampBehavior="none"
                disabled={off}
                value={r.daysBefore}
                onChange={(v) => setReminder(k, { daysBefore: v === '' ? '' : Number(v) })}
                error={
                  editable && r.enabled && daysInvalid(k)
                    ? `Whole number from 0 to ${reminderMax}`
                    : undefined
                }
              />
              <MultiSelect
                label="Notify these roles"
                description={`Only roles that can view ${c.viewers} are listed`}
                placeholder={r.roles.length ? undefined : 'Select roles'}
                data={eligible[k].map((x) => ({ value: x._id, label: x.name }))}
                value={r.roles}
                onChange={(v) => setReminder(k, { roles: v })}
                disabled={off}
                searchable
                clearable
                nothingFoundMessage="No roles"
              />
            </SimpleGrid>
          </SectionCard>
        );
      })}
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {updatedAt ? `Last changed ${formatDateTime(updatedAt)}` : 'Using the standard values'}
          {!editable && ' · You can view these but not change them.'}
        </Text>
        {editable && (
          <Group gap="xs">
            <Button variant="default" onClick={reset} disabled={saving}>
              Reset to defaults
            </Button>
            <Button onClick={save} loading={saving} disabled={!dirty || anyInvalid}>
              Save changes
            </Button>
          </Group>
        )}
      </Group>
    </Stack>
  );
};

export default BusinessRulesPage;

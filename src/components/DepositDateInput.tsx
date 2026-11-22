import { useEffect } from 'react';
import { Checkbox, Stack } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useBusinessRules, ymdPlusDays } from '@/hooks/useBusinessRules';

type Props = {
  value: Date | string | null;
  onChange: (v: Date | null) => void;
  override?: boolean;
  onOverrideChange?: (v: boolean) => void;
  /** false (the Add cheque page): the limit is hard, there is no override checkbox. */
  allowOverride?: boolean;
  error?: React.ReactNode;
  /** Inside a modal the calendar stays in the modal's stacking context. */
  inModal?: boolean;
};

/// Cheque deposit date: limited to today + the configured days (Settings → Business rules). The
/// override checkbox lifts the limit for this cheque; the server records that it was overridden.
export const DepositDateInput = ({
  value,
  onChange,
  override = false,
  onOverrideChange = () => {},
  allowOverride = true,
  error,
  inModal,
}: Props) => {
  const { chequeMaxDepositDays: max, chequeStrictDeposit } = useBusinessRules();
  const strict = chequeStrictDeposit || !allowOverride;
  // Strict: the limit is hard, so a leftover override is dropped (it is never sent).
  useEffect(() => {
    if (strict && override) onOverrideChange(false);
  }, [strict, override, onOverrideChange]);
  const lifted = override && !strict;
  return (
    <Stack gap={6}>
      <DateInput
        label="Deposit date"
        placeholder="Select date"
        withAsterisk
        popoverProps={inModal ? { withinPortal: false } : undefined}
        description={lifted ? 'Limit overridden for this cheque' : `Up to ${max} days ahead`}
        value={value}
        maxDate={lifted ? undefined : new Date(`${ymdPlusDays(max)}T00:00:00`)}
        error={error}
        onChange={(v) => onChange(v ? new Date(v) : null)}
      />
      {!strict && (
        <Checkbox
          size="xs"
          label="Allow a later date (override)"
          checked={override}
          onChange={(e) => onOverrideChange(e.currentTarget.checked)}
        />
      )}
    </Stack>
  );
};

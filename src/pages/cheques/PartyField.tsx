import { useEffect, useState } from 'react';
import { Autocomplete, SegmentedControl } from '@mantine/core';
import { useAppDispatch } from '@/store/hooks';
import { fetchChequeParties } from '@/store/chequeSlice/chequeSlice';

/** Names of other parties used on earlier cheques; picking one fills the field, typing a new one adds it. */
export const PartyNameInput = ({
  direction,
  label,
  value,
  error,
  onChange,
}: {
  direction: 'received' | 'issued';
  label: string;
  value: string;
  error?: React.ReactNode;
  onChange: (v: string) => void;
}) => {
  const dispatch = useAppDispatch();
  const [names, setNames] = useState<string[]>([]);
  useEffect(() => {
    dispatch(fetchChequeParties(direction))
      .unwrap()
      .then(setNames)
      .catch(() => setNames([]));
  }, [direction, dispatch]);
  return (
    <Autocomplete
      label={label}
      withAsterisk
      placeholder="Type to search or add a new name"
      description="Parties you've used before are suggested."
      inputWrapperOrder={['label', 'input', 'description', 'error']}
      comboboxProps={{ withinPortal: false }}
      maxLength={100}
      data={names}
      value={value}
      error={error}
      onChange={onChange}
    />
  );
};

/** Two-way toggle between the usual party (customer / supplier) and any other party. */
export const PartyToggle = ({
  value,
  usual,
  allowUsual,
  allowOther,
  onChange,
}: {
  value: 'usual' | 'other';
  usual: string;
  allowUsual: boolean;
  allowOther: boolean;
  onChange: (v: 'usual' | 'other') => void;
}) =>
  allowUsual && allowOther ? (
    <SegmentedControl
      fullWidth
      value={value}
      onChange={(v) => onChange(v as 'usual' | 'other')}
      data={[
        { value: 'usual', label: usual },
        { value: 'other', label: 'Other party' },
      ]}
    />
  ) : null;

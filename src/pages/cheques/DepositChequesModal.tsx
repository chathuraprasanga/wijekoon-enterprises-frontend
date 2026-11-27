import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { DatePickerInput } from '@mantine/dates';
import {
  Box,
  Button,
  Checkbox,
  Group,
  Pagination,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { toNotify } from '@/hooks/toNotify';
import { useLookup } from '@/hooks/useLookup';
import { useAppDispatch } from '@/store/hooks';
import {
  type Cheque,
  depositCheques,
  fetchChequeParties,
  searchCheques,
} from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import { customerName } from '@/pages/sales/saleLabels';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { bankDisplay } from '@/utils/bankData';
import { formatDate, formatLkr } from '@/utils/format';

type Props = { opened: boolean; onClose: () => void; onDone: () => void };

const PAGE_SIZE = 8;

const row = (c: Cheque) => (
  <Stack gap={0}>
    <Text size="sm" fw={500}>
      <span className="mono">{c.chequeNumber}</span> · {formatLkr(c.amount)}
    </Text>
    <Text size="xs" c="dimmed">
      {bankDisplay(c.bankCode)} · {formatDate(c.depositDate)}
      {c.status === 'RETURNED' ? ' · returned' : ''}
    </Text>
  </Stack>
);

/** Pick received cheques (search, party filter, paged), review the selection, then deposit together. */
export const DepositChequesModal = ({ opened, onClose, onDone }: Props) => {
  const dispatch = useAppDispatch();
  const customers = useLookup<Customer>('customers');
  const [others, setOthers] = useState<string[]>([]);
  const [items, setItems] = useState<Cheque[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [party, setParty] = useState<string | null>(null);
  const [range, setRange] = useState<[string | null, string | null]>([null, null]);
  const [debounced] = useDebouncedValue(search, 300);
  // Selection survives paging and filtering: kept by id with the cheque itself for the confirm step.
  const [picked, setPicked] = useState<Record<string, Cheque>>({});
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchChequeParties('received'))
      .unwrap()
      .then(setOthers)
      .catch(() => setOthers([]));
  }, [dispatch]);

  useEffect(() => {
    searchCheques({
      page,
      limit: PAGE_SIZE,
      status: 'RECEIVED,RETURNED',
      searchText: debounced || undefined,
      customer: party?.startsWith('c:') ? party.slice(2) : undefined,
      partyName: party?.startsWith('p:') ? party.slice(2) : undefined,
      dateFrom: range[0] ?? undefined,
      dateTo: range[1] ?? undefined,
      sortBy: 'depositDate',
      sortType: 'asc',
    })
      .then((r) => {
        setItems(r.data);
        setTotal(r.total);
        setError('');
      })
      .catch((e) => setError(getErrorMessage(e)));
  }, [page, debounced, party, range]);

  const chosen = Object.values(picked);
  const sum = chosen.reduce((t, c) => t + c.amount, 0);
  const toggle = (c: Cheque) =>
    setPicked((p) => {
      const next = { ...p };
      if (next[c._id]) delete next[c._id];
      else next[c._id] = c;
      return next;
    });
  const remove = (c: Cheque) => {
    const next = { ...picked };
    delete next[c._id];
    setPicked(next);
    if (!Object.keys(next).length) setConfirming(false);
  };

  const partyOptions = [
    ...customers.items.map((c) => ({ value: `c:${c._id}`, label: customerName(c) })),
    ...others.map((n) => ({ value: `p:${n}`, label: `${n} (other party)` })),
  ];

  const deposit = async () => {
    setLoading(true);
    try {
      await dispatch(depositCheques(chosen.map((c) => c._id))).unwrap();
      toNotify('Cheques deposited', `${chosen.length} cheque(s) deposited.`, 'SUCCESS');
      onClose();
      onDone();
    } catch (e) {
      toNotify("Couldn't deposit the cheques", e as string, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={!loading}
      title={confirming ? 'Confirm deposit' : 'Deposit cheques'}
      subtitle={confirming ? 'Remove any you do not want to deposit.' : 'Select the cheques.'}
      width={600}
    >
      <Box px={20} py={16}>
        {error ? (
          <Text c="red" size="sm">
            {error}
          </Text>
        ) : confirming ? (
          <ScrollArea.Autosize mah={380}>
            <Stack gap="sm">
              {chosen.map((c) => (
                <Group key={c._id} justify="space-between" wrap="nowrap">
                  {row(c)}
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-sm"
                    leftSection={<IconX size={14} />}
                    onClick={() => remove(c)}
                  >
                    Remove
                  </Button>
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>
        ) : (
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, sm: 2 }}>
              <TextInput
                placeholder="Search by cheque number"
                leftSection={<IconSearch size={16} aria-hidden />}
                value={search}
                onChange={(e) => {
                  setSearch(e.currentTarget.value);
                  setPage(1);
                }}
              />
              <Select
                searchable
                clearable
                placeholder="All parties"
                data={partyOptions}
                value={party}
                onChange={(v) => {
                  setParty(v);
                  setPage(1);
                }}
              />
            </SimpleGrid>
            <DatePickerInput
              type="range"
              clearable
              placeholder="Deposit date range"
              value={range}
              onChange={(v) => {
                setRange(v);
                setPage(1);
              }}
            />
            <Stack gap="sm" mih={120}>
              {items.map((c) => (
                <Checkbox
                  key={c._id}
                  checked={!!picked[c._id]}
                  onChange={() => toggle(c)}
                  label={row(c)}
                />
              ))}
              {!items.length && (
                <Text size="sm" c="dimmed">
                  No cheques waiting to be deposited.
                </Text>
              )}
            </Stack>
            {total > PAGE_SIZE && (
              <Pagination
                size="sm"
                total={Math.ceil(total / PAGE_SIZE)}
                value={page}
                onChange={setPage}
              />
            )}
          </Stack>
        )}
      </Box>
      <Stack className="sheet-footer" px={20} py={12} gap="xs">
        {chosen.length > 0 && (
          <Text size="sm" fw={600}>
            {chosen.length} selected · {formatLkr(sum)}
          </Text>
        )}
        <Group gap="xs" justify="flex-end" wrap="nowrap" grow preventGrowOverflow={false}>
          {confirming ? (
            <Button variant="default" disabled={loading} onClick={() => setConfirming(false)}>
              Back
            </Button>
          ) : (
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            disabled={!chosen.length}
            loading={loading}
            onClick={confirming ? deposit : () => setConfirming(true)}
          >
            {confirming ? `Confirm deposit (${chosen.length})` : 'Deposit'}
          </Button>
        </Group>
      </Stack>
    </ResponsiveModal>
  );
};

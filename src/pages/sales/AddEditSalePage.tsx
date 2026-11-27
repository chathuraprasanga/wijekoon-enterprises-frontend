import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconAlertTriangle, IconPlus, IconTrash } from '@tabler/icons-react';
import { BankBranchSelect } from '@/components/BankBranchSelect';
import { DepositDateInput } from '@/components/DepositDateInput';
import { useBusinessRules, ymdPlusDays } from '@/hooks/useBusinessRules';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { Loader } from '@/components/Loader';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { SaleStatusBadge, StatusBadge } from '@/components/StatusBadge';
import { toNotify } from '@/hooks/toNotify';
import { useLookup } from '@/hooks/useLookup';
import { useAppDispatch } from '@/store/hooks';
import {
  type Sale,
  type SalePayment,
  createSale,
  fetchSaleById,
  updateSale,
} from '@/store/saleSlice/saleSlice';
import {
  type Cheque,
  createCheque,
  deleteCheque,
  updateCheque,
} from '@/store/chequeSlice/chequeSlice';
import type { Customer } from '@/store/customerSlice/customerSlice';
import type { Product } from '@/store/productSlice/productSlice';
import { axiosInstance } from '@/interceptors/axiosInterceptor';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate, formatLkr, formatSize, toYmd } from '@/utils/format';
import { bankDisplay, branchDisplay } from '@/utils/bankData';
import { Field } from '@/components/Field';
import { useCan } from '@/utils/permissions';
import { customerName } from './saleLabels';

type Num = number | '';
type Line = { key: number; product: string | null; price: Num; qty: Num; disc: Num; tax: Num };
type ChequeRow = {
  key: number;
  id?: string; // set for a cheque that already exists (edit)
  amount: Num;
  bank: string;
  branch: string;
  number: string;
  deposit: Date | null;
  override?: boolean;
  saved?: boolean;
};

const n = (v: Num) => (v === '' ? 0 : v);
const round2 = (v: number) => Math.round(v * 100) / 100;
let nextKey = 1;
const newLine = (): Line => ({
  key: nextKey++,
  product: null,
  price: '',
  qty: 1,
  disc: '',
  tax: '',
});
const newCheque = (): ChequeRow => ({
  key: nextKey++,
  amount: '',
  bank: '',
  branch: '',
  number: '',
  deposit: new Date(),
});

// Discount and tax are typed per line as percentages; the server stores amounts.
const lineSub = (l: Line) => n(l.price) * n(l.qty);
const lineDisc = (l: Line) => (lineSub(l) * n(l.disc)) / 100;
const lineTax = (l: Line) => ((lineSub(l) - lineDisc(l)) * n(l.tax)) / 100;
const lineTotal = (l: Line) => lineSub(l) - lineDisc(l) + lineTax(l);

// Stored amount back to a percentage for editing: 12.5, not 12.500000001.
const pct = (amount: number, base: number): Num =>
  amount > 0 && base > 0 ? Number(((amount / base) * 100).toFixed(4)) : '';
const money = (v: number): Num => (v > 0 ? v : '');

const moneyInput = { decimalScale: 2, min: 0, hideControls: true, thousandSeparator: ',' } as const;

const AddEditSalePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wide = useMediaQuery('(min-width: 75em)');
  const can = useCan();
  // Cheques already on the sale are only seen here unless the role may edit / delete them.
  const canViewCheque = can('received-cheque:read');
  const canEditCheque = can('received-cheque:update');
  const canDeleteCheque = can('received-cheque:delete');
  const customers = useLookup<Customer>('customers');
  const products = useLookup<Product>('products');
  const noProducts = !products.loading && !products.error && products.items.length === 0;

  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<Sale | null>(null);
  const [customer, setCustomer] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(new Date());
  const [notes, setNotes] = useState('');
  const [customerRef, setCustomerRef] = useState('');
  const rules = useBusinessRules();
  // Payment due date (only when part is on credit): sale date + the configured days until edited.
  const [dueEdited, setDueEdited] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);
  const [discount, setDiscount] = useState<Num>('');
  const [tax, setTax] = useState<Num>('');
  const [shipping, setShipping] = useState<Num>('');
  const [other, setOther] = useState<Num>('');
  const [cash, setCash] = useState<Num>('');
  // Until cash is typed it defaults to everything the cheques do not cover (a fully paid sale).
  const [cashEdited, setCashEdited] = useState(false);
  const [cheques, setCheques] = useState<ChequeRow[]>([]);
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState(0);
  // Errors only show once that step has been tried (Next for step 1, Save for step 2).
  const [tried1, setTried1] = useState(false);
  const [tried2, setTried2] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  // Survive a retry after a half-finished save: never create the sale twice, never redo a done cheque.
  const created = useRef<Sale | null>(null);
  const removed = useRef<string[]>([]);

  const touch = () => setDirty(true);

  // Edit: load the sale and its cheques, then fill the form.
  useEffect(() => {
    if (!id) return;
    let live = true;
    (async () => {
      try {
        const sale = await dispatch(fetchSaleById(id)).unwrap();
        const { data } = await axiosInstance.get<{ data: Cheque[] }>('/cheques/paged', {
          params: { sale: id, page: 1, limit: 100 },
        });
        if (!live) return;
        setEditing(sale);
        setCustomer(sale.customer);
        setDate(new Date(sale.salesDate));
        setDueEdited(sale.dueDate ? sale.dueDate.slice(0, 10) : null);
        setNotes(sale.notes ?? '');
        setCustomerRef(sale.customerRef ?? '');
        setLines(
          sale.lineItems.map((li) => {
            const base = li.productPrice * li.quantity;
            return {
              key: nextKey++,
              product: li.product,
              price: li.productPrice,
              qty: li.quantity,
              disc: pct(li.discount, base),
              tax: pct(li.tax, base - li.discount),
            };
          }),
        );
        setDiscount(money(sale.discount));
        setTax(money(sale.tax));
        setShipping(money(sale.shipping));
        setOther(money(sale.otherExpenses));
        const cashPaid = sale.payments?.length
          ? sale.payments.filter((p) => p.method === 'cash').reduce((s, p) => s + p.amount, 0)
          : sale.paymentMethod === 'cash'
            ? sale.netTotal
            : 0;
        setCash(money(cashPaid));
        setCashEdited(true);
        setCheques(
          data.data.map((c) => ({
            key: nextKey++,
            id: c._id,
            amount: c.amount,
            bank: c.bankCode,
            branch: c.branchCode,
            number: c.chequeNumber,
            deposit: new Date(c.depositDate),
            saved: !canEditCheque || !canViewCheque, // read-only: never sent back on save
          })),
        );
      } catch (e) {
        if (live) setLoadError(typeof e === 'string' ? e : getErrorMessage(e));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [id, dispatch, canEditCheque, canViewCheque]);

  // --- the math (same rules as the server and the tablet app) ---
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const net = round2(subtotal + n(shipping) + n(other) + n(tax) - n(discount));
  const chequeValue = round2(cheques.reduce((s, c) => s + n(c.amount), 0));
  // Until cash is typed the whole total is credit (cash 0).
  const cashValue = cashEdited ? n(cash) : 0;
  // Credit is whatever cash and cheques do not cover: never typed.
  const credit = round2(Math.max(0, net - cashValue - chequeValue));
  const remaining = round2(net - (cashValue + chequeValue));
  // For now a cheque counts as paid like cash: no credit = paid, all credit = not paid.
  const status = credit <= 0 ? 'paid' : credit >= net - 0.01 ? 'not_paid' : 'partially_paid';
  const parts: SalePayment[] = [
    ...(cashValue > 0 ? [{ method: 'cash' as const, amount: cashValue }] : []),
    ...(credit > 0 ? [{ method: 'credit' as const, amount: credit }] : []),
    ...(chequeValue > 0 ? [{ method: 'cheque' as const, amount: chequeValue }] : []),
  ];

  const dueDate = dueEdited ?? ymdPlusDays(rules.saleDueDays, date ?? new Date());

  const picked = lines.filter((l) => l.product);
  const errors1: string[] = [];
  const errors2: string[] = [];
  const err1 = (cond: boolean, msg: string) => {
    if (cond && tried1) errors1.push(msg);
  };
  const err2 = (cond: boolean, msg: string) => {
    if (cond && tried2) errors2.push(msg);
  };
  err1(!customer, 'Select a customer');
  err1(picked.length === 0, 'Add at least one product');
  err1(
    picked.some((l) => n(l.qty) < 1),
    'Every quantity must be at least 1',
  );
  err1(
    picked.some((l) => n(l.disc) > 100 || n(l.tax) > 100),
    'Discount and tax are at most 100%',
  );
  err1(picked.length > 0 && net <= 0, 'The net total must be more than 0');
  err2(remaining < -0.01, `Cash and cheques are ${formatLkr(-remaining)} over the net total`);
  cheques.forEach((c, i) => {
    const row = `Cheque ${i + 1}`;
    err2(n(c.amount) <= 0, `${row}: enter an amount`);
    err2(!c.deposit, `${row}: select a deposit date`);
    err2(!c.bank, `${row}: select a bank`);
    err2(!c.branch, `${row}: select a branch`);
    err2(!/^\d{6}$/.test(c.number), `${row}: cheque number is 6 digits`);
    err2(
      cheques
        .slice(0, i)
        .some((o) => o.bank === c.bank && o.branch === c.branch && o.number === c.number),
      `${row}: same cheque entered twice`,
    );
  });
  const errors = step === 0 ? errors1 : errors2;
  // The same rules without the `tried` gates, per step (to decide if the flow may go on).
  const valid1 = () =>
    !!customer &&
    picked.length > 0 &&
    picked.every((l) => n(l.qty) >= 1 && n(l.disc) <= 100 && n(l.tax) <= 100) &&
    net > 0;
  const valid2 = () =>
    remaining >= -0.01 &&
    cheques.every(
      (c, i) =>
        n(c.amount) > 0 &&
        c.deposit &&
        !!c.bank &&
        !!c.branch &&
        /^\d{6}$/.test(c.number) &&
        !cheques
          .slice(0, i)
          .some((o) => o.bank === c.bank && o.branch === c.branch && o.number === c.number),
    );
  const showErr = (bad: boolean, msg?: string) => (tried1 && bad ? (msg ?? true) : undefined);
  const showErr2 = (bad: boolean, msg?: string) => (tried2 && bad ? (msg ?? true) : undefined);

  const next = () => {
    setTried1(true);
    if (valid1()) setStep(1);
  };

  const blocker = useBlocker(dirty && !saved);

  const setLine = (key: number, patch: Partial<Line>) => {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
    touch();
  };
  const setChq = (key: number, patch: Partial<ChequeRow>) => {
    setCheques((cs) => cs.map((c) => (c.key === key ? { ...c, ...patch } : c)));
    touch();
  };
  const pickProduct = (key: number, pid: string | null) => {
    const p = products.byId.get(pid ?? '');
    setLine(key, { product: pid, ...(p ? { price: p.sellingPrice } : {}) });
  };

  const submit = async () => {
    setError('');
    setTried1(true);
    // An earlier step with problems: go back to it so its errors are visible.
    if (!valid1()) return setStep(0);
    setTried2(true);
    if (!valid2()) return;
    setSaving(true);
    try {
      const body = {
        customer: customer!,
        salesDate: (date ?? new Date()).toISOString(),
        lineItems: picked.map((l) => {
          const p = products.byId.get(l.product!);
          // Edit: keep the stored name/SKU/size for a product we cannot look up any more.
          const old = editing?.lineItems.find((li) => li.product === l.product);
          return {
            product: l.product!,
            productName: p?.name ?? old?.productName ?? '',
            productSku: p?.sku ?? old?.productSku ?? '',
            size: p ? formatSize(p.size, p.unit) : (old?.size ?? ''),
            productPrice: n(l.price),
            quantity: n(l.qty),
            discount: round2(lineDisc(l)),
            tax: round2(lineTax(l)),
          };
        }),
        discount: n(discount),
        tax: n(tax),
        shipping: n(shipping),
        otherExpenses: n(other),
        payments: parts,
        notes: notes.trim(),
        customerRef: customerRef.trim(),
        ...(credit > 0 && { dueDate }),
      };
      created.current ??= id
        ? await dispatch(updateSale({ _id: id, ...body })).unwrap()
        : await dispatch(createSale(body)).unwrap();
      const sale = created.current;
      // Cheques removed while editing are deleted; kept ones updated in place; new ones created.
      for (const cid of [...removed.current]) {
        await dispatch(deleteCheque(cid)).unwrap();
        removed.current = removed.current.filter((x) => x !== cid);
      }
      for (const c of cheques.filter((c) => !c.saved)) {
        const payload = {
          customer: customer!,
          sale: sale._id,
          depositDate: c.deposit!.toISOString(),
          bankCode: c.bank,
          branchCode: c.branch,
          chequeNumber: c.number,
          amount: n(c.amount),
          ...(c.override && { overrideDepositLimit: true }),
        };
        if (c.id) await dispatch(updateCheque({ _id: c.id, ...payload })).unwrap();
        else await dispatch(createCheque(payload)).unwrap();
        c.saved = true;
      }
      toNotify(
        id ? 'Sale updated' : 'Sale created',
        `${sale.salesId} was ${id ? 'saved' : 'recorded'}.`,
        'SUCCESS',
      );
      setSaved(true);
      // Navigate after state settles so the blocker no longer sees unsaved edits.
      setTimeout(() => navigate(id ? '/app/sales' : `/app/sales/${sale._id}`), 0);
    } catch (e) {
      const msg = typeof e === 'string' ? e : getErrorMessage(e);
      const left = cheques.filter((c) => !c.saved).length;
      setError(
        created.current
          ? `Sale ${created.current.salesId} was saved, but ${left === 1 ? 'a cheque' : 'some cheques'} could not be saved: ${msg}. Save again to retry only what is left.`
          : msg,
      );
      toNotify(created.current ? "Couldn't save the cheques" : "Couldn't save sale", msg, 'ERROR');
    } finally {
      setSaving(false);
    }
  };

  const title = id ? `Edit sale ${editing?.salesId ?? ''}`.trim() : 'Create sale';
  if (loading || customers.loading || products.loading) return <Loader />;
  if (loadError) {
    return (
      <>
        <PageHeader title={title} />
        <InlineAlert tone="danger" title="Couldn't load this sale">
          {loadError}
        </InlineAlert>
      </>
    );
  }

  const canCheque = can('received-cheque:create');
  // Edit: the cheque records are what the sale records as paid by cheque; flag a mismatch.
  const savedCheque = editing?.payments?.length
    ? editing.payments.filter((p) => p.method === 'cheque').reduce((s, p) => s + p.amount, 0)
    : editing?.paymentMethod === 'cheque'
      ? editing.netTotal
      : 0;
  const activeProducts = products.items.filter(
    (p) => p.isActive || lines.some((l) => l.product === p._id),
  );
  const productData = activeProducts.map((p) => ({
    value: p._id,
    label: `${p.name} · ${formatSize(p.size, p.unit)} (${p.sku})`,
  }));

  return (
    <>
      <PageHeader
        title={title}
        badge={
          dirty && !saved ? (
            <StatusBadge tone="warning" label="Unsaved changes" icon={IconAlertTriangle} />
          ) : undefined
        }
        description={
          id
            ? 'Change the items or how it is paid, then save.'
            : 'Add the items, then choose how it is paid.'
        }
        crumbs={[
          { label: 'Trading' },
          { label: 'Sales', to: '/app/sales' },
          { label: id ? (editing?.salesId ?? 'Edit') : 'New sale' },
        ]}
      />
      <Stepper
        active={step}
        size="sm"
        mb="md"
        orientation="horizontal"
        aria-label={`Step ${step + 1} of 2`}
        onStepClick={(i) => (i === 0 ? setStep(0) : next())}
      >
        <Stepper.Step
          label="Sale details"
          description={
            <Text visibleFrom="sm" size="xs" span>
              Customer, items, adjustments
            </Text>
          }
        />
        <Stepper.Step
          label="Payment"
          description={
            <Text visibleFrom="sm" size="xs" span>
              Cash, credit and cheques
            </Text>
          }
        />
      </Stepper>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step === 0) next();
          else submit();
        }}
      >
        <SimpleGrid cols={{ base: 1, lg: 3 }} spacing="md" style={{ alignItems: 'start' }}>
          <Stack gap="md" style={{ gridColumn: wide ? 'span 2' : undefined, minWidth: 0 }}>
            {errors.length > 0 && (
              <InlineAlert
                tone="danger"
                title={
                  errors.length === 1
                    ? 'One thing needs fixing'
                    : `${errors.length} things need fixing`
                }
              >
                {errors.join(' · ')}
              </InlineAlert>
            )}
            {error && (
              <InlineAlert tone="danger" title="Couldn't finish">
                {error}
              </InlineAlert>
            )}

            {step === 0 && (
              <>
                <SectionCard title="Sale details">
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Select
                      label="Customer"
                      withAsterisk
                      searchable
                      placeholder="Select customer"
                      data={customers.items
                        .filter((c) => c.isActive || c._id === customer)
                        .map((c) => ({ value: c._id, label: customerName(c) }))}
                      value={customer}
                      error={showErr(!customer)}
                      onChange={(v) => {
                        setCustomer(v);
                        touch();
                      }}
                    />
                    <DateInput
                      label="Sale date"
                      placeholder="Select date"
                      value={date}
                      maxDate={new Date()}
                      onChange={(v) => {
                        setDate(v ? new Date(v) : null);
                        touch();
                      }}
                    />
                    <TextInput
                      placeholder="Enter customer PO / reference number"
                      label="Customer reference"
                      value={customerRef}
                      maxLength={60}
                      onChange={(e) => {
                        setCustomerRef(e.currentTarget.value);
                        touch();
                      }}
                    />
                  </SimpleGrid>
                  <Textarea
                    placeholder="Optional notes"
                    mt="md"
                    label="Notes"
                    autosize
                    minRows={2}
                    maxRows={5}
                    maxLength={500}
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.currentTarget.value);
                      touch();
                    }}
                  />
                </SectionCard>

                <SectionCard
                  title="Items"
                  action={
                    <Button
                      variant="default"
                      size="xs"
                      leftSection={<IconPlus size={14} aria-hidden />}
                      // no more lines than products to pick from, and finish the empty one first
                      disabled={
                        products.loading ||
                        lines.length >= products.items.length ||
                        lines.some((l) => !l.product)
                      }
                      onClick={() => {
                        setLines((ls) => [...ls, newLine()]);
                        touch();
                      }}
                    >
                      Add item
                    </Button>
                  }
                >
                  <Stack gap="md">
                    {noProducts && (
                      <EmptyState
                        title="No products yet"
                        description="A sale needs products. Add some first, then come back to create the sale."
                        action={
                          <Button component={Link} to="/app/products" variant="default">
                            Go to products
                          </Button>
                        }
                      />
                    )}
                    {!noProducts &&
                      lines.map((l, i) => (
                        <Box
                          key={l.key}
                          p="sm"
                          style={{ border: '1px solid var(--ldg-border)', borderRadius: 8 }}
                        >
                          <Group justify="space-between" mb={6} wrap="nowrap">
                            <Text size="sm" fw={600}>
                              Item {i + 1}
                            </Text>
                            {lines.length > 1 && (
                              <ActionIcon
                                variant="subtle"
                                c="var(--ldg-accent-text)"
                                aria-label={`Remove item ${i + 1}`}
                                onClick={() => {
                                  setLines((ls) => ls.filter((x) => x.key !== l.key));
                                  touch();
                                }}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            )}
                          </Group>
                          <Stack gap="sm">
                            <Select
                              label="Product"
                              searchable
                              placeholder="Select product"
                              data={productData}
                              value={l.product}
                              error={showErr(i === 0 && picked.length === 0)}
                              onChange={(v) => pickProduct(l.key, v)}
                            />
                            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                              <NumberInput
                                label="Unit price"
                                placeholder="Auto-filled"
                                {...moneyInput}
                                value={l.price}
                                onChange={(v) =>
                                  setLine(l.key, { price: v === '' ? '' : Number(v) })
                                }
                              />
                              <NumberInput
                                label="Quantity"
                                placeholder="1"
                                min={1}
                                allowDecimal={false}
                                hideControls
                                value={l.qty}
                                error={showErr(!!l.product && n(l.qty) < 1)}
                                onChange={(v) => setLine(l.key, { qty: v === '' ? '' : Number(v) })}
                              />
                              <NumberInput
                                label="Discount %"
                                placeholder="0"
                                min={0}
                                max={100}
                                decimalScale={2}
                                hideControls
                                value={l.disc}
                                error={showErr(n(l.disc) > 100)}
                                onChange={(v) =>
                                  setLine(l.key, { disc: v === '' ? '' : Number(v) })
                                }
                              />
                              <NumberInput
                                label="Tax %"
                                placeholder="0"
                                min={0}
                                max={100}
                                decimalScale={2}
                                hideControls
                                value={l.tax}
                                error={showErr(n(l.tax) > 100)}
                                onChange={(v) => setLine(l.key, { tax: v === '' ? '' : Number(v) })}
                              />
                            </SimpleGrid>
                            <Group justify="space-between">
                              <Text size="sm" c="dimmed">
                                Line total
                              </Text>
                              <Text size="sm" fw={600} className="num">
                                {formatLkr(round2(lineTotal(l)))}
                              </Text>
                            </Group>
                          </Stack>
                        </Box>
                      ))}
                  </Stack>
                </SectionCard>

                <SectionCard title="Order adjustments" subtitle="Amounts for the whole order.">
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <NumberInput
                      label="Shipping"
                      placeholder="0.00"
                      {...moneyInput}
                      value={shipping}
                      onChange={(v) => {
                        setShipping(v === '' ? '' : Number(v));
                        touch();
                      }}
                    />
                    <NumberInput
                      label="Other expenses"
                      placeholder="0.00"
                      {...moneyInput}
                      value={other}
                      onChange={(v) => {
                        setOther(v === '' ? '' : Number(v));
                        touch();
                      }}
                    />
                    <NumberInput
                      label="Tax"
                      placeholder="0.00"
                      {...moneyInput}
                      value={tax}
                      onChange={(v) => {
                        setTax(v === '' ? '' : Number(v));
                        touch();
                      }}
                    />
                    <NumberInput
                      label="Discount"
                      placeholder="0.00"
                      {...moneyInput}
                      value={discount}
                      onChange={(v) => {
                        setDiscount(v === '' ? '' : Number(v));
                        touch();
                      }}
                    />
                  </SimpleGrid>
                </SectionCard>
              </>
            )}

            {step === 1 && (
              <SectionCard
                title="Payment"
                subtitle="Credit is whatever cash and cheques do not cover."
                action={
                  canCheque ? (
                    <Button
                      variant="default"
                      size="xs"
                      leftSection={<IconPlus size={14} aria-hidden />}
                      onClick={() => {
                        setCheques((cs) => [...cs, newCheque()]);
                        touch();
                      }}
                    >
                      Add cheque
                    </Button>
                  ) : undefined
                }
              >
                <Stack gap="md">
                  {editing && Math.abs(savedCheque - chequeValue) > 0.01 && (
                    <InlineAlert tone="warning" title="Cheque records differ from the sale">
                      The sale recorded {formatLkr(savedCheque)} by cheque but its cheque records
                      add up to {formatLkr(chequeValue)}. Saving updates the sale to match the
                      cheques below.
                    </InlineAlert>
                  )}
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <NumberInput
                      label="Cash"
                      placeholder="0.00"
                      {...moneyInput}
                      value={cashEdited ? cash : ''}
                      error={showErr2(remaining < -0.01)}
                      onChange={(v) => {
                        setCash(v === '' ? '' : Number(v));
                        setCashEdited(true);
                        touch();
                      }}
                    />
                    <NumberInput
                      label="Credit"
                      description="Calculated from the rest"
                      placeholder="Calculated automatically"
                      {...moneyInput}
                      value={credit}
                      disabled
                    />
                  </SimpleGrid>
                  {credit > 0 && (
                    <DateInput
                      label="Payment due date"
                      description={`Sale date + ${rules.saleDueDays} days unless you change it`}
                      placeholder="Select date"
                      value={dueDate}
                      minDate={date ?? undefined}
                      onChange={(v) => {
                        setDueEdited(v ? toYmd(v) : null);
                        touch();
                      }}
                    />
                  )}
                  {cheques.map((c, i) => (
                    <Box
                      key={c.key}
                      p="sm"
                      style={{ border: '1px solid var(--ldg-border)', borderRadius: 8 }}
                    >
                      <Group justify="space-between" mb={6} wrap="nowrap">
                        <Text size="sm" fw={600}>
                          Cheque {i + 1}
                        </Text>
                        {(!c.id || canDeleteCheque) && (
                          <ActionIcon
                            variant="subtle"
                            c="var(--ldg-accent-text)"
                            aria-label={`Remove cheque ${i + 1}`}
                            onClick={() => {
                              if (c.id) removed.current.push(c.id);
                              setCheques((cs) => cs.filter((x) => x.key !== c.key));
                              touch();
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Group>
                      {c.id && !canViewCheque ? (
                        <SimpleGrid cols={{ base: 1, sm: 2 }}>
                          <Field label="Amount">{formatLkr(n(c.amount))}</Field>
                          <Field label="Deposit date">** *** ****</Field>
                          <Field label="Bank">***** (****)</Field>
                          <Field label="Branch">{c.branch}</Field>
                          <Field label="Cheque number">
                            <span className="mono">{c.number}</span>
                          </Field>
                        </SimpleGrid>
                      ) : c.id && !canEditCheque ? (
                        <SimpleGrid cols={{ base: 1, sm: 2 }}>
                          <Field label="Amount">{formatLkr(n(c.amount))}</Field>
                          <Field label="Deposit date">
                            {c.deposit ? formatDate(c.deposit) : '—'}
                          </Field>
                          <Field label="Bank">{bankDisplay(c.bank)}</Field>
                          <Field label="Branch">{branchDisplay(c.bank, c.branch)}</Field>
                          <Field label="Cheque number">
                            <span className="mono">{c.number}</span>
                          </Field>
                        </SimpleGrid>
                      ) : (
                        <SimpleGrid cols={{ base: 1, sm: 2 }}>
                          <NumberInput
                            label="Amount"
                            placeholder="0.00"
                            {...moneyInput}
                            value={c.amount}
                            error={showErr2(n(c.amount) <= 0)}
                            onChange={(v) => setChq(c.key, { amount: v === '' ? '' : Number(v) })}
                          />
                          <DepositDateInput
                            value={c.deposit}
                            error={showErr2(!c.deposit)}
                            override={!!c.override}
                            onOverrideChange={(o) => setChq(c.key, { override: o })}
                            onChange={(v) => setChq(c.key, { deposit: v })}
                          />
                          <BankBranchSelect
                            bankCode={c.bank}
                            branchCode={c.branch}
                            bankError={showErr2(!c.bank) && 'Select a bank'}
                            branchError={showErr2(!c.branch) && 'Select a branch'}
                            onChange={(v) =>
                              setChq(c.key, { bank: v.bankCode, branch: v.branchCode })
                            }
                          />
                          <TextInput
                            label="Cheque number"
                            placeholder="6 digits"
                            maxLength={6}
                            value={c.number}
                            error={showErr2(!/^\d{6}$/.test(c.number)) && 'Must be 6 digits'}
                            onChange={(e) =>
                              setChq(c.key, { number: e.currentTarget.value.replace(/\D/g, '') })
                            }
                          />
                        </SimpleGrid>
                      )}
                    </Box>
                  ))}
                </Stack>
              </SectionCard>
            )}
          </Stack>

          <Box style={{ position: 'sticky', top: 16 }}>
            <SectionCard title="Order summary">
              <Stack gap={6}>
                {picked.length === 0 && (
                  <Text size="sm" c="dimmed">
                    Items you add appear here.
                  </Text>
                )}
                {picked.map((l) => (
                  <Group key={l.key} justify="space-between" wrap="nowrap" align="flex-start">
                    <Text size="sm" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                      {products.byId.get(l.product!)?.name ?? 'Product'} × {n(l.qty)}
                    </Text>
                    <Text size="sm" className="num">
                      {formatLkr(round2(lineTotal(l)))}
                    </Text>
                  </Group>
                ))}
                <Row label="Subtotal" value={subtotal} bordered />
                {n(shipping) > 0 && <Row label="Shipping" value={n(shipping)} />}
                {n(other) > 0 && <Row label="Other expenses" value={n(other)} />}
                {n(tax) > 0 && <Row label="Tax" value={n(tax)} />}
                {n(discount) > 0 && <Row label="Discount" value={-n(discount)} />}
                <Row label="Net total" value={net} strong bordered />
                {/* Payment only matters once there is something to pay, on the Payment step */}
                {step === 1 && net > 0 && (
                  <>
                    <Text className="eyebrow" mt="sm">
                      Paid by
                    </Text>
                    {parts.map((p) => (
                      <Row
                        key={p.method}
                        label={
                          p.method === 'cash' ? 'Cash' : p.method === 'credit' ? 'Credit' : 'Cheque'
                        }
                        value={p.amount}
                      />
                    ))}
                    <Group justify="space-between" mt="xs">
                      <Text size="sm" c="dimmed">
                        Status
                      </Text>
                      <SaleStatusBadge status={status} />
                    </Group>
                  </>
                )}
              </Stack>
            </SectionCard>
          </Box>
        </SimpleGrid>

        <Group
          justify="flex-end"
          gap="xs"
          pt="md"
          mt="md"
          style={{ borderTop: '1px solid var(--ldg-border)' }}
        >
          {step === 0 ? (
            <Button variant="default" onClick={() => navigate('/app/sales')} disabled={saving}>
              Cancel
            </Button>
          ) : (
            <Button variant="default" onClick={() => setStep(0)} disabled={saving}>
              Back
            </Button>
          )}
          {step === 0 ? (
            <Button type="submit">Next</Button>
          ) : (
            <Button type="submit" loading={saving}>
              {id ? 'Save changes' : 'Create sale'}
            </Button>
          )}
        </Group>
      </form>
      <ConfirmDialog
        opened={blocker.state === 'blocked'}
        title="Discard unsaved changes?"
        destructive={false}
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onClose={() => blocker.state === 'blocked' && blocker.reset()}
        onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
      >
        Leaving now throws away what you entered.
      </ConfirmDialog>
    </>
  );
};

const Row = ({
  label,
  value,
  strong,
  bordered,
}: {
  label: string;
  value: number;
  strong?: boolean;
  bordered?: boolean;
}) => (
  <Group
    justify="space-between"
    wrap="nowrap"
    pt={bordered ? 6 : 0}
    style={bordered ? { borderTop: '1px solid var(--ldg-border)' } : undefined}
  >
    <Text size="sm" c={strong ? undefined : 'dimmed'} fw={strong ? 600 : 400}>
      {label}
    </Text>
    <Text size="sm" fw={strong ? 700 : 400} className="num">
      {formatLkr(round2(value))}
    </Text>
  </Group>
);

export default AddEditSalePage;

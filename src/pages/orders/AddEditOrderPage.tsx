import { useEffect, useRef, useState } from 'react';
import { useMediaQuery } from '@mantine/hooks';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineAlert } from '@/components/InlineAlert';
import { Loader } from '@/components/Loader';
import { PageHeader } from '@/components/PageHeader';
import { SectionCard } from '@/components/SectionCard';
import { StatusBadge } from '@/components/StatusBadge';
import { toNotify } from '@/hooks/toNotify';
import { useLookup } from '@/hooks/useLookup';
import { useAppDispatch } from '@/store/hooks';
import type { Bank } from '@/store/bankSlice/bankSlice';
import {
  type Order,
  type OrderInput,
  type PaymentInput,
  type SupplierItem,
  type TransferableCheque,
  createOrder,
  createPayment,
  fetchOrderById,
  fetchSupplierItems,
  fetchTransferableCheques,
  updateOrder,
} from '@/store/orderSlice/orderSlice';
import type { Supplier } from '@/store/supplierSlice/supplierSlice';
import { formatDate, formatLkr, formatSize, toYmd } from '@/utils/format';
import { useBusinessRules, ymdPlusDays } from '@/hooks/useBusinessRules';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useCan } from '@/utils/permissions';
import { METHOD_LABELS } from './orderLabels';
import { PaymentRowStatusBadge, PaymentStatusBadge } from './orderBadges';

type Num = number | '';
type Line = { key: number; product: string | null; price: Num; qty: Num; disc: Num; tax: Num };
// Our cheque: written from one of our bank accounts to the supplier.
type OurCheque = {
  key: number;
  amount: Num;
  bank: string | null;
  number: string;
  date: string;
};
// Customer cheque: a received cheque handed on to the supplier; its own amount is the payment.
type CustCheque = { key: number; cheque: string | null };

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
const newOurs = (): OurCheque => ({
  key: nextKey++,
  amount: '',
  bank: null,
  number: '',
  date: toYmd(new Date()),
});
const newCust = (): CustCheque => ({ key: nextKey++, cheque: null });

// Discount and tax are typed per line as percentages; the server stores amounts.
const lineSub = (l: Line) => n(l.price) * n(l.qty);
const lineDisc = (l: Line) => round2((lineSub(l) * n(l.disc)) / 100);
const lineTax = (l: Line) => round2(((lineSub(l) - lineDisc(l)) * n(l.tax)) / 100);
const lineTotal = (l: Line) => lineSub(l) - lineDisc(l) + lineTax(l);

// Stored amount back to a percentage for editing: 12.5, not 12.500000001.
const pct = (amount: number, base: number): Num =>
  amount > 0 && base > 0 ? Number(((amount / base) * 100).toFixed(4)) : '';
const money = (v: number): Num => (v > 0 ? v : '');

const moneyInput = { decimalScale: 2, min: 0, hideControls: true, thousandSeparator: ',' } as const;

const AddEditOrderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wide = useMediaQuery('(min-width: 75em)');
  const can = useCan();
  const suppliers = useLookup<Supplier>('suppliers');
  const banks = useLookup<Bank>('banks');

  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<Order | null>(null);
  const [supplier, setSupplier] = useState<string | null>(null);
  const [items, setItems] = useState<SupplierItem[]>([]);
  const [itemsFor, setItemsFor] = useState<string | null>(null);
  const [date, setDate] = useState<string>(toYmd(new Date()));
  const [supplierRef, setSupplierRef] = useState('');
  // Payment due date: order date + the configured days until the user edits (or clears) it.
  const rules = useBusinessRules();
  const [dueEdited, setDueEdited] = useState<string | null>(null);
  const dueDate = dueEdited ?? ymdPlusDays(rules.orderDueDays, date);
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<Line[]>(() => [newLine()]);
  const [discount, setDiscount] = useState<Num>('');
  const [tax, setTax] = useState<Num>('');
  const [shipping, setShipping] = useState<Num>('');
  const [other, setOther] = useState<Num>('');
  const [cash, setCash] = useState<Num>('');
  // Until cash is typed it defaults to everything the cheques do not cover (a fully paid order).
  const [cashEdited, setCashEdited] = useState(false);
  const [ours, setOurs] = useState<OurCheque[]>([]);
  const [custs, setCusts] = useState<CustCheque[]>([]);
  const [transferable, setTransferable] = useState<TransferableCheque[]>([]);
  const [transferableError, setTransferableError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [step, setStep] = useState(0);
  // Errors only show once that step has been tried (Next for step 1, Save for step 2).
  const [tried1, setTried1] = useState(false);
  const [tried2, setTried2] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  // Survive a retry after a half-finished save: never create the order twice, never redo a payment.
  const created = useRef<Order | null>(null);
  const paid = useRef<Set<string>>(new Set());
  const keys = useRef<Map<string, string>>(new Map());

  const touch = () => setDirty(true);
  const canPay = can('order:update');

  // Once money has moved, only the header may change (the server enforces it too).
  const locked =
    !!editing &&
    (editing.orderStatus === 'cancelled' ||
      (editing.payments ?? []).some((p) => p.status === 'completed'));

  // Edit: load the order, then fill the form.
  useEffect(() => {
    if (!id) return;
    let live = true;
    dispatch(fetchOrderById(id))
      .unwrap()
      .then((o) => {
        if (!live) return;
        setEditing(o);
        setSupplier(o.supplier._id);
        setDate(toYmd(o.orderDate));
        setSupplierRef(o.supplierRef ?? '');
        setDueEdited(toYmd(o.dueDate));
        setNotes(o.notes ?? '');
        setLines(
          o.lineItems.map((l) => {
            const base = l.unitPrice * l.quantity;
            return {
              key: nextKey++,
              product: l.product,
              price: l.unitPrice,
              qty: l.quantity,
              disc: pct(l.discount, base),
              tax: pct(l.tax, base - l.discount),
            };
          }),
        );
        setDiscount(money(o.discount));
        setTax(money(o.tax));
        setShipping(money(o.shipping));
        setOther(money(o.otherExpenses));
      })
      .catch((e) => live && setLoadError(typeof e === 'string' ? e : getErrorMessage(e)))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [id, dispatch]);

  // The supplier's own products, for the pickers.
  useEffect(() => {
    if (!supplier) return;
    let live = true;
    dispatch(fetchSupplierItems(supplier))
      .unwrap()
      .then((r) => live && setItems(r))
      .catch((e) => live && toNotify("Couldn't load items", e as string, 'ERROR'))
      .finally(() => live && setItemsFor(supplier));
    return () => {
      live = false;
    };
  }, [supplier, dispatch]);

  // Cheques in hand that may be handed to a supplier (create only; payments are made on save).
  useEffect(() => {
    if (step !== 1 || id || !canPay || transferable.length || transferableError) return;
    dispatch(fetchTransferableCheques())
      .unwrap()
      .then(setTransferable)
      .catch((e) => setTransferableError(e as string));
  }, [step, id, canPay, transferable.length, transferableError, dispatch]);

  const itemsLoading = !!supplier && itemsFor !== supplier;
  const byId = new Map(items.map((i) => [i._id, i]));

  // --- the math (same rules as the server) ---
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const net = round2(subtotal + n(shipping) + n(other) + n(tax) - n(discount));
  const oursValue = round2(ours.reduce((s, c) => s + n(c.amount), 0));
  const custValue = round2(
    custs.reduce((s, c) => s + (transferable.find((t) => t._id === c.cheque)?.amount ?? 0), 0),
  );
  const chequeValue = round2(oursValue + custValue);
  // Until cash is typed the whole total is credit (cash 0).
  const cashValue = cashEdited ? n(cash) : 0;
  // Credit is whatever cash and cheques do not cover: never typed.
  const credit = round2(Math.max(0, net - cashValue - chequeValue));
  const remaining = round2(net - (cashValue + chequeValue));
  // A cheque only counts as paid once it clears; until then just cash is paid.
  const status =
    cashValue >= net - 0.01 && net > 0 ? 'paid' : cashValue > 0 ? 'partially_paid' : 'unpaid';

  const picked = lines.filter((l) => l.product);
  const errors1: string[] = [];
  const errors2: string[] = [];
  const err1 = (cond: boolean, msg: string) => {
    if (cond && tried1) errors1.push(msg);
  };
  const err2 = (cond: boolean, msg: string) => {
    if (cond && tried2) errors2.push(msg);
  };
  err1(!supplier, 'Select a supplier');
  if (!locked) {
    err1(picked.length === 0, 'Add at least one item');
    err1(
      picked.some((l) => n(l.qty) < 1),
      'Every quantity must be at least 1',
    );
    err1(
      picked.some((l) => n(l.disc) > 100 || n(l.tax) > 100),
      'Discount and tax are at most 100%',
    );
    err1(picked.length > 0 && net <= 0, 'The net total must be more than 0');
  }
  err2(
    !!dueDate && !!date && dueDate < date,
    "The payment due date can't be before the order date",
  );
  if (!id && canPay) {
    err2(remaining < -0.01, `Cash and cheques are ${formatLkr(-remaining)} over the net total`);
    ours.forEach((c, i) => {
      const row = `Our cheque ${i + 1}`;
      err2(n(c.amount) <= 0, `${row}: enter an amount`);
      err2(!c.bank, `${row}: select a bank account`);
      err2(!/^\d{6}$/.test(c.number), `${row}: cheque number is 6 digits`);
      err2(!c.date, `${row}: select the cheque date`);
      err2(
        ours.slice(0, i).some((o) => o.bank === c.bank && o.number === c.number),
        `${row}: same cheque entered twice`,
      );
    });
    custs.forEach((c, i) => err2(!c.cheque, `Customer cheque ${i + 1}: select a cheque`));
  }
  const errors = step === 0 ? errors1 : errors2;
  // The same rules without the `tried` gates, per step (to decide if the flow may go on).
  const valid1 = () =>
    !!supplier &&
    (locked ||
      (picked.length > 0 &&
        picked.every((l) => n(l.qty) >= 1 && n(l.disc) <= 100 && n(l.tax) <= 100) &&
        net > 0));
  const valid2 = () =>
    !(dueDate && date && dueDate < date) &&
    (id ||
      !canPay ||
      (remaining >= -0.01 &&
        ours.every(
          (c, i) =>
            n(c.amount) > 0 &&
            c.bank &&
            /^\d{6}$/.test(c.number) &&
            c.date &&
            !ours.slice(0, i).some((o) => o.bank === c.bank && o.number === c.number),
        ) &&
        custs.every((c) => c.cheque)));
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
  // Expected clearing dates are computed by the server from Settings; shown here read-only.
  const ourClearing = (c: OurCheque) => ymdPlusDays(rules.issuedClearingDays, c.date);
  const custClearing = () => ymdPlusDays(rules.transferClearingDays);
  const setOur = (key: number, patch: Partial<OurCheque>) => {
    setOurs((cs) => cs.map((c) => (c.key === key ? { ...c, ...patch } : c)));
    touch();
  };
  const pickProduct = (key: number, pid: string | null) => {
    const p = byId.get(pid ?? '');
    setLine(key, { product: pid, ...(p ? { price: p.buyingPrice } : {}) });
  };
  const pickSupplier = (v: string | null) => {
    if (v === supplier) return;
    setSupplier(v);
    setItems([]);
    if (picked.length)
      toNotify('Items cleared', 'Items belong to a supplier, so the list was reset.', 'WARNING');
    setLines([newLine()]);
    touch();
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
      const header: OrderInput = {
        orderDate: date,
        supplierRef: supplierRef.trim(),
        dueDate: dueDate || null,
        notes: notes.trim(),
      };
      const body: OrderInput = locked
        ? header
        : {
            ...header,
            supplier: supplier!,
            discount: n(discount),
            tax: n(tax),
            shipping: n(shipping),
            otherExpenses: n(other),
            lineItems: picked.map((l) => ({
              product: l.product!,
              quantity: n(l.qty),
              unitPrice: n(l.price),
              discount: lineDisc(l),
              tax: lineTax(l),
            })),
          };
      created.current ??= id
        ? await dispatch(updateOrder({ id, body })).unwrap()
        : await dispatch(createOrder(body)).unwrap();
      const order = created.current;
      // New orders: pay what was entered. Each payment has a fixed key, so a retry never doubles it.
      const today = toYmd(new Date());
      const plan: { id: string; body: Omit<PaymentInput, 'idempotencyKey'> }[] = id
        ? []
        : [
            ...(cashValue > 0
              ? [
                  {
                    id: 'cash',
                    body: { method: 'cash' as const, amount: cashValue, paymentDate: today },
                  },
                ]
              : []),
            ...ours.map((c) => ({
              id: `o${c.key}`,
              body: {
                method: 'issued_cheque' as const,
                amount: n(c.amount),
                paymentDate: today,
                cheque: {
                  bank: c.bank!,
                  chequeNumber: c.number.trim(),
                  chequeDate: c.date,
                },
              },
            })),
            ...custs.map((c) => ({
              id: `c${c.key}`,
              body: {
                method: 'customer_cheque' as const,
                customerCheque: c.cheque!,
                paymentDate: today,
                transferDate: today,
              },
            })),
          ];
      for (const p of plan) {
        if (paid.current.has(p.id)) continue;
        if (!keys.current.has(p.id)) keys.current.set(p.id, crypto.randomUUID());
        await dispatch(
          createPayment({
            id: order._id,
            body: { ...p.body, idempotencyKey: keys.current.get(p.id)! },
          }),
        ).unwrap();
        paid.current.add(p.id);
      }
      toNotify(
        id ? 'Order updated' : 'Order created',
        `${order.orderNo} was ${id ? 'saved' : 'recorded'}.`,
        'SUCCESS',
      );
      setSaved(true);
      // Navigate after state settles so the blocker no longer sees unsaved edits.
      setTimeout(() => navigate('/app/orders'), 0);
    } catch (e) {
      const msg = typeof e === 'string' ? e : getErrorMessage(e);
      const left = (cashValue > 0 ? 1 : 0) + ours.length + custs.length - paid.current.size;
      setError(
        created.current
          ? `Order ${created.current.orderNo} was saved, but ${left === 1 ? 'a payment' : 'some payments'} could not be recorded: ${msg}. Save again to retry only what is left.`
          : msg,
      );
      toNotify(
        created.current ? "Couldn't record the payments" : "Couldn't save order",
        msg,
        'ERROR',
      );
    } finally {
      setSaving(false);
    }
  };

  const title = id ? `Edit order ${editing?.orderNo ?? ''}`.trim() : 'Create order';
  if (loading || suppliers.loading) return <Loader />;
  if (loadError) {
    return (
      <>
        <PageHeader title={title} />
        <InlineAlert tone="danger" title="Couldn't load this order">
          {loadError}
        </InlineAlert>
      </>
    );
  }

  const itemData = [
    ...items.map((p) => ({
      value: p._id,
      label: `${p.name} · ${formatSize(p.size, p.unit)} (${p.sku})`,
    })),
    // Edit: keep a line's product selectable even if it is no longer in the supplier's active list.
    ...(editing?.lineItems ?? [])
      .filter((l) => !byId.has(l.product))
      .map((l) => ({ value: l.product, label: `${l.productName} · ${l.size} (${l.productSku})` })),
  ];
  const noItems = !!supplier && !itemsLoading && itemData.length === 0;
  const activeSuppliers = suppliers.items.filter((s) => s.isActive || s._id === supplier);
  const bankData = banks.items
    .filter((b) => b.isActive)
    .map((b) => ({ value: b._id, label: `${b.bankName} · ${b.accountNumberMasked}` }));
  const custData = (self: CustCheque) =>
    transferable
      .filter((t) => t._id === self.cheque || !custs.some((c) => c.cheque === t._id))
      .map((t) => ({
        value: t._id,
        label: `${t.chequeNumber} · ${formatLkr(t.amount)} · ${formatDate(t.depositDate)}${
          t.customer?.firstName ? ` · ${t.customer.firstName} ${t.customer.lastName ?? ''}` : ''
        }`,
      }));
  const payingNow = !id && canPay;

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
            ? 'Change the items or dates, then save.'
            : 'Add the items, then choose how it is paid.'
        }
        crumbs={[
          { label: 'Trading' },
          { label: 'Orders', to: '/app/orders' },
          { label: id ? (editing?.orderNo ?? 'Edit') : 'New order' },
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
          label="Order details"
          description={
            <Text visibleFrom="sm" size="xs" span>
              Supplier, items, adjustments
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
            {editing?.orderStatus === 'cancelled' && (
              <InlineAlert tone="warning" title="This order is cancelled">
                A cancelled order can&apos;t be edited.
              </InlineAlert>
            )}
            {locked && editing?.orderStatus !== 'cancelled' && (
              <InlineAlert tone="info" title="Items and prices are locked">
                This order has payments. Reverse the payments to change items, prices or the
                supplier; you can still update the reference, dates and notes.
              </InlineAlert>
            )}
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
                <SectionCard title="Order details">
                  <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Select
                      label="Supplier"
                      withAsterisk
                      searchable
                      placeholder="Select supplier"
                      disabled={locked}
                      data={activeSuppliers.map((s) => ({ value: s._id, label: s.name }))}
                      value={supplier}
                      error={showErr(!supplier)}
                      onChange={pickSupplier}
                    />
                    <DateInput
                      label="Order date"
                      placeholder="Select date"
                      value={date}
                      maxDate={new Date()}
                      onChange={(v) => {
                        setDate(toYmd(v));
                        touch();
                      }}
                    />
                    <TextInput
                      placeholder="Enter supplier invoice number"
                      label="Supplier invoice / reference"
                      value={supplierRef}
                      maxLength={60}
                      onChange={(e) => {
                        setSupplierRef(e.currentTarget.value);
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
                      // no more lines than items to pick from, and finish the empty one first
                      disabled={
                        locked ||
                        !supplier ||
                        itemsLoading ||
                        lines.length >= itemData.length ||
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
                    {noItems && (
                      <EmptyState
                        title="No items for this supplier"
                        description="An order needs products from its supplier. Add some first, then come back to create the order."
                        action={
                          <Button component={Link} to="/app/products" variant="default">
                            Go to products
                          </Button>
                        }
                      />
                    )}
                    {!noItems &&
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
                            {lines.length > 1 && !locked && (
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
                              placeholder={supplier ? 'Select product' : 'Select a supplier first'}
                              disabled={locked || !supplier || itemsLoading}
                              // an item already on another row can't be picked again
                              data={itemData.filter(
                                (o) =>
                                  o.value === l.product ||
                                  !lines.some((x) => x.product === o.value),
                              )}
                              value={l.product}
                              error={showErr(i === 0 && picked.length === 0)}
                              onChange={(v) => pickProduct(l.key, v)}
                            />
                            <SimpleGrid cols={{ base: 2, sm: 4 }}>
                              <NumberInput
                                label="Unit price"
                                placeholder="Auto-filled"
                                {...moneyInput}
                                disabled={locked}
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
                                disabled={locked}
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
                                disabled={locked}
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
                                disabled={locked}
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
                      disabled={locked}
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
                      disabled={locked}
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
                      disabled={locked}
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
                      disabled={locked}
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
                subtitle={
                  id
                    ? 'Payments are recorded from the order page.'
                    : 'Credit is whatever cash and cheques do not cover.'
                }
                action={
                  payingNow ? (
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <Button
                          variant="default"
                          size="xs"
                          leftSection={<IconPlus size={14} aria-hidden />}
                        >
                          Add cheque
                        </Button>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          onClick={() => {
                            setOurs((cs) => [...cs, newOurs()]);
                            touch();
                          }}
                        >
                          Our cheque
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => {
                            setCusts((cs) => [...cs, newCust()]);
                            touch();
                          }}
                        >
                          Customer cheque
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  ) : undefined
                }
              >
                <Stack gap="md">
                  {id && editing && (
                    <InlineAlert tone="info" title="Record or reverse payments on the order">
                      Cash, cheque and credit payments for this order are managed from its page.
                      <Box mt="xs">
                        <Button
                          component={Link}
                          to={`/app/orders/${editing._id}`}
                          size="xs"
                          variant="default"
                        >
                          Open order
                        </Button>
                      </Box>
                    </InlineAlert>
                  )}
                  {id && editing && (editing.payments?.length ?? 0) > 0 && (
                    <Stack gap={4}>
                      <Text className="eyebrow">Payments so far</Text>
                      {editing.payments!.map((p) => (
                        <Group key={p._id} justify="space-between" wrap="nowrap">
                          <Group gap={6} wrap="nowrap">
                            <Text size="sm">{METHOD_LABELS[p.method]}</Text>
                            <PaymentRowStatusBadge status={p.status} />
                          </Group>
                          <Text size="sm" className="num">
                            {formatLkr(p.amount)}
                          </Text>
                        </Group>
                      ))}
                    </Stack>
                  )}
                  {!id && !canPay && (
                    <Text size="xs" c="dimmed">
                      You don&apos;t have permission to record payments. The order will be saved
                      unpaid, on credit.
                    </Text>
                  )}
                  {payingNow && (
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
                  )}
                  <DateInput
                    label="Payment due date"
                    description="When the supplier expects the money, if any is on credit."
                    placeholder="Select date"
                    clearable
                    value={dueDate || null}
                    error={showErr2(!!dueDate && !!date && dueDate < date)}
                    onChange={(v) => {
                      setDueEdited(toYmd(v));
                      touch();
                    }}
                  />
                  {payingNow &&
                    ours.map((c, i) => (
                      <Box
                        key={c.key}
                        p="sm"
                        style={{ border: '1px solid var(--ldg-border)', borderRadius: 8 }}
                      >
                        <Group justify="space-between" mb={6} wrap="nowrap">
                          <Text size="sm" fw={600}>
                            Our cheque {i + 1}
                          </Text>
                          <ActionIcon
                            variant="subtle"
                            c="var(--ldg-accent-text)"
                            aria-label={`Remove our cheque ${i + 1}`}
                            onClick={() => {
                              setOurs((cs) => cs.filter((x) => x.key !== c.key));
                              touch();
                            }}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                        <SimpleGrid cols={{ base: 1, sm: 2 }}>
                          <NumberInput
                            label="Amount"
                            placeholder="0.00"
                            {...moneyInput}
                            value={c.amount}
                            error={showErr2(n(c.amount) <= 0)}
                            onChange={(v) => setOur(c.key, { amount: v === '' ? '' : Number(v) })}
                          />
                          <DateInput
                            label="Cheque date"
                            placeholder="Select date"
                            value={c.date || null}
                            error={showErr2(!c.date)}
                            onChange={(v) => setOur(c.key, { date: toYmd(v) })}
                          />
                          <Select
                            label="Bank account"
                            searchable
                            placeholder={
                              !can('bank:read')
                                ? 'No permission to view banks'
                                : bankData.length || banks.loading
                                  ? 'Select an account'
                                  : 'No active bank accounts'
                            }
                            description="Add accounts under Settings → Banks."
                            disabled={!can('bank:read')}
                            data={bankData}
                            value={c.bank}
                            error={showErr2(!c.bank, 'Select an account')}
                            onChange={(v) => setOur(c.key, { bank: v })}
                          />
                          <TextInput
                            label="Cheque number"
                            placeholder="6 digits"
                            maxLength={12}
                            inputMode="numeric"
                            value={c.number}
                            error={showErr2(!/^\d{6}$/.test(c.number)) && 'Must be 6 digits'}
                            onChange={(e) =>
                              setOur(c.key, { number: e.currentTarget.value.replace(/\D/g, '') })
                            }
                          />
                          <Text size="sm" c="dimmed" style={{ alignSelf: 'end' }}>
                            Expected to clear {formatDate(ourClearing(c))}
                          </Text>
                        </SimpleGrid>
                      </Box>
                    ))}
                  {payingNow &&
                    custs.map((c, i) => {
                      const t = transferable.find((x) => x._id === c.cheque);
                      return (
                        <Box
                          key={c.key}
                          p="sm"
                          style={{ border: '1px solid var(--ldg-border)', borderRadius: 8 }}
                        >
                          <Group justify="space-between" mb={6} wrap="nowrap">
                            <Text size="sm" fw={600}>
                              Customer cheque {i + 1}
                            </Text>
                            <ActionIcon
                              variant="subtle"
                              c="var(--ldg-accent-text)"
                              aria-label={`Remove customer cheque ${i + 1}`}
                              onClick={() => {
                                setCusts((cs) => cs.filter((x) => x.key !== c.key));
                                touch();
                              }}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                          {transferableError ? (
                            <InlineAlert tone="warning" title="Cheques couldn't be loaded">
                              {transferableError}
                            </InlineAlert>
                          ) : (
                            <Select
                              label="Customer cheque"
                              searchable
                              placeholder={
                                transferable.length ? 'Select a cheque' : 'No transferable cheques'
                              }
                              description="Only cheques still in hand that aren't crossed or restricted."
                              data={custData(c)}
                              value={c.cheque}
                              error={showErr2(!c.cheque, 'Select a cheque')}
                              onChange={(v) => {
                                setCusts((cs) =>
                                  cs.map((x) => (x.key === c.key ? { ...x, cheque: v } : x)),
                                );
                                touch();
                              }}
                            />
                          )}
                          <Text size="sm" c="dimmed" mt="xs">
                            Expected to clear {formatDate(custClearing())}
                          </Text>
                          {t && (
                            <Text size="sm" mt="xs">
                              The whole cheque is handed over:{' '}
                              <strong className="num">{formatLkr(t.amount)}</strong>.
                            </Text>
                          )}
                        </Box>
                      );
                    })}
                  {payingNow && (ours.length > 0 || custs.length > 0) && (
                    <Text size="xs" c="dimmed">
                      A cheque counts as paid as soon as it is recorded. If it comes back returned,
                      the amount becomes payable again.
                    </Text>
                  )}
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
                      {byId.get(l.product!)?.name ??
                        editing?.lineItems.find((x) => x.product === l.product)?.productName ??
                        'Item'}{' '}
                      × {n(l.qty)}
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
                {step === 1 && net > 0 && payingNow && (
                  <>
                    <Text className="eyebrow" mt="sm">
                      Paid by
                    </Text>
                    {cashValue > 0 && <Row label="Cash" value={cashValue} />}
                    {oursValue > 0 && <Row label="Our cheques" value={oursValue} />}
                    {custValue > 0 && <Row label="Customer cheques" value={custValue} />}
                    {credit > 0 && <Row label="Credit" value={credit} />}
                    <Group justify="space-between" mt="xs">
                      <Text size="sm" c="dimmed">
                        Status
                      </Text>
                      <PaymentStatusBadge status={status} />
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
            <Button variant="default" onClick={() => navigate('/app/orders')} disabled={saving}>
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
            <Button type="submit" loading={saving} disabled={editing?.orderStatus === 'cancelled'}>
              {id ? 'Save changes' : 'Create order'}
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

export default AddEditOrderPage;

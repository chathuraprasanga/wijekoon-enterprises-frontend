const DASH = '—';

/** LKR 12,500.00 — thousands separators, 2 decimals. */
export const formatLkr = (value: number | null | undefined) =>
  value == null
    ? DASH
    : `LKR ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** 08 Nov 2026 */
export const formatDate = (value: string | Date | null | undefined) =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : DASH;

/** 0771234567 -> 077 123 4567 (entered as 07XXXXXXXX, shown as 07X XXX XXXX). */
export const formatPhone = (value: string | null | undefined) => {
  const d = (value ?? '').replace(/\D/g, '');
  return d.length === 10 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}` : value || DASH;
};

/** Em dash for empty values, never a blank cell. */
export const orDash = (value: string | null | undefined) => (value?.trim() ? value : DASH);

export const fullName = (p: { firstName: string; lastName?: string | null }) =>
  `${p.firstName} ${p.lastName ?? ''}`.trim();

export const initials = (p?: { firstName?: string; lastName?: string | null } | null) =>
  `${p?.firstName?.[0] ?? ''}${p?.lastName?.[0] ?? ''}`.toUpperCase();

/** r•••n@wijekoon.lk / 077 ••• 4567 — enough to recognise, not enough to leak. */
export const maskIdentifier = (value: string) => {
  const v = value.trim();
  if (v.includes('@')) {
    const [local, domain] = v.split('@');
    return local.length > 2
      ? `${local[0]}•••${local.slice(-1)}@${domain}`
      : `${local[0] ?? ''}•••@${domain}`;
  }
  const d = v.replace(/\D/g, '');
  return d.length >= 7 ? `${d.slice(0, 3)} ••• ${d.slice(-4)}` : '•••';
};

/** 42 -> 0:42 */
export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

/** 5 KG -> 5 kg, 750 ML -> 750 ml, 100 PCS -> 100 pcs (litres keep the capital L). */
export const formatSize = (size: number, unit: string) =>
  `${size} ${unit === 'L' ? 'L' : unit.toLowerCase()}`;

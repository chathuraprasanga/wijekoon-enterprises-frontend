const formatTime = (date: Date) =>
  date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const datePreview = (value: string | Date): string => {
  const date = typeof value === 'string' ? new Date(value) : value;
  const now = new Date();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const time = formatTime(date);

  if (isSameDay(date, now)) return `Today ${time}`;
  if (isSameDay(date, yesterday)) return `Yesterday ${time}`;
  if (isSameDay(date, tomorrow)) return `Tomorrow ${time}`;

  const day = date.getDate();
  const month = date.toLocaleString(undefined, { month: 'long' });

  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${month} ${time}`;
  }

  return `${day} ${month} ${date.getFullYear()} ${time}`;
};

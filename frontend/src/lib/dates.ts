const monthsGenitive = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function formatDate(iso: string): string {
  const [, month, day] = iso.split("-").map(Number);
  return `${day} ${monthsGenitive[month - 1]}`;
}

export function formatRange(dateFrom: string, dateTo: string): string {
  return dateFrom === dateTo ? formatDate(dateFrom) : `${formatDate(dateFrom)} — ${formatDate(dateTo)}`;
}

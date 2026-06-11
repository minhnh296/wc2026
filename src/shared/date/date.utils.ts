export function formatDateToString(date: Date): string {
  if (!date) return '';
  return date.toISOString().split('T')[0];
}

export function parseStringToDate(dateStr: string): Date | null {
  const timestamp = Date.parse(dateStr);
  return isNaN(timestamp) ? null : new Date(timestamp);
}

/** Format date as YYYY-MM-DD in local timezone */
export function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Get today's date as YYYY-MM-DD in local timezone */
export function todayLocal(): string {
  return formatDateLocal(new Date());
}

/** Format date for display in Uzbek locale */
export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

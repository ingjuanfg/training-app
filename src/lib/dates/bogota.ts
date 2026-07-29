import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { subDays, format } from "date-fns";

export const BOGOTA_TZ = "America/Bogota";

/** Fecha actual en Colombia (YYYY-MM-DD). */
export function todayInBogota(now: Date = new Date()): string {
  return formatInTimeZone(now, BOGOTA_TZ, "yyyy-MM-dd");
}

/** Día anterior a hoy en Bogotá (YYYY-MM-DD). */
export function yesterdayInBogota(now: Date = new Date()): string {
  const zoned = toZonedTime(now, BOGOTA_TZ);
  return format(subDays(zoned, 1), "yyyy-MM-dd");
}

export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  return formatInTimeZone(date, BOGOTA_TZ, "dd/MM/yyyy");
}

export function isPastDate(dateStr: string, now: Date = new Date()): boolean {
  return dateStr < todayInBogota(now);
}

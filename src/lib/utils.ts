import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFormattedDate(customTexts: Record<string, string> | undefined, fallback = 'Sabtu, 13 Juni 2026'): string {
  if (!customTexts) return fallback;
  if (customTexts.eventDateStr) return customTexts.eventDateStr;
  
  const rawDate = customTexts.eventDateRaw || customTexts.akadDate || customTexts.resepsiDate;
  if (!rawDate) return fallback;
  
  try {
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    return fallback;
  }
}

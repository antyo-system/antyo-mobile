import { startOfDay, differenceInMinutes, eachDayOfInterval, subDays, addDays } from 'date-fns';

/**
 * Formats seconds into a MM:SS string representation.
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return '00:00';
  
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  const mm = m < 10 ? `0${m}` : `${m}`;
  const ss = s < 10 ? `0${s}` : `${s}`;

  return `${mm}:${ss}`;
}

/**
 * Calculates the total minutes elapsed since midnight for a given ISO timestamp.
 */
export function getMinutesFromMidnight(dateString: string): number {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 0;
  
  const start = startOfDay(date);
  return differenceInMinutes(date, start);
}

/**
 * Generates an array of Date objects surrounding the given date.
 */
export function generateDateRange(centerDate: Date, daysBefore: number, daysAfter: number): Date[] {
  return eachDayOfInterval({
    start: subDays(centerDate, daysBefore),
    end: addDays(centerDate, daysAfter)
  });
}

/**
 * Formats seconds into a human-readable string (e.g. 5h 30m).
 */
export function formatLongTime(seconds: number): string {
  if (seconds < 0) return '0m';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m`;
}

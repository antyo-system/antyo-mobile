import { isSameDay, differenceInDays, startOfDay, subDays } from 'date-fns';
import { Session } from '@/types';

export interface StreakData {
  currentStreak: number;
  achievedDates: Date[];
}

/**
 * Calculates the current day streak based on sessions and a target.
 * @param sessions Array of focus sessions
 * @param targetHours The target number of hours per day to hit
 * @returns StreakData containing the current streak and the list of achieved dates
 */
export function calculateStreak(sessions: Session[], targetHours: number): StreakData {
  const targetSeconds = targetHours * 3600;

  // Group sessions by day
  const dailyTotals = new Map<string, number>();

  sessions.forEach(session => {
    // using ISO string up to 'YYYY-MM-DD' for grouping locally
    // date-fns startOfDay is safer to avoid timezone issues
    const dateStr = startOfDay(new Date(session.startTime)).toISOString();
    const current = dailyTotals.get(dateStr) || 0;
    dailyTotals.set(dateStr, current + session.durationSeconds);
  });

  const achievedDates: Date[] = [];
  dailyTotals.forEach((totalSeconds, dateStr) => {
    if (totalSeconds >= targetSeconds) {
      achievedDates.push(new Date(dateStr));
    }
  });

  // Sort dates descending (newest first)
  achievedDates.sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  const today = startOfDay(new Date());

  if (achievedDates.length > 0) {
    const lastAchieved = startOfDay(achievedDates[0]);
    
    // Calculate gap from today to the most recent achieved date.
    // diff = 0 (achieved today)
    // diff = 1 (achieved yesterday, 0 absent)
    // diff = 2 (achieved day before yesterday, 1 absent)
    // diff = 3 (achieved 3 days ago, 2 absent)
    // diff > 3 (3+ absent, streak resets to 0)
    const daysFromToday = differenceInDays(today, lastAchieved);

    if (daysFromToday <= 3) {
      currentStreak = 1; // Count the most recent achieved date
      
      // Iterate backwards through the rest of the achieved dates
      for (let i = 1; i < achievedDates.length; i++) {
        const curr = startOfDay(achievedDates[i - 1]);
        const prev = startOfDay(achievedDates[i]);
        
        const diff = differenceInDays(curr, prev);
        
        // Allowed gap is up to 3 days (meaning max 2 absent days in between)
        if (diff <= 3) {
          currentStreak++;
        } else {
          // Gap is too large, streak breaks here
          break;
        }
      }
    }
  }

  return { currentStreak, achievedDates };
}

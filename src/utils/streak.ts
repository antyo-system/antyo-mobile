import { differenceInDays, startOfDay } from 'date-fns';
import { Session } from '@/types';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  achievedDates: Date[];
}

/**
 * Calculates the current and longest day streaks based on sessions and a target.
 * Uses a strict 1-day gap logic (must maintain daily).
 * @param sessions Array of focus sessions
 * @param targetHours The target number of hours per day to hit
 * @returns StreakData containing the current streak, longest streak, and achieved dates
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
  let longestStreak = 0;
  const today = startOfDay(new Date());

  if (achievedDates.length > 0) {
    const lastAchieved = startOfDay(achievedDates[0]);
    
    // Calculate gap from today to the most recent achieved date.
    const daysFromToday = differenceInDays(today, lastAchieved);

    // Strict FOMO mode: Must be today or yesterday to maintain current streak
    if (daysFromToday <= 1) {
      currentStreak = 1; 
      
      // Iterate backwards to find current streak
      for (let i = 1; i < achievedDates.length; i++) {
        const curr = startOfDay(achievedDates[i - 1]);
        const prev = startOfDay(achievedDates[i]);
        
        const diff = differenceInDays(curr, prev);
        
        if (diff === 1) {
          currentStreak++;
        } else {
          break; // Streak broken
        }
      }
    }

    // Calculate longest streak historically
    let tempStreak = 1;
    longestStreak = 1;
    for (let i = 1; i < achievedDates.length; i++) {
      const curr = startOfDay(achievedDates[i - 1]);
      const prev = startOfDay(achievedDates[i]);
      const diff = differenceInDays(curr, prev);
      
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1; // reset temp
      }
    }
  }

  return { currentStreak, longestStreak, achievedDates };
}

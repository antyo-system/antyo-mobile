import { isSameDay, startOfWeek, addDays } from 'date-fns';
import { Plan } from '@/store/usePlanStore';

/**
 * Returns all plans that are scheduled to occur on the given date
 * based on their recurrence rules.
 */
export function getPlansForDate(plans: Plan[], targetDate: Date): Plan[] {
  return plans.filter(p => {
    if (p.recurrence === 'daily') return true;
    
    if (p.recurrence === 'weekdays') {
      const day = targetDate.getDay();
      return day >= 1 && day <= 5; // Monday=1 to Friday=5
    }
    
    if (p.recurrence === 'weekly') {
      return new Date(p.baseDate).getDay() === targetDate.getDay();
    }
    
    if (p.recurrence === 'monthly') {
      return new Date(p.baseDate).getDate() === targetDate.getDate();
    }
    
    if (p.recurrence === 'annually') {
      const base = new Date(p.baseDate);
      return base.getMonth() === targetDate.getMonth() && base.getDate() === targetDate.getDate();
    }
    
    if (p.recurrence === 'specific_days') {
      return p.recurrenceDays?.includes(targetDate.getDay());
    }
    
    // Default: 'none' or no match, just check if it's the exact same day
    return isSameDay(new Date(p.baseDate), targetDate);
  });
}

/**
 * Calculates the total planned duration (in minutes) for the current week.
 * Assumes the week starts on Monday (weekStartsOn: 1) to match the stats screen.
 */
export function getWeeklyPlannedMinutes(plans: Plan[], currentDate: Date = new Date()): number {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  let totalMinutes = 0;

  // Iterate over all 7 days of the current week
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const plansForDay = getPlansForDate(plans, day);
    
    for (const p of plansForDay) {
      // ONLY count plans that are attached to a Mastery Skill
      // Generic life events (dinner, sleep, break) without a skillId are ignored
      if (p.skillId) {
        totalMinutes += p.durationMinutes;
      }
    }
  }

  return totalMinutes;
}

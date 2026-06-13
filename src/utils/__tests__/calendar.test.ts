import { getPlansForDate, getWeeklyPlannedMinutes } from '../calendar';
import { Plan } from '@/store/usePlanStore';
import { parseISO } from 'date-fns';

describe('Calendar Utilities', () => {
  const basePlan: Omit<Plan, 'id' | 'recurrence'> = {
    title: 'Test',
    startMinutes: 600,
    durationMinutes: 60,
    baseDate: '2026-06-15T10:00:00.000Z', // A Monday
    color: '#000',
    skillId: null,
  };

  describe('getPlansForDate', () => {
    it('matches exact dates for "none" recurrence', () => {
      const plan: Plan = { ...basePlan, id: '1', recurrence: 'none' };
      
      const matched = getPlansForDate([plan], parseISO('2026-06-15T12:00:00.000Z'));
      expect(matched).toHaveLength(1);

      const unmatched = getPlansForDate([plan], parseISO('2026-06-16T12:00:00.000Z'));
      expect(unmatched).toHaveLength(0);
    });

    it('matches daily recurrence for any date', () => {
      const plan: Plan = { ...basePlan, id: '2', recurrence: 'daily' };
      const matched = getPlansForDate([plan], parseISO('2026-10-10T12:00:00.000Z'));
      expect(matched).toHaveLength(1);
    });

    it('matches weekdays recurrence only on Mon-Fri', () => {
      const plan: Plan = { ...basePlan, id: '3', recurrence: 'weekdays' };
      
      // Tuesday
      const tuesMatch = getPlansForDate([plan], parseISO('2026-06-16T12:00:00.000Z'));
      expect(tuesMatch).toHaveLength(1);

      // Saturday
      const satMatch = getPlansForDate([plan], parseISO('2026-06-20T12:00:00.000Z'));
      expect(satMatch).toHaveLength(0);
    });
  });

  describe('getWeeklyPlannedMinutes', () => {
    it('calculates total minutes for the week', () => {
      const plans: Plan[] = [
        { ...basePlan, id: '1', recurrence: 'daily', durationMinutes: 30 },
        { ...basePlan, id: '2', recurrence: 'weekdays', durationMinutes: 60 },
      ];
      
      // For a week:
      // daily = 7 * 30 = 210
      // weekdays = 5 * 60 = 300
      // total = 510
      
      const total = getWeeklyPlannedMinutes(plans, parseISO('2026-06-17T12:00:00.000Z')); // A Wednesday
      expect(total).toBe(510);
    });
  });
});

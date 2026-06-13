import { calculateStreak } from '../streak';
import { Session } from '@/types';
import { subDays, startOfDay } from 'date-fns';

describe('Streak Calculation', () => {
  const today = startOfDay(new Date());
  
  const createSession = (daysAgo: number, durationSeconds: number): Session => ({
    id: `test-${daysAgo}`,
    startTime: subDays(today, daysAgo).toISOString(),
    endTime: subDays(today, daysAgo).toISOString(),
    durationSeconds,
    focusDurationSeconds: durationSeconds,
    distractedDurationSeconds: 0,
    isSmartMode: false,
    color: '#000',
    title: 'Test',
    skillId: null,
    pillarId: null,
  });

  it('calculates a 0 streak if no sessions exist', () => {
    const { currentStreak, achievedDates } = calculateStreak([], 1);
    expect(currentStreak).toBe(0);
    expect(achievedDates).toHaveLength(0);
  });

  it('calculates a 1 streak if target met today', () => {
    const sessions = [createSession(0, 3600)]; // 1 hour today
    const { currentStreak, achievedDates } = calculateStreak(sessions, 1);
    expect(currentStreak).toBe(1);
    expect(achievedDates).toHaveLength(1);
  });

  it('calculates a streak correctly with consecutive days', () => {
    const sessions = [
      createSession(0, 3600), // Today
      createSession(1, 3600), // Yesterday
      createSession(2, 3600), // Day before
    ];
    const { currentStreak } = calculateStreak(sessions, 1);
    expect(currentStreak).toBe(3);
  });

  it('maintains streak with a 1-day gap (grace period)', () => {
    const sessions = [
      createSession(0, 3600), // Today
      createSession(2, 3600), // Day before yesterday
    ];
    const { currentStreak } = calculateStreak(sessions, 1);
    expect(currentStreak).toBe(2);
  });

  it('breaks streak with >3 days gap', () => {
    const sessions = [
      createSession(0, 3600), // Today
      createSession(4, 3600), // 4 days ago
    ];
    const { currentStreak, achievedDates } = calculateStreak(sessions, 1);
    expect(currentStreak).toBe(1); // Only counts today
    expect(achievedDates).toHaveLength(2); // Still tracks it was achieved
  });

  it('requires meeting the target hours to count as achieved', () => {
    const sessions = [
      createSession(0, 1800), // 30 mins
      createSession(0, 1800), // 30 mins (Total 1 hr)
      createSession(1, 1800), // 30 mins yesterday (missed target)
    ];
    const { currentStreak } = calculateStreak(sessions, 1);
    expect(currentStreak).toBe(1); // Only today counts
  });
});

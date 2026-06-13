import { generateInsights } from '../insights';
import { Session } from '@/types';
import { Plan } from '@/store/usePlanStore';
import { startOfDay } from 'date-fns';

describe('Insights Generation', () => {
  const today = startOfDay(new Date());

  const createSession = (durationMins: number, distractedMins: number = 0, hourOffset: number = 10): Session => {
    const startTime = new Date(today);
    startTime.setHours(hourOffset);
    return {
      id: `session-${Date.now()}-${Math.random()}`,
      startTime: startTime.toISOString(),
      endTime: startTime.toISOString(),
      durationSeconds: durationMins * 60,
      focusDurationSeconds: (durationMins - distractedMins) * 60,
      distractedDurationSeconds: distractedMins * 60,
      isSmartMode: false,
      color: '#000',
      title: 'Test Session',
      skillId: null,
      pillarId: null,
    };
  };

  const createPlan = (durationMins: number): Plan => ({
    id: `plan-${Date.now()}-${Math.random()}`,
    title: 'Test Plan',
    startMinutes: 600,
    durationMinutes: durationMins,
    recurrence: 'none',
    baseDate: today.toISOString(),
    color: '#000',
    skillId: null,
  });

  it('generates empty insight if no data', () => {
    const insights = generateInsights([], []);
    expect(insights).toHaveLength(1);
    expect(insights[0].type).toBe('empty');
  });

  it('generates distraction insight if distraction > 30 mins in past 7 days', () => {
    const sessions = [createSession(60, 45)]; // 45 mins distracted
    const insights = generateInsights(sessions, []);
    expect(insights.find(i => i.type === 'distraction')).toBeDefined();
  });

  it('generates overplanning insight if planned >> real', () => {
    // 3 hours planned, 30 mins real
    const plans = [createPlan(180)];
    const sessions = [createSession(30)];
    
    const insights = generateInsights(sessions, plans);
    expect(insights.find(i => i.type === 'overplanning')).toBeDefined();
  });

  it('generates underplanning insight if real >> planned', () => {
    // 30 mins planned, 3 hours real
    const plans = [createPlan(30)];
    const sessions = [createSession(180)];
    
    const insights = generateInsights(sessions, plans);
    expect(insights.find(i => i.type === 'underplanning')).toBeDefined();
  });

  it('generates prime time insight', () => {
    const sessions = [
      createSession(120, 0, 8), // Morning
      createSession(120, 0, 9), // Morning
      createSession(30, 0, 14), // Afternoon
      createSession(30, 0, 15), // Afternoon
      createSession(30, 0, 20), // Evening
      createSession(30, 0, 21), // Evening
    ];
    
    const insights = generateInsights(sessions, []);
    const primeTime = insights.find(i => i.type === 'primeTime');
    expect(primeTime).toBeDefined();
    expect(primeTime?.descKey).toBe('insights.primeTime.descMorning');
  });

  it('limits to 2 insights max', () => {
    const plans = [createPlan(180)];
    const sessions = [
      createSession(30, 45, 8), // Distraction + overplanning + prime time data points
      createSession(30, 0, 8),
      createSession(30, 0, 8),
      createSession(30, 0, 8),
      createSession(30, 0, 8),
      createSession(30, 0, 8),
    ];
    
    const insights = generateInsights(sessions, plans);
    expect(insights.length).toBeLessThanOrEqual(2);
  });
});

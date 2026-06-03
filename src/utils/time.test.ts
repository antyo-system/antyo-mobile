import { formatTime, getMinutesFromMidnight, generateDateRange } from './time';

describe('formatTime', () => {
  it('formats zero correctly', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats seconds less than 10 correctly', () => {
    expect(formatTime(9)).toBe('00:09');
  });

  it('formats exact minutes correctly', () => {
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(1500)).toBe('25:00');
  });

  it('formats mixed minutes and seconds correctly', () => {
    expect(formatTime(65)).toBe('01:05');
    expect(formatTime(1523)).toBe('25:23');
  });

  it('handles negative numbers safely', () => {
    expect(formatTime(-10)).toBe('00:00');
  });
});

describe('getMinutesFromMidnight', () => {
  it('returns 0 for exactly midnight', () => {
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    expect(getMinutesFromMidnight(midnight.toISOString())).toBe(0);
  });

  it('calculates correctly for mid-day', () => {
    const midday = new Date();
    midday.setHours(12, 30, 0, 0);
    expect(getMinutesFromMidnight(midday.toISOString())).toBe(12 * 60 + 30); // 750
  });
});

describe('generateDateRange', () => {
  it('generates the correct number of days', () => {
    const today = new Date();
    const range = generateDateRange(today, 2, 2);
    expect(range.length).toBe(5); // 2 before + today + 2 after
  });
});

import { getMasteryProgress, MILESTONES } from '../mastery';

describe('Mastery Calculation', () => {
  it('returns Novice for 0 hours', () => {
    const result = getMasteryProgress(0);
    expect(result.currentLevel.level).toBe('Novice');
    expect(result.nextLevel?.level).toBe('Apprentice');
    expect(result.totalHours).toBe(0);
    expect(result.currentLevelHours).toBe(0);
    expect(result.hoursToNextLevel).toBe(100);
    expect(result.progressPercentage).toBe(0);
  });

  it('calculates progress accurately within a level', () => {
    const result = getMasteryProgress(50 * 3600); // 50 hours
    expect(result.currentLevel.level).toBe('Novice');
    expect(result.currentLevelHours).toBe(50);
    expect(result.progressPercentage).toBe(50); // 50 / 100
  });

  it('levels up exactly on the threshold', () => {
    const result = getMasteryProgress(100 * 3600); // 100 hours
    expect(result.currentLevel.level).toBe('Apprentice');
    expect(result.nextLevel?.level).toBe('Practitioner');
    expect(result.currentLevelHours).toBe(0);
    expect(result.progressPercentage).toBe(0);
  });

  it('handles Grandmaster (max level)', () => {
    const result = getMasteryProgress(12000 * 3600); // 12000 hours
    expect(result.currentLevel.level).toBe('Grandmaster');
    expect(result.nextLevel).toBeNull();
    expect(result.totalHours).toBe(12000);
    expect(result.progressPercentage).toBe(100);
  });
});

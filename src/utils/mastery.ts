export type MasteryLevel = 'Novice' | 'Apprentice' | 'Practitioner' | 'Expert' | 'Master' | 'Grandmaster';

export interface Milestone {
  level: MasteryLevel;
  requiredHours: number;
  icon: string;
}

export const MILESTONES: Milestone[] = [
  { level: 'Novice', requiredHours: 0, icon: '🌱' },
  { level: 'Apprentice', requiredHours: 100, icon: '🛠️' },
  { level: 'Practitioner', requiredHours: 500, icon: '⚔️' },
  { level: 'Expert', requiredHours: 2000, icon: '💎' },
  { level: 'Master', requiredHours: 5000, icon: '👑' },
  { level: 'Grandmaster', requiredHours: 10000, icon: '🌌' }, // The absolute peak
];

export interface MasteryProgress {
  currentLevel: Milestone;
  nextLevel: Milestone | null;
  totalHours: number;
  currentLevelHours: number; // Hours spent IN the current level
  hoursToNextLevel: number;  // Hours needed from current level start to reach next
  progressPercentage: number; // 0 to 100
}

export function getMasteryProgress(totalSeconds: number): MasteryProgress {
  const totalHours = totalSeconds / 3600;
  
  let currentLevel = MILESTONES[0];
  let nextLevel: Milestone | null = MILESTONES[1];
  
  for (let i = 0; i < MILESTONES.length; i++) {
    if (totalHours >= MILESTONES[i].requiredHours) {
      currentLevel = MILESTONES[i];
      nextLevel = i + 1 < MILESTONES.length ? MILESTONES[i + 1] : null;
    } else {
      break;
    }
  }

  let currentLevelHours = 0;
  let hoursToNextLevel = 0;
  let progressPercentage = 100;

  if (nextLevel) {
    currentLevelHours = totalHours - currentLevel.requiredHours;
    hoursToNextLevel = nextLevel.requiredHours - currentLevel.requiredHours;
    progressPercentage = Math.min(100, Math.max(0, (currentLevelHours / hoursToNextLevel) * 100));
  }

  return {
    currentLevel,
    nextLevel,
    totalHours,
    currentLevelHours,
    hoursToNextLevel,
    progressPercentage,
  };
}

export interface Session {
  id: string; // UUID
  title: string;
  durationSeconds: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  description?: string;
  
  // Smart Mode Analytics
  isSmartMode?: boolean;
  focusDurationSeconds?: number;
  distractedDurationSeconds?: number;
  skillId?: string | null;
  pillarId?: string | null;
}

export interface Plan {
  id: string; // UUID
  title: string;
  plannedDurationSeconds: number;
  date: string; // ISO string
}

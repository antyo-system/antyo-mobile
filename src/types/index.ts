export interface Session {
  id: string; // UUID
  title: string;
  durationSeconds: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  description?: string;
}

export interface Plan {
  id: string; // UUID
  title: string;
  plannedDurationSeconds: number;
  date: string; // ISO string
}

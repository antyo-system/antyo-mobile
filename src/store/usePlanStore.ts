import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly' | 'specific_days';

export interface Plan {
  id: string;
  title: string;
  startMinutes: number;
  durationMinutes: number;
  recurrence: Recurrence;
  baseDate: string; // ISO string of the date it was created for
  recurrenceDays?: number[]; // 0 = Sunday, 1 = Monday, etc.
  isAllDay?: boolean;
  notes?: string;
}

interface PlanState {
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  updatePlan: (id: string, updates: Partial<Plan>) => void;
  deletePlan: (id: string) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plans: [],
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      updatePlan: (id, updates) =>
        set((state) => ({
          plans: state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePlan: (id) =>
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
    }),
    {
      name: 'plan-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

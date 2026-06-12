import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { schedulePlanNotification, cancelPlanNotification } from '@/utils/notifications';

export type Recurrence = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'annually' | 'specific_days';

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
  isReminderEnabled?: boolean;
  color?: string;
  skillId?: string | null;
  pillarId?: string | null;
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
      addPlan: (plan) => {
        schedulePlanNotification(plan);
        set((state) => ({ plans: [...state.plans, plan] }));
      },
      updatePlan: (id, updates) => {
        set((state) => {
          const nextPlans = state.plans.map((p) => (p.id === id ? { ...p, ...updates } : p));
          const updatedPlan = nextPlans.find((p) => p.id === id);
          if (updatedPlan) {
            if (updatedPlan.isReminderEnabled !== false) {
              schedulePlanNotification(updatedPlan);
            } else {
              cancelPlanNotification(id);
            }
          }
          return { plans: nextPlans };
        });
      },
      deletePlan: (id) => {
        cancelPlanNotification(id);
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
      },
    }),
    {
      name: 'plan-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

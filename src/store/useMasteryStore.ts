import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

export interface Skill {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalSeconds: number;
  createdAt: string;
}

interface MasteryState {
  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'id' | 'totalSeconds' | 'createdAt'>) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addTimeToSkill: (id: string, seconds: number) => void;
}

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set) => ({
      skills: [
        // Default examples
        {
          id: '1',
          name: 'Coding',
          icon: 'terminal',
          color: 'blue',
          totalSeconds: 3600 * 120, // 120 hours (Apprentice)
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'UI/UX Design',
          icon: 'pen-tool',
          color: 'purple',
          totalSeconds: 3600 * 45, // 45 hours (Novice)
          createdAt: new Date().toISOString(),
        }
      ],
      addSkill: (skill) => set((state) => ({
        skills: [...state.skills, {
          ...skill,
          id: Date.now().toString(),
          totalSeconds: 0,
          createdAt: new Date().toISOString(),
        }]
      })),
      updateSkill: (id, updates) => set((state) => ({
        skills: state.skills.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter((s) => s.id !== id)
      })),
      addTimeToSkill: (id, seconds) => set((state) => ({
        skills: state.skills.map((s) => s.id === id ? { ...s, totalSeconds: s.totalSeconds + seconds } : s)
      })),
    }),
    {
      name: 'mastery-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

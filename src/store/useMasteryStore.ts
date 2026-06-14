import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import * as Crypto from 'expo-crypto';

export interface Pillar {
  id: string;
  name: string;
  totalSeconds: number;
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalSeconds: number;
  createdAt: string;
  pillars: Pillar[];
  
  // Daily Target Tracking
  dailyTargetMinutes?: number | null;
  streakCount?: number;
  lastActiveDate?: string | null;
}

interface MasteryState {
  skills: Skill[];
  addSkill: (skill: Omit<Skill, 'id' | 'totalSeconds' | 'createdAt' | 'pillars'> & { id?: string; initialPillars?: string[] }) => void;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  addTimeToSkill: (id: string, pillarId: string | null, seconds: number) => void;
  addPillar: (skillId: string, name: string) => void;
  updatePillar: (skillId: string, pillarId: string, updates: Partial<Pillar>) => void;
  deletePillar: (skillId: string, pillarId: string) => void;
}

export const useMasteryStore = create<MasteryState>()(
  persist(
    (set) => ({
      skills: [
        {
          id: 'default-skill-1',
          name: 'Reading',
          icon: 'book',
          color: '#3B82F6',
          totalSeconds: 0,
          createdAt: new Date().toISOString(),
          pillars: [],
        }
      ],
      addSkill: ({ id, initialPillars, ...rest }) => set((state) => ({
        skills: [...state.skills, {
          ...rest,
          id: id || Crypto.randomUUID(),
          totalSeconds: 0,
          createdAt: new Date().toISOString(),
          pillars: initialPillars ? initialPillars.map(name => ({
            id: Crypto.randomUUID(),
            name,
            totalSeconds: 0,
            createdAt: new Date().toISOString()
          })) : [],
        }]
      })),
      updateSkill: (id, updates) => set((state) => ({
        skills: state.skills.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteSkill: (id) => set((state) => ({
        skills: state.skills.filter((s) => s.id !== id)
      })),
      addTimeToSkill: (id, pillarId, seconds) => set((state) => ({
        skills: state.skills.map((s) => {
          if (s.id !== id) return s;
          
          let updatedPillars = s.pillars;
          if (pillarId) {
            updatedPillars = s.pillars.map(p => 
              p.id === pillarId ? { ...p, totalSeconds: p.totalSeconds + seconds } : p
            );
          }

          return {
            ...s,
            totalSeconds: s.totalSeconds + seconds,
            pillars: updatedPillars
          };
        })
      })),
      addPillar: (skillId, name) => set((state) => ({
        skills: state.skills.map((s) => s.id === skillId ? {
          ...s,
          pillars: [...(s.pillars || []), {
            id: Crypto.randomUUID(),
            name,
            totalSeconds: 0,
            createdAt: new Date().toISOString()
          }]
        } : s)
      })),
      updatePillar: (skillId, pillarId, updates) => set((state) => ({
        skills: state.skills.map((s) => s.id === skillId ? {
          ...s,
          pillars: s.pillars.map(p => p.id === pillarId ? { ...p, ...updates } : p)
        } : s)
      })),
      deletePillar: (skillId, pillarId) => set((state) => ({
        skills: state.skills.map((s) => s.id === skillId ? {
          ...s,
          pillars: s.pillars.filter(p => p.id !== pillarId)
        } : s)
      })),
    }),
    {
      name: 'mastery-storage',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as any;
        if (version === 0) {
          // Migration from version 0 to 1
        }
        return state;
      },
    }
  )
);

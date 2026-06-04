import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

export interface Settings {
  sleepStart: string; // HH:mm format, e.g. "23:00"
  sleepEnd: string;   // HH:mm format, e.g. "06:00"
  defaultFocusMinutes: number;
  defaultBreakMinutes: number;
  hapticsEnabled: boolean;
  appearance: 'system' | 'light' | 'dark';
  dailyFocusTargetHours: number;
  birthYear: number;
  retirementAge: number;
}

export interface SettingsState extends Settings {
  updateSettings: (updates: Partial<Settings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sleepStart: "23:00",
      sleepEnd: "06:00",
      defaultFocusMinutes: 25,
      defaultBreakMinutes: 5,
      hapticsEnabled: true,
      appearance: 'system',
      dailyFocusTargetHours: 3,
      birthYear: 2000,
      retirementAge: 65,
      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

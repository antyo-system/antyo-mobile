import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';

interface AppState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
  hasSeenTimerTutorial: boolean;
  hasSeenCalendarTutorial: boolean;
  hasSeenMasteryTutorial: boolean;
  hasSeenStatsTutorial: boolean;
  setTutorialSeen: (tab: 'timer' | 'calendar' | 'mastery' | 'stats') => void;
  hasCompletedTutorial: boolean;
  completeTutorial: () => void;
  resetTutorials: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (value) => set({ hasSeenOnboarding: value }),
      
      hasSeenTimerTutorial: false,
      hasSeenCalendarTutorial: false,
      hasSeenMasteryTutorial: false,
      hasSeenStatsTutorial: false,
      
      setTutorialSeen: (tab) => {
        const key = `hasSeen${tab.charAt(0).toUpperCase() + tab.slice(1)}Tutorial`;
        set({ [key]: true } as any);
      },
      
      hasCompletedTutorial: false,
      completeTutorial: () => set({ hasCompletedTutorial: true }),
      resetTutorials: () => set({
        hasSeenTimerTutorial: false,
        hasSeenCalendarTutorial: false,
        hasSeenMasteryTutorial: false,
        hasSeenStatsTutorial: false,
      }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => zustandStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

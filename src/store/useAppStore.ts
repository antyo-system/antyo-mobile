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
  hasPromptedReview: boolean;
  setHasPromptedReview: (value: boolean) => void;
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
      hasPromptedReview: false,
      setHasPromptedReview: (value) => set({ hasPromptedReview: value }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        let state = persistedState as any;
        if (version === 0) {
          // Migration from version 0 to 1
        }
        return state;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

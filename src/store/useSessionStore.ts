import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './mmkv';
import { Session } from '@/types';
import { posthog } from '@/lib/posthog';
import * as StoreReview from 'expo-store-review';
import { useAppStore } from './useAppStore';

interface SessionState {
  sessions: Session[];
  addSession: (session: Session) => void;
  removeSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<Session>) => void;
  clearSessions: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => {
          posthog.capture('session_completed', {
            durationSeconds: session.durationSeconds,
            isSmartMode: session.isSmartMode,
            skillId: session.skillId,
          } as Record<string, any>);

          // Trigger native App Store review prompt after exactly 3 sessions
          const nextSessionCount = state.sessions.length + 1;
          const { hasPromptedReview, setHasPromptedReview } = useAppStore.getState();
          
          if (nextSessionCount === 3 && !hasPromptedReview) {
            StoreReview.hasAction().then((hasAction) => {
              if (hasAction) {
                StoreReview.requestReview().catch(console.error);
                setHasPromptedReview(true);
              }
            }).catch(console.error);
          }

          return { sessions: [...state.sessions, session] };
        }),
      removeSession: (id) =>
        set((state) => ({ sessions: state.sessions.filter(s => s.id !== id) })),
      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),
      clearSessions: () => set({ sessions: [] }),
    }),
    {
      name: 'session-storage',
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

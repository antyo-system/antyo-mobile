import { create } from 'zustand';

export type TimerStatus = 'idle' | 'running' | 'paused';
export type TimerMode = 'timer' | 'stopwatch';

interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  duration: number; // Configured total duration in seconds
  timeLeft: number; // Remaining time in seconds
  timeElapsed: number; // Elapsed time in seconds for stopwatch
  sessionStartTime: string | null; // ISO timestamp
  currentTitle: string;

  // Smart Mode States
  isSmartMode: boolean;
  cameraPermissionStatus: 'granted' | 'denied' | 'undetermined';
  distractedTime: number; // Elapsed distracted time in seconds
  isDistracted: boolean; // Current detection state

  // Actions
  setTitle: (title: string) => void;
  setMode: (mode: TimerMode) => void;
  setDuration: (seconds: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  tick: () => void;

  setSmartMode: (enabled: boolean) => void;
  setCameraPermission: (status: 'granted' | 'denied' | 'undetermined') => void;
  setDistracted: (distracted: boolean) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  status: 'idle',
  mode: 'timer',
  duration: 25 * 60, // Default 25 minutes
  timeLeft: 25 * 60,
  timeElapsed: 0,
  sessionStartTime: null,
  currentTitle: '',
  isSmartMode: false,
  cameraPermissionStatus: 'undetermined',
  distractedTime: 0,
  isDistracted: false,

  setTitle: (title) => set({ currentTitle: title }),

  setSmartMode: (enabled) => set({ isSmartMode: enabled }),
  setCameraPermission: (status) => set({ cameraPermissionStatus: status }),
  setDistracted: (distracted) => set({ isDistracted: distracted }),

  setMode: (mode) => {
    const { status, duration } = get();
    // Only allow mode switching when idle
    if (status === 'idle') {
      set({ mode, timeElapsed: 0, timeLeft: duration });
    }
  },
  
  setDuration: (seconds) => {
    const { status } = get();
    if (status === 'idle') {
      set({ duration: seconds, timeLeft: seconds });
    }
  },

  startTimer: () => {
    const { status, sessionStartTime } = get();
    if (status === 'idle' || status === 'paused') {
      set({
        status: 'running',
        // Only set start time if we are starting fresh
        sessionStartTime: status === 'idle' ? new Date().toISOString() : sessionStartTime,
      });
    }
  },

  pauseTimer: () => {
    const { status } = get();
    if (status === 'running') {
      set({ status: 'paused' });
    }
  },

  stopTimer: () => {
    const { duration } = get();
    set({
      status: 'idle',
      timeLeft: duration,
      timeElapsed: 0,
      sessionStartTime: null,
      distractedTime: 0,
      isDistracted: false,
    });
  },

  tick: () => {
    const { status, mode, timeLeft, timeElapsed, isSmartMode, isDistracted, distractedTime } = get();
    if (status === 'running') {
      if (isSmartMode && isDistracted) {
        // Only increment distracted time
        set({ distractedTime: distractedTime + 1 });
      } else {
        // Normal timer progression
        if (mode === 'timer') {
          if (timeLeft > 0) {
            set({ timeLeft: timeLeft - 1 });
          } else {
            // Auto-stop when time hits 0
            set({ status: 'idle', sessionStartTime: null, timeLeft: get().duration, distractedTime: 0, isDistracted: false });
          }
        } else if (mode === 'stopwatch') {
          set({ timeElapsed: timeElapsed + 1 });
        }
      }
    }
  },
}));

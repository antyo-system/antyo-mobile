import { create } from 'zustand';
import { Platform } from 'react-native';
import { startActivity, createTimerActivity, updateActivity, stopActivity } from '@heojeongbo/expo-live-activity';
import { updateTimerWidget } from '@/widgets/widget-task-handler';

const LIVE_ACTIVITY_ID = 'antyo_focus_timer';

export type TimerStatus = 'idle' | 'running' | 'paused';
export type TimerMode = 'timer' | 'stopwatch';
export type SessionType = 'focus' | 'break';

interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  sessionType: SessionType;
  autoPlay: boolean;
  duration: number; // Configured total duration in seconds
  breakDuration: number; // Configured break duration in seconds
  timeLeft: number; // Remaining time in seconds
  timeElapsed: number; // Elapsed time in seconds for stopwatch
  sessionStartTime: string | null; // ISO timestamp
  currentTitle: string;
  selectedSkillId: string | null;
  selectedPillarId: string | null;

  // Smart Mode
  isSmartMode: boolean;
  cameraPermissionStatus: 'not-determined' | 'granted' | 'denied';
  focusTimeElapsed: number;
  distractedTimeElapsed: number;
  isCurrentlyDistracted: boolean;

  // Cycle Mode
  targetDurationSeconds?: number;
  cyclesCompleted: number;
  totalCycles: number;
  totalFocusElapsed: number;
  cycleMode: boolean;

  // Actions
  setTitle: (title: string) => void;
  setSelectedSkillId: (id: string | null) => void;
  setSelectedPillarId: (id: string | null) => void;
  setSmartMode: (smart: boolean) => void;
  setCameraPermission: (status: 'not-determined' | 'granted' | 'denied') => void;
  setCurrentlyDistracted: (distracted: boolean) => void;
  setMode: (mode: TimerMode) => void;
  setSessionType: (type: SessionType) => void;
  setAutoPlay: (auto: boolean) => void;
  setDuration: (seconds: number) => void;
  setBreakDuration: (seconds: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  tick: () => void;
  fastForward: (seconds: number) => void;
  
  // Cycle Actions
  loadTargetSession: (targetSeconds: number, focusSeconds: number, breakSeconds: number) => void;
  setStandardMode: (focusSeconds: number, breakSeconds: number) => void;
  addFocusElapsed: (seconds: number) => void;
  incrementCycle: () => void;
  advanceCycle: (nextType: SessionType) => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  status: 'idle',
  mode: 'timer',
  sessionType: 'focus',
  autoPlay: false,
  duration: 25 * 60, // Default 25 minutes
  breakDuration: 5 * 60, // Default 5 minutes
  timeLeft: 25 * 60,
  timeElapsed: 0,
  sessionStartTime: null,
  currentTitle: '',
  selectedSkillId: null,
  selectedPillarId: null,

  isSmartMode: false,
  cameraPermissionStatus: 'not-determined',
  focusTimeElapsed: 0,
  distractedTimeElapsed: 0,
  isCurrentlyDistracted: false,

  targetDurationSeconds: undefined,
  cyclesCompleted: 0,
  totalCycles: 0,
  totalFocusElapsed: 0,
  cycleMode: false,

  setTitle: (title) => set({ currentTitle: title }),
  setSelectedSkillId: (id) => set({ selectedSkillId: id, selectedPillarId: null }),
  setSelectedPillarId: (id: string | null) => set({ selectedPillarId: id }),
  setSmartMode: (smart) => set({ isSmartMode: smart }),
  setCameraPermission: (status) => set({ cameraPermissionStatus: status }),
  setCurrentlyDistracted: (distracted) => set({ isCurrentlyDistracted: distracted }),

  setMode: (mode) => {
    const { status, duration } = get();
    // Only allow mode switching when idle
    if (status === 'idle') {
      set({ mode, timeElapsed: 0, timeLeft: duration, sessionType: 'focus' });
    }
  },
  
  setSessionType: (type) => {
    const { status, duration, breakDuration } = get();
    // We can allow switching session types primarily when idle, setting timeLeft accordingly
    if (status === 'idle') {
      set({ sessionType: type, timeLeft: type === 'focus' ? duration : breakDuration });
    }
  },

  setAutoPlay: (auto) => set({ autoPlay: auto }),
  
  setDuration: (seconds) => {
    const { status } = get();
    if (status === 'idle') {
      set({ duration: seconds, timeLeft: seconds });
    }
  },

  setBreakDuration: (seconds) => {
    set({ breakDuration: seconds });
  },

  startTimer: () => {
    const { status, sessionStartTime, currentTitle, duration, timeLeft } = get();
    if (status === 'idle' || status === 'paused') {
      const isStartingFresh = status === 'idle';
      set({
        status: 'running',
        // Only set start time if we are starting fresh
        sessionStartTime: isStartingFresh ? new Date().toISOString() : sessionStartTime,
      });
      
      // Update Widgets & Live Activities
      if (Platform.OS === 'android') {
        updateTimerWidget();
      } else if (Platform.OS === 'ios') {
        if (isStartingFresh) {
          startActivity(createTimerActivity({
            id: LIVE_ACTIVITY_ID,
            name: currentTitle || 'FOCUS SESSION',
            totalTime: duration,
            remainingTime: timeLeft,
            isRunning: true
          })).catch(console.warn);
        } else {
          const config = createTimerActivity({
            id: LIVE_ACTIVITY_ID,
            name: currentTitle || 'FOCUS SESSION',
            totalTime: duration,
            remainingTime: timeLeft,
            isRunning: true
          });
          updateActivity(LIVE_ACTIVITY_ID, config.content).catch(console.warn);
        }
      }
    }
  },

  pauseTimer: () => {
    const { status, currentTitle, duration, timeLeft } = get();
    if (status === 'running') {
      set({ status: 'paused' });
      
      // Update Widgets & Live Activities
      if (Platform.OS === 'android') {
        updateTimerWidget();
      } else if (Platform.OS === 'ios') {
        const config = createTimerActivity({
          id: LIVE_ACTIVITY_ID,
          name: currentTitle || 'FOCUS SESSION',
          totalTime: duration,
          remainingTime: timeLeft,
          isRunning: false
        });
        updateActivity(LIVE_ACTIVITY_ID, config.content).catch(console.warn);
      }
    }
  },

  stopTimer: () => {
    const { duration } = get();
    set({
      status: 'idle',
      sessionType: 'focus',
      timeLeft: duration,
      timeElapsed: 0,
      sessionStartTime: null,
      currentTitle: '',
      selectedSkillId: null,
      selectedPillarId: null,
      targetDurationSeconds: undefined,
      cyclesCompleted: 0,
      totalCycles: 0,
      totalFocusElapsed: 0,
      cycleMode: false,
      focusTimeElapsed: 0,
      distractedTimeElapsed: 0,
      isCurrentlyDistracted: false,
    });
    
    // Stop Widgets & Live Activities
    if (Platform.OS === 'android') {
      updateTimerWidget();
    } else if (Platform.OS === 'ios') {
      stopActivity(LIVE_ACTIVITY_ID).catch(console.warn);
    }
  },

  tick: () => {
    const { status, mode, timeLeft, timeElapsed } = get();
    if (status === 'running') {
      if (mode === 'timer') {
        if (timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        }
      } else if (mode === 'stopwatch') {
        set({ timeElapsed: timeElapsed + 1 });
      }

      // Smart Mode Tracking
      const { isSmartMode, isCurrentlyDistracted, focusTimeElapsed, distractedTimeElapsed } = get();
      if (isSmartMode) {
        if (isCurrentlyDistracted) {
          set({ distractedTimeElapsed: distractedTimeElapsed + 1 });
        } else {
          set({ focusTimeElapsed: focusTimeElapsed + 1 });
        }
      }
    }
  },

  fastForward: (seconds) => {
    const { status, mode, timeLeft, timeElapsed } = get();
    if (status === 'running') {
      if (mode === 'timer') {
        set({ timeLeft: Math.max(0, timeLeft - seconds) });
      } else if (mode === 'stopwatch') {
        set({ timeElapsed: timeElapsed + seconds });
      }
    }
  },

  loadTargetSession: (targetSeconds, focusSeconds, breakSeconds) => {
    const { status } = get();
    if (status === 'idle') {
      const cycleDuration = focusSeconds + breakSeconds;
      const cycles = Math.ceil(targetSeconds / cycleDuration) || 1;
      set({
        targetDurationSeconds: targetSeconds,
        duration: focusSeconds,
        breakDuration: breakSeconds,
        timeLeft: focusSeconds,
        cyclesCompleted: 0,
        totalCycles: cycles,
        totalFocusElapsed: 0,
        cycleMode: true,
        sessionType: 'focus'
      });
    }
  },

  setStandardMode: (focusSeconds, breakSeconds) => {
    const { status } = get();
    if (status === 'idle') {
      set({
        duration: focusSeconds,
        breakDuration: breakSeconds,
        timeLeft: focusSeconds,
        targetDurationSeconds: undefined,
        cyclesCompleted: 0,
        totalCycles: 0,
        totalFocusElapsed: 0,
        cycleMode: false,
        sessionType: 'focus'
      });
    }
  },

  addFocusElapsed: (seconds) => {
    set((state) => ({ totalFocusElapsed: state.totalFocusElapsed + seconds }));
  },

  incrementCycle: () => {
    set((state) => ({ cyclesCompleted: state.cyclesCompleted + 1 }));
  },

  advanceCycle: (nextType) => {
    const { duration, breakDuration, cyclesCompleted } = get();
    set({
      status: 'idle',
      sessionType: nextType,
      timeLeft: nextType === 'focus' ? duration : breakDuration,
      cyclesCompleted: nextType === 'focus' ? cyclesCompleted + 1 : cyclesCompleted,
    });
  },
}));

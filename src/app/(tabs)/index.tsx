import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '@/store/useTimerStore';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { TimerTitleInput } from '@/components/timer/TimerTitleInput';
import { TimerModeToggle } from '@/components/timer/TimerModeToggle';
import { CircularTimer } from '@/components/timer/CircularTimer';
import { TimerDurationModal } from '@/components/timer/TimerDurationModal';
import { useShallow } from 'zustand/react/shallow';
import { useSessionStore } from '@/store/useSessionStore';
import { useMasteryStore } from '@/store/useMasteryStore';
import { SkillSelector } from '@/components/timer/SkillSelector';

export default function TimerScreen() {
  const { status, mode, timeLeft, timeElapsed, tick, currentTitle, duration, stopTimer, sessionStartTime, selectedSkillId } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      mode: s.mode,
      timeLeft: s.timeLeft,
      timeElapsed: s.timeElapsed,
      tick: s.tick,
      currentTitle: s.currentTitle,
      duration: s.duration,
      stopTimer: s.stopTimer,
      sessionStartTime: s.sessionStartTime,
      selectedSkillId: s.selectedSkillId,
    }))
  );
  const addSession = useSessionStore((s: any) => s.addSession);
  const [durationModalVisible, setDurationModalVisible] = useState(false);

  // Handle timer auto-completion
  useEffect(() => {
    if (status === 'running' && mode === 'timer' && timeLeft === 0 && sessionStartTime) {
      const totalDuration = duration;
      
      addSession({
        id: Date.now().toString(),
        title: currentTitle || 'Focus Session',
        durationSeconds: totalDuration,
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        isSmartMode: false,
        focusDurationSeconds: undefined,
        distractedDurationSeconds: undefined,
      });
      
      if (selectedSkillId) {
        useMasteryStore.getState().addTimeToSkill(selectedSkillId, totalDuration);
      }
      
      stopTimer();
    }
  }, [timeLeft, status, mode, sessionStartTime, duration, currentTitle, selectedSkillId, addSession, stopTimer]);

  // Tick interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  // Manual save for Stopwatch mode or early stop
  const handleSaveAndStop = () => {
    if (sessionStartTime) {
      let totalDuration = duration;
      if (mode === 'stopwatch') {
        totalDuration = timeElapsed;
      } else {
        totalDuration = duration - timeLeft;
      }
      
      addSession({
        id: Date.now().toString(),
        title: currentTitle || 'Focus Session',
        durationSeconds: totalDuration,
        startTime: sessionStartTime,
        endTime: new Date().toISOString(),
        isSmartMode: false,
        focusDurationSeconds: undefined,
        distractedDurationSeconds: undefined,
      });
      
      if (selectedSkillId) {
        useMasteryStore.getState().addTimeToSkill(selectedSkillId, totalDuration);
      }
    }
    stopTimer();
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-1 pt-6 pb-8 px-6" pointerEvents="box-none">
          
          {/* Top: Smart Mode Toggle */}
          <View className="items-center justify-start z-10 pt-2 w-full">
            <TimerModeToggle />
          </View>

          {/* Middle: Circular Timer (Shifted lower) */}
          <View className="flex-1 items-center justify-center z-0 mt-4" pointerEvents="box-none">
            <CircularTimer>
              <View className="items-center justify-center -mt-2">
                <TimerTitleInput />
                <SkillSelector />
                
                <View className="mt-1">
                  <TimerDisplay onOpenModal={() => setDurationModalVisible(true)} />
                </View>
              </View>
            </CircularTimer>
          </View>

          {/* Bottom 1/3: Controls */}
          <View className="items-center justify-center h-[20%] z-10 mb-20">
            <TimerControls onSaveAndStop={handleSaveAndStop} />
          </View>
          
        </View>
      </KeyboardAvoidingView>
      <TimerDurationModal visible={durationModalVisible} onClose={() => setDurationModalVisible(false)} />
    </SafeAreaView>
  );
}

import { useState, useEffect } from 'react';
import { View, Text, Pressable, Switch, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '@/store/useTimerStore';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { TimerTitleInput } from '@/components/timer/TimerTitleInput';
import { TimerModeToggle } from '@/components/timer/TimerModeToggle';
import { TimerDurationModal } from '@/components/timer/TimerDurationModal';
import { useShallow } from 'zustand/react/shallow';
import { useSessionStore } from '@/store/useSessionStore';
import { useMasteryStore } from '@/store/useMasteryStore';
import { usePlanStore, Plan } from '@/store/usePlanStore';
import { useAppStore } from '@/store/useAppStore';
import { SkillSelector } from '@/components/timer/SkillSelector';

export default function TimerScreen() {
  const { status, mode, timeLeft, timeElapsed, tick, currentTitle, duration, stopTimer, sessionStartTime, selectedSkillId, selectedPillarId } = useTimerStore(
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
      selectedPillarId: s.selectedPillarId,
    }))
  );
  const addSession = useSessionStore((s: any) => s.addSession);
  const { hasCompletedTutorial } = useAppStore();
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Plan | null>(null);

  // Smart Routine Detection
  useEffect(() => {
    const checkActiveRoutine = () => {
      if (status !== 'idle') {
        setActiveRoutine(null);
        return;
      }
      
      const plans = usePlanStore.getState().plans;
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      const todayPlans = plans.filter(p => {
        if (p.recurrence === 'daily') return true;
        if (p.recurrence === 'weekdays') {
          const day = now.getDay();
          return day >= 1 && day <= 5;
        }
        if (p.recurrence === 'weekly' && new Date(p.baseDate).getDay() === now.getDay()) return true;
        if (p.recurrence === 'monthly' && new Date(p.baseDate).getDate() === now.getDate()) return true;
        if (p.recurrence === 'annually') {
          const base = new Date(p.baseDate);
          return base.getMonth() === now.getMonth() && base.getDate() === now.getDate();
        }
        if (p.recurrence === 'specific_days' && p.recurrenceDays?.includes(now.getDay())) return true;
        
        const base = new Date(p.baseDate);
        return base.getDate() === now.getDate() && base.getMonth() === now.getMonth() && base.getFullYear() === now.getFullYear();
      });

      const active = todayPlans.find(p => currentMins >= p.startMinutes && currentMins < p.startMinutes + p.durationMinutes);
      setActiveRoutine(active || null);
    };

    checkActiveRoutine();
    const interval = setInterval(checkActiveRoutine, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [status]);

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
        skillId: selectedSkillId,
        pillarId: selectedPillarId,
      });
      
      if (selectedSkillId) {
        useMasteryStore.getState().addTimeToSkill(selectedSkillId, selectedPillarId, totalDuration);
      }
      
      stopTimer();
    }
  }, [timeLeft, status, mode, sessionStartTime, duration, currentTitle, selectedSkillId, selectedPillarId, addSession, stopTimer]);

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
        skillId: selectedSkillId,
        pillarId: selectedPillarId,
      });
      
      if (selectedSkillId) {
        useMasteryStore.getState().addTimeToSkill(selectedSkillId, selectedPillarId, totalDuration);
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

          {/* Minimalist First-Time Tutorial */}
          {!hasCompletedTutorial && status === 'idle' && !activeRoutine && (
            <Animated.View className="absolute top-20 left-6 right-6 z-40 bg-blue-50 dark:bg-blue-900/40 rounded-2xl p-4 border border-blue-200 dark:border-blue-800/60 shadow-sm flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 items-center justify-center mr-3">
                <Text className="text-base">💡</Text>
              </View>
              <Text className="flex-1 text-blue-800 dark:text-blue-200 font-bold text-[13px] leading-tight">
                Step 1: Go to the <Text className="font-black text-orange-500">Mastery</Text> tab to set up your first Skill Target and Routine.
              </Text>
            </Animated.View>
          )}

          {/* Smart Routine Banner */}
          {activeRoutine && status === 'idle' && (
            <Animated.View className="absolute top-20 left-6 right-6 z-50">
              <Pressable 
                onPress={() => {
                  const store = useTimerStore.getState();
                  store.setSelectedSkillId(activeRoutine.skillId || null);
                  if (activeRoutine.pillarId) store.setSelectedPillarId(activeRoutine.pillarId);
                  store.setDuration(activeRoutine.durationMinutes * 60);
                  if (activeRoutine.title) store.setTitle(activeRoutine.title);
                  setActiveRoutine(null); // Hide banner after applied
                }}
                className="flex-row items-center justify-between bg-blue-600 shadow-xl rounded-2xl p-4 border border-blue-500"
              >
                <View className="flex-row items-center gap-3 flex-1 mr-3">
                  <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                    <Feather name="calendar" size={18} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-black text-sm" numberOfLines={1}>{activeRoutine.title}</Text>
                    <Text className="text-blue-200 font-bold text-[10px] uppercase tracking-wider mt-0.5">
                      Scheduled Routine Active
                    </Text>
                  </View>
                </View>
                <View className="bg-white px-4 py-2 rounded-xl">
                  <Text className="text-blue-600 font-black text-xs">Load</Text>
                </View>
              </Pressable>
            </Animated.View>
          )}

          {/* Middle: Timer Display (Shifted lower) */}
          <View className="flex-1 items-center justify-center z-0 mt-4" pointerEvents="box-none">
            <View className="items-center justify-center -mt-2">
              <TimerTitleInput />
              <SkillSelector />
              
              <View className="mt-8">
                <TimerDisplay onOpenModal={() => setDurationModalVisible(true)} />
              </View>
            </View>
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

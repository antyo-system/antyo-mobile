import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Switch, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '@/store/useTimerStore';
import { Tabs } from 'expo-router';
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
import { SpotlightOverlay, SpotlightStep, SpotlightCoords } from '@/components/tutorial/SpotlightOverlay';
import { SessionCompleteOverlay } from '@/components/timer/SessionCompleteOverlay';
import { getMasteryProgress } from '@/utils/mastery';

export default function TimerScreen() {
  const { 
    status, mode, timeLeft, timeElapsed, tick, currentTitle, duration, 
    sessionType, autoPlay, setSessionType, startTimer, stopTimer, sessionStartTime, selectedSkillId, selectedPillarId 
  } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      mode: s.mode,
      timeLeft: s.timeLeft,
      timeElapsed: s.timeElapsed,
      tick: s.tick,
      currentTitle: s.currentTitle,
      duration: s.duration,
      sessionType: s.sessionType,
      autoPlay: s.autoPlay,
      setSessionType: s.setSessionType,
      startTimer: s.startTimer,
      stopTimer: s.stopTimer,
      sessionStartTime: s.sessionStartTime,
      selectedSkillId: s.selectedSkillId,
      selectedPillarId: s.selectedPillarId,
    }))
  );
  const addSession = useSessionStore((s: any) => s.addSession);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [activeRoutine, setActiveRoutine] = useState<Plan | null>(null);

  // Tutorial State
  const { hasSeenTimerTutorial, setTutorialSeen } = useAppStore();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<SpotlightStep[]>([]);
  const isFocused = useIsFocused();
  
  const rootRef = useRef<View>(null);
  const taskRef = useRef<View>(null);
  const skillRef = useRef<View>(null);
  const durationRef = useRef<View>(null);
  const playRef = useRef<View>(null);

  // Overlay State
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayType, setOverlayType] = useState<'session_complete' | 'level_up' | null>(null);
  const [overlayDuration, setOverlayDuration] = useState(0);
  const [overlaySkillName, setOverlaySkillName] = useState<string | undefined>();
  const [overlayNewLevel, setOverlayNewLevel] = useState<string | undefined>();

  const triggerOverlay = (totalDurationSeconds: number) => {
    let skillName = undefined;
    let oldLevel = undefined;
    let newLevel = undefined;

    if (selectedSkillId) {
      const masteryStore = useMasteryStore.getState();
      const skill = masteryStore.skills.find(s => s.id === selectedSkillId);
      
      if (skill) {
        skillName = skill.name;
        oldLevel = getMasteryProgress(skill.totalSeconds).currentLevel;
        
        masteryStore.addTimeToSkill(selectedSkillId, selectedPillarId, totalDurationSeconds);
        
        const updatedSkill = useMasteryStore.getState().skills.find(s => s.id === selectedSkillId);
        if (updatedSkill) {
          newLevel = getMasteryProgress(updatedSkill.totalSeconds).currentLevel;
        }
      }
    }

    setOverlayDuration(Math.round(totalDurationSeconds / 60));
    setOverlaySkillName(skillName);

    if (oldLevel && newLevel && newLevel.level > oldLevel.level) {
      setOverlayType('level_up');
      setOverlayNewLevel(`${newLevel.icon} ${newLevel.level}`);
    } else {
      setOverlayType('session_complete');
    }
    
    setOverlayVisible(true);
    
    if (autoPlay) {
      setTimeout(() => {
        setOverlayVisible(false);
      }, 1500); // Shorter duration if auto-play is on
    }
  };

  useEffect(() => {
    if (!hasSeenTimerTutorial && isFocused) {
      setTutorialSteps([
        { targetRef: taskRef, text: "Step 1: Define your mission. Type the specific task you want to conquer today.", holeType: 'rect', holePadding: 8 },
        { targetRef: skillRef, text: "Step 2: Link your effort to a Skill. This is crucial to track your 10,000 hours journey.", holeType: 'rect', holePadding: 8 },
        { targetRef: durationRef, text: "Step 3: Set your boundaries. Use Timer for strict blocks, or Stopwatch for open-ended flow.", holeType: 'rect', holePadding: 16 },
        { targetRef: playRef, text: "Step 4: Ignite your engine. No distractions. Just pure execution.", holeType: 'circle', holePadding: 20 },
      ]);
      const timeout = setTimeout(() => {
        setTutorialVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenTimerTutorial, isFocused]);

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
      if (sessionType === 'focus') {
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
        
        triggerOverlay(totalDuration);
        
        // Transition to Break
        stopTimer(); // First reset to idle
        setSessionType('break'); // Set to break mode (this will set timeLeft to breakDuration)
        
        if (autoPlay) {
          // Add a tiny delay to let UI breathe before auto-starting break
          setTimeout(() => {
            startTimer();
          }, 100);
        }
      } else if (sessionType === 'break') {
        // Break finished. Untracked. 
        // Just trigger Haptic
        import('expo-haptics').then(Haptics => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        });

        // Transition back to Focus
        stopTimer();
        setSessionType('focus');

        if (autoPlay) {
          setTimeout(() => {
            startTimer();
          }, 100);
        }
      }
    }
  }, [timeLeft, status, mode, sessionType, autoPlay, sessionStartTime, duration, currentTitle, selectedSkillId, selectedPillarId, addSession, stopTimer, setSessionType, startTimer]);

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
      if (sessionType === 'focus') {
        let totalDuration = duration;
        if (mode === 'stopwatch') {
          totalDuration = timeElapsed;
        } else {
          totalDuration = duration - timeLeft;
        }
        
        // Don't save if it was incredibly short (less than 10 seconds)
        if (totalDuration > 10) {
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
          
          triggerOverlay(totalDuration);
        }
      }
    }
    stopTimer();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <Tabs.Screen options={{ 
        headerShown: false,
        tabBarStyle: tutorialVisible ? { display: 'none' } : undefined
      }} />

      <SessionCompleteOverlay
        visible={overlayVisible}
        type={overlayType}
        durationMinutes={overlayDuration}
        skillName={overlaySkillName}
        newLevelName={overlayNewLevel}
        onAnimationEnd={() => setOverlayVisible(false)}
      />

      <View style={{ flex: 1 }} ref={rootRef} collapsable={false}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View className="flex-1 pt-6 pb-8 px-6" pointerEvents="box-none">
            
            {/* Top: Smart Mode Toggle */}
            <View className="items-center justify-start z-10 pt-2 w-full">
              <TimerModeToggle />
            </View>

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
              <View className="items-center justify-center -mt-2 w-full">
                <View className="items-center justify-center" ref={taskRef} collapsable={false}>
                  <TimerTitleInput />
                </View>
                
                <View className="items-center justify-center" ref={skillRef} collapsable={false}>
                  <SkillSelector />
                </View>
                
                <View className="mt-8" ref={durationRef} collapsable={false}>
                  <TimerDisplay onOpenModal={() => setDurationModalVisible(true)} />
                </View>
              </View>
            </View>

            {/* Bottom 1/3: Controls */}
            <View className="items-center justify-center h-[20%] z-10 mb-20">
              <TimerControls onSaveAndStop={handleSaveAndStop} playButtonRef={playRef} />
            </View>
            
          </View>
        </KeyboardAvoidingView>

        {/* Custom Tutorial Overlay (Rendered inside rootRef for exact coordinate parity) */}
        <SpotlightOverlay
          visible={tutorialVisible}
          steps={tutorialSteps}
          rootRef={rootRef}
          onFinish={() => {
            setTutorialVisible(false);
            setTutorialSeen('timer');
          }}
        />
      </View>
      <TimerDurationModal visible={durationModalVisible} onClose={() => setDurationModalVisible(false)} />
    </SafeAreaView>
  );
}

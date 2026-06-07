import { PlanEditorModal } from '@/components/calendar/PlanEditorModal';
import { NewSkillModal } from '@/components/mastery/NewSkillModal';
import { SkillTargetModal } from '@/components/mastery/SkillTargetModal';
import { SpotlightOverlay, SpotlightStep } from '@/components/tutorial/SpotlightOverlay';
import { useAppStore } from '@/store/useAppStore';
import { Skill, useMasteryStore } from '@/store/useMasteryStore';
import { Plan, usePlanStore } from '@/store/usePlanStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useTimerStore } from '@/store/useTimerStore';
import { getMasteryProgress } from '@/utils/mastery';
import { Feather } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { isToday } from 'date-fns';
import { router, Tabs } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, ScrollView, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

function SkillCard({ skill, onSetTarget, onCreateRoutine }: { skill: Skill, onSetTarget: (skill: Skill) => void, onCreateRoutine: (skill: Skill) => void }) {
  const isDark = useColorScheme() === 'dark';
  const progress = getMasteryProgress(skill.totalSeconds);


  // Calculate today's progress
  const sessions = useSessionStore(s => s.sessions);
  const todaySessions = sessions.filter(
    s => s.skillId === skill.id && isToday(new Date(s.startTime))
  );
  const todayProgressSeconds = todaySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const todayProgressMinutes = Math.floor(todayProgressSeconds / 60);

  const targetMinutes = skill.dailyTargetMinutes || 0;
  const isTargetMet = targetMinutes > 0 && todayProgressMinutes >= targetMinutes;

  const { hasCompletedTutorial } = useAppStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasCompletedTutorial) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasCompletedTutorial]);

  const plans = usePlanStore(s => s.plans);
  const skillRoutines = plans.filter(p => p.skillId === skill.id && p.recurrence !== 'none');
  const visibleRoutines = skillRoutines.slice(0, 2);
  const extraCount = Math.max(0, skillRoutines.length - 2);

  const formatRoutineTime = (plan: Plan) => {
    const startH = Math.floor(plan.startMinutes / 60).toString().padStart(2, '0');
    const startM = (plan.startMinutes % 60).toString().padStart(2, '0');
    const endMinutes = plan.startMinutes + plan.durationMinutes;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
    const endM = (endMinutes % 60).toString().padStart(2, '0');

    let recStr = 'Once';
    if (plan.recurrence === 'weekdays') recStr = 'Mon-Fri';
    else if (plan.recurrence === 'daily') recStr = 'Daily';
    else if (plan.recurrence === 'weekly') recStr = 'Weekly';
    else if (plan.recurrence === 'specific_days' && plan.recurrenceDays && plan.recurrenceDays.length > 0) {
      const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      // sort days for consistency
      const sortedDays = [...plan.recurrenceDays].sort((a, b) => a - b);
      recStr = sortedDays.map(d => daysMap[d]).join(', ');
    }

    return `${recStr} ${startH}.${startM}-${endH}.${endM}`;
  };

  const handleRoutinePress = (plan: Plan) => {
    const timerStore = useTimerStore.getState();
    timerStore.setSelectedSkillId(plan.skillId || null);
    if (plan.pillarId) timerStore.setSelectedPillarId(plan.pillarId);
    timerStore.setDuration(plan.durationMinutes * 60);
    // Use the exact title of the plan if it's available, otherwise it falls back inside the store
    if (plan.title) timerStore.setTitle(plan.title);

    router.push('/(tabs)');
  };



  return (
    <Pressable
      onPress={() => router.push(`/skill/${skill.id}` as any)}
      className={`rounded-3xl p-5 mb-4 shadow-sm border ${isTargetMet
          ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 shadow-orange-500/10'
          : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
        }`}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <View className={`w-12 h-12 rounded-2xl items-center justify-center ${isTargetMet ? 'bg-orange-100 dark:bg-orange-900/50' : (isDark ? 'bg-blue-900/50' : 'bg-blue-100')}`}>
            <Feather name={skill.icon as any} size={20} color={isTargetMet ? "#F97316" : "#3B82F6"} />
          </View>
          <View>
            <Text className="text-xl font-black text-gray-900 dark:text-white">{skill.name}</Text>
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              {progress.currentLevel.icon} {progress.currentLevel.level}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className={`text-sm font-black ${isTargetMet ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
            {Math.floor(progress.totalHours).toLocaleString()} / 10K
          </Text>
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Hours</Text>
        </View>
      </View>



      {/* Footer Actions */}
      <View className={`mt-4 pt-4 border-t ${isTargetMet ? 'border-orange-200 dark:border-orange-900/30' : 'border-gray-100 dark:border-gray-800'}`}>
        <Pressable onPress={() => onSetTarget(skill)}>
          {targetMinutes > 0 ? (
            <View>
              <View className="flex-row justify-between mb-2">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily Target</Text>
                  {isTargetMet && <Text className="text-sm">🔥</Text>}
                </View>
                <Text className={`text-xs font-black ${isTargetMet ? 'text-orange-500' : 'text-gray-900 dark:text-gray-300'}`}>
                  {todayProgressMinutes} / {targetMinutes} min
                </Text>
              </View>
              <View className={`w-full h-2 rounded-full overflow-hidden ${isTargetMet ? 'bg-orange-200 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <View
                  className={`h-full rounded-full ${isTargetMet ? 'bg-orange-500' : 'bg-blue-500'}`}
                  style={{ width: `${Math.min(100, (todayProgressMinutes / targetMinutes) * 100)}%` }}
                />
              </View>
            </View>
          ) : (
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">No Daily Target Set</Text>
              <Animated.View style={{ opacity: (!hasCompletedTutorial && targetMinutes === 0) ? pulseAnim : 1 }} className={`px-3 py-1.5 rounded-full ${(!hasCompletedTutorial && targetMinutes === 0) ? 'bg-orange-500' : 'bg-gray-100 dark:bg-gray-800'}`}>
                <Text className={`text-[10px] font-bold uppercase tracking-widest ${(!hasCompletedTutorial && targetMinutes === 0) ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>Set Target</Text>
              </Animated.View>
            </View>
          )}
        </Pressable>

        {skillRoutines.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {visibleRoutines.map(routine => (
              <Pressable
                key={routine.id}
                onPress={(e) => { e.stopPropagation(); handleRoutinePress(routine); }}
                className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50"
              >
                <Feather name="play-circle" size={12} color="#3B82F6" />
                <Text className="ml-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-400">
                  {formatRoutineTime(routine)}
                </Text>
              </Pressable>
            ))}
            {extraCount > 0 && (
              <View className="items-center justify-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400">+{extraCount}</Text>
              </View>
            )}
          </View>
        )}

        <Pressable
          onPress={(e) => { e.stopPropagation(); onCreateRoutine(skill); }}
        >
          <Animated.View style={{ opacity: (!hasCompletedTutorial && targetMinutes > 0 && skillRoutines.length === 0) ? pulseAnim : 1 }} className={`mt-3 flex-row items-center justify-center py-3 rounded-2xl border ${(!hasCompletedTutorial && targetMinutes > 0 && skillRoutines.length === 0) ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
            <Feather name="calendar" size={14} color={(!hasCompletedTutorial && targetMinutes > 0 && skillRoutines.length === 0) ? "#fff" : "#6B7280"} />
            <Text className={`ml-2 text-xs font-bold ${(!hasCompletedTutorial && targetMinutes > 0 && skillRoutines.length === 0) ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>Create Routine</Text>
          </Animated.View>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function MasteryScreen() {
  const isDark = useColorScheme() === 'dark';
  const skills = useMasteryStore(s => s.skills);
  const addSkill = useMasteryStore(s => s.addSkill);
  const updateSkill = useMasteryStore(s => s.updateSkill);
  const { hasCompletedTutorial, completeTutorial } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Tutorial State
  const { hasSeenMasteryTutorial, setTutorialSeen } = useAppStore();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<SpotlightStep[]>([]);
  const isFocused = useIsFocused();

  const addRef = useRef<View>(null);
  const listRef = useRef<View>(null);
  const infoRef = useRef<View>(null);
  const rootRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [stepLayouts, setStepLayouts] = useState<Record<number, { y: number, h: number }>>({});
  const handleLayout = (index: number) => (e: any) => {
    const { y, height } = e.nativeEvent.layout;
    setStepLayouts(prev => ({ ...prev, [index]: { y, h: height } }));
  };

  useEffect(() => {
    if (!hasSeenMasteryTutorial && isFocused) {
      setTutorialSteps([
        { targetRef: addRef, text: "Step 1: Your Focus Areas. Tap here to create a Skill you want to master.", holeType: 'circle', holePadding: 12 },
        { targetRef: listRef, text: "Step 2: The 10,000 Hours Journey. Watch your level grow here as you record focused time.", holeType: 'rect', holePadding: 8 },
        { targetRef: infoRef, text: "Step 3: Keep going. Every session brings you closer to world-class mastery.", holeType: 'rect', holePadding: 8 },
      ]);
      const timeout = setTimeout(() => {
        setTutorialVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenMasteryTutorial, isFocused]);

  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [selectedSkillForTarget, setSelectedSkillForTarget] = useState<Skill | null>(null);

  const handleOpenTargetModal = (skill: Skill) => {
    setSelectedSkillForTarget(skill);
    setTargetModalVisible(true);
  };

  const handleSaveTarget = (minutes: number) => {
    if (selectedSkillForTarget) {
      updateSkill(selectedSkillForTarget.id, { dailyTargetMinutes: minutes > 0 ? minutes : null });
    }
  };

  const addPlan = usePlanStore(s => s.addPlan);
  const [routineEditorVisible, setRoutineEditorVisible] = useState(false);
  const [routinePlanTemplate, setRoutinePlanTemplate] = useState<Partial<Plan> | null>(null);

  const handleCreateRoutine = (skill: Skill) => {
    const colorMap: Record<string, string> = {
      'blue': '#3B82F6',
      'green': '#10B981',
      'yellow': '#F59E0B',
      'red': '#EF4444',
      'purple': '#8B5CF6',
      'pink': '#EC4899',
    };

    setRoutinePlanTemplate({
      id: '', // Dummy ID to trigger edit mode and pre-fills
      title: `${skill.name} Routine`,
      skillId: skill.id,
      color: colorMap[skill.color] || '#3B82F6',
      recurrence: 'weekdays',
      durationMinutes: skill.dailyTargetMinutes || 30,
      startMinutes: 9 * 60, // 09:00 default
      baseDate: new Date().toISOString()
    });
    setRoutineEditorVisible(true);
  };

  const handleSaveRoutine = (data: Partial<Plan>) => {
    addPlan({
      id: Date.now().toString(),
      title: data.title || 'New Routine',
      startMinutes: data.startMinutes ?? 9 * 60,
      durationMinutes: data.durationMinutes ?? 30,
      recurrence: data.recurrence || 'none',
      recurrenceDays: data.recurrenceDays,
      baseDate: data.baseDate || new Date().toISOString(),
      color: data.color,
      skillId: data.skillId,
    });
    setRoutineEditorVisible(false);

    // Auto-complete tutorial if they successfully create their first routine
    if (!hasCompletedTutorial) {
      completeTutorial();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <View style={{ flex: 1 }} ref={rootRef} collapsable={false}>
        <Tabs.Screen options={{
          headerShown: false,
          tabBarStyle: tutorialVisible ? { display: 'none' } : undefined
        }} />

        <ScrollView ref={scrollViewRef} className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
          <View className="flex-row justify-between items-center mb-2 mt-4">
            <Text className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              Mastery
            </Text>
            <View className="flex-row items-center gap-3">
              <View ref={addRef} collapsable={false}>
                <Pressable
                  onPress={() => setModalVisible(true)}
                  className="w-10 h-10 items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full"
                >
                  <Feather name="plus" size={20} color="#6B7280" />
                </Pressable>
              </View>
            </View>
          </View>

          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8">
            The journey to 10,000 hours of deep work.
          </Text>

          <View className="gap-2" ref={listRef} collapsable={false} onLayout={handleLayout(1)}>
            {[...skills].sort((a, b) => b.totalSeconds - a.totalSeconds).map(skill => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onSetTarget={handleOpenTargetModal}
                onCreateRoutine={handleCreateRoutine}
              />
            ))}

            {skills.length === 0 && (
              <View className="items-center justify-center py-10 opacity-50">
                <Feather name="award" size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
                <Text className="text-gray-500 font-bold mt-4">No skills added yet.</Text>
              </View>
            )}
          </View>

          <Pressable 
            onPress={() => setShowInfo(!showInfo)}
            className="mt-6 mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-900/30" 
            ref={infoRef} 
            collapsable={false} 
            onLayout={handleLayout(2)}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-blue-800 dark:text-blue-300">Why 10,000 Hours?</Text>
              <Feather name={showInfo ? "chevron-up" : "chevron-down"} size={16} color={isDark ? "#93C5FD" : "#1E3A8A"} />
            </View>
            {showInfo && (
              <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400 leading-relaxed mt-3">
                It takes approximately 10,000 hours of deliberate practice to achieve world-class mastery in any field. Every focus session brings you one step closer to greatness.
              </Text>
            )}
          </Pressable>
        </ScrollView>

        {/* Add Skill Modal */}
        <NewSkillModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
        />

        {/* Target Modal */}
        {selectedSkillForTarget && (
          <SkillTargetModal
            visible={targetModalVisible}
            onClose={() => setTargetModalVisible(false)}
            onSave={handleSaveTarget}
            skillName={selectedSkillForTarget.name}
            initialMinutes={selectedSkillForTarget.dailyTargetMinutes}
          />
        )}

        {/* Routine Editor Modal */}
        <PlanEditorModal
          visible={routineEditorVisible}
          plan={routinePlanTemplate as Plan | null}
          onClose={() => setRoutineEditorVisible(false)}
          onSave={handleSaveRoutine}
          onDelete={() => { }} // No delete functionality in creation mode
        />

        {/* Custom Tutorial Overlay */}
        <SpotlightOverlay
          visible={tutorialVisible}
          steps={tutorialSteps}
          rootRef={rootRef}
          onStepChange={(index) => {
            const layout = stepLayouts[index];
            if (layout && scrollViewRef.current) {
              const screenH = Dimensions.get('window').height;
              const scrollY = Math.max(0, layout.y - (screenH / 2) + (layout.h / 2));
              scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
            }
          }}
          onFinish={() => {
            setTutorialVisible(false);
            setTutorialSeen('mastery');
          }}
        />
      </View>
    </SafeAreaView>
  );
}

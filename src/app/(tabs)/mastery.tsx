import { View, Text, ScrollView, Pressable, useColorScheme, Animated, Dimensions, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMasteryStore, Skill } from '@/store/useMasteryStore';
import { useSessionStore } from '@/store/useSessionStore';
import { getMasteryProgress, MILESTONES } from '@/utils/mastery';
import { formatLongTime } from '@/utils/time';
import { useEffect, useRef, useState } from 'react';
import { isToday } from 'date-fns';
import { SkillTargetModal } from '@/components/mastery/SkillTargetModal';
import { PlanEditorModal } from '@/components/calendar/PlanEditorModal';
import { usePlanStore, Plan } from '@/store/usePlanStore';

const { width } = Dimensions.get('window');

function SkillCard({ skill, onSetTarget, onCreateRoutine }: { skill: Skill, onSetTarget: (skill: Skill) => void, onCreateRoutine: (skill: Skill) => void }) {
  const isDark = useColorScheme() === 'dark';
  const progress = getMasteryProgress(skill.totalSeconds);
  const animWidth = useRef(new Animated.Value(0)).current;

  // Calculate today's progress
  const sessions = useSessionStore(s => s.sessions);
  const todaySessions = sessions.filter(
    s => s.skillId === skill.id && isToday(new Date(s.startTime))
  );
  const todayProgressSeconds = todaySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const todayProgressMinutes = Math.floor(todayProgressSeconds / 60);

  const targetMinutes = skill.dailyTargetMinutes || 0;
  const isTargetMet = targetMinutes > 0 && todayProgressMinutes >= targetMinutes;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress.progressPercentage,
      duration: 1000,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [progress.progressPercentage]);

  return (
    <Pressable 
      onPress={() => router.push(`/skill/${skill.id}` as any)}
      className={`rounded-3xl p-5 mb-4 shadow-sm border ${
        isTargetMet 
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

      <View className="mb-2">
        <View className="flex-row justify-between mb-2">
          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">
            {progress.nextLevel ? `To ${progress.nextLevel.level}` : 'Max Level Reached!'}
          </Text>
          {progress.nextLevel && (
            <Text className="text-xs font-bold text-gray-900 dark:text-gray-300">
              {Math.floor(progress.hoursToNextLevel - progress.currentLevelHours).toLocaleString()}h left
            </Text>
          )}
        </View>
        
        {/* Progress Bar Container */}
        <View className={`w-full h-3 rounded-full overflow-hidden ${isTargetMet ? 'bg-orange-200 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <Animated.View 
            className={`h-full rounded-full ${isTargetMet ? 'bg-orange-500' : 'bg-blue-500'}`} 
            style={{ 
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) 
            }} 
          />
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
              <View className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                <Text className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Set Target</Text>
              </View>
            </View>
          )}
        </Pressable>

        <Pressable 
          onPress={(e) => { e.stopPropagation(); onCreateRoutine(skill); }}
          className="mt-3 flex-row items-center justify-center py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <Feather name="calendar" size={14} color="#6B7280" />
          <Text className="ml-2 text-xs font-bold text-gray-600 dark:text-gray-300">Create Routine</Text>
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
  
  const [modalVisible, setModalVisible] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

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
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <Tabs.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="flex-row justify-between items-center mb-2 mt-4">
          <Text className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Mastery
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable 
              onPress={() => setModalVisible(true)}
              className="w-10 h-10 items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full"
            >
              <Feather name="plus" size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>
        
        <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8">
          The journey to 10,000 hours of deep work.
        </Text>

        <View className="gap-2">
          {skills.map(skill => (
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

        <View className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/50 mb-10">
          <Text className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Why 10,000 Hours?</Text>
          <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400 leading-relaxed">
            It takes approximately 10,000 hours of deliberate practice to achieve world-class mastery in any field. Every focus session brings you one step closer to greatness.
          </Text>
        </View>

      </ScrollView>

      {/* Add Skill Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 h-[80%] border-t border-gray-200 dark:border-gray-800 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-gray-900 dark:text-white">New Skill</Text>
              <Pressable onPress={() => setModalVisible(false)} className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                <Feather name="x" size={16} color={isDark ? "white" : "black"} />
              </Pressable>
            </View>

            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Skill Name</Text>
            <View className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-4 mb-6 border border-gray-200 dark:border-gray-700">
              <TextInput
                value={newSkillName}
                onChangeText={setNewSkillName}
                placeholder="e.g. Coding, Guitar, Writing..."
                placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                style={{ fontSize: 18, fontWeight: 'bold', color: isDark ? 'white' : '#111827', padding: 0 }}
              />
            </View>

            <View className="flex-1" />

            <Pressable 
              onPress={() => {
                if (newSkillName.trim()) {
                  addSkill({
                    name: newSkillName.trim(),
                    icon: 'star', // default icon
                    color: 'blue' // default color
                  });
                  setNewSkillName('');
                  setModalVisible(false);
                }
              }}
              className={`py-4 rounded-2xl items-center ${newSkillName.trim() ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              disabled={!newSkillName.trim()}
            >
              <Text className="text-white font-black text-lg">Create Skill</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
        onDelete={() => {}} // No delete functionality in creation mode
      />
    </SafeAreaView>
  );
}

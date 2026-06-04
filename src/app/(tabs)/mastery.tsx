import { View, Text, ScrollView, Pressable, useColorScheme, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Tabs, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useMasteryStore, Skill } from '@/store/useMasteryStore';
import { getMasteryProgress, MILESTONES } from '@/utils/mastery';
import { formatLongTime } from '@/utils/time';
import { useEffect, useRef, useState } from 'react';

const { width } = Dimensions.get('window');

function SkillCard({ skill }: { skill: Skill }) {
  const isDark = useColorScheme() === 'dark';
  const progress = getMasteryProgress(skill.totalSeconds);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: progress.progressPercentage,
      duration: 1000,
      useNativeDriver: false, // width cannot use native driver
    }).start();
  }, [progress.progressPercentage]);

  return (
    <Pressable 
      className="bg-white dark:bg-gray-900 rounded-3xl p-5 mb-4 shadow-sm border border-gray-100 dark:border-gray-800"
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 rounded-2xl items-center justify-center" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}>
            <Feather name={skill.icon as any} size={20} color="#3B82F6" />
          </View>
          <View>
            <Text className="text-xl font-black text-gray-900 dark:text-white">{skill.name}</Text>
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-0.5">
              {progress.currentLevel.icon} {progress.currentLevel.level}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="text-sm font-black text-blue-600 dark:text-blue-400">
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
        <View className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <Animated.View 
            className="h-full rounded-full bg-blue-500" 
            style={{ 
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%']
              }) 
            }} 
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function MasteryScreen() {
  const isDark = useColorScheme() === 'dark';
  const skills = useMasteryStore(s => s.skills);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <Tabs.Screen options={{ headerShown: false }} />
      
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="flex-row justify-between items-center mb-2 mt-4">
          <Text className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            Mastery
          </Text>
          <View className="flex-row items-center gap-3">
            <Pressable className="w-10 h-10 items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full">
              <Feather name="plus" size={20} color="#6B7280" />
            </Pressable>
            <Pressable onPress={() => router.push('/profile')} className="w-10 h-10 rounded-full bg-emerald-500/10 items-center justify-center border-2 border-emerald-500/30 overflow-hidden">
              <Feather name="user" size={18} color="#10B981" />
            </Pressable>
          </View>
        </View>
        
        <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8">
          The journey to 10,000 hours of deep work.
        </Text>

        <View className="gap-2">
          {skills.map(skill => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
          
          {skills.length === 0 && (
            <View className="items-center justify-center py-10 opacity-50">
              <Feather name="award" size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="text-gray-500 font-bold mt-4">No skills added yet.</Text>
            </View>
          )}
        </View>

        <View className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/50">
          <Text className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2">Why 10,000 Hours?</Text>
          <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400 leading-relaxed">
            It takes approximately 10,000 hours of deliberate practice to achieve world-class mastery in any field. Every focus session brings you one step closer to greatness.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

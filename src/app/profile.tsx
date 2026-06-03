import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSessionStore } from '@/store/useSessionStore';
import { useColorScheme } from 'react-native';
import { useMemo } from 'react';

export default function ProfileScreen() {
  const sessions = useSessionStore(s => s.sessions);
  const colorScheme = useColorScheme();
  
  const stats = useMemo(() => {
    let totalSeconds = 0;
    let smartSeconds = 0;
    sessions.forEach(s => {
      totalSeconds += s.durationSeconds;
      if (s.isSmartMode && s.focusDurationSeconds) {
        smartSeconds += s.focusDurationSeconds;
      }
    });
    return {
      totalHours: (totalSeconds / 3600).toFixed(1),
      smartHours: (smartSeconds / 3600).toFixed(1),
      totalSessions: sessions.length
    };
  }, [sessions]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
          <Feather name="x" size={20} color={colorScheme === 'dark' ? 'white' : 'black'} />
        </Pressable>
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Profile</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 rounded-full bg-emerald-500/20 items-center justify-center mb-4 border-2 border-emerald-500">
            <Feather name="user" size={40} className="text-emerald-500" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">Deep Worker</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1">user@example.com</Text>
          
          <View className="mt-4 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-full">
            <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Novice Level
            </Text>
          </View>
        </View>

        {/* Highlights */}
        <View className="flex-row justify-between mb-8 space-x-4">
          <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 items-center">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalHours}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-1">Total Hrs</Text>
          </View>
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-3xl border border-emerald-100 dark:border-emerald-900/50 items-center">
            <Text className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.smartHours}</Text>
            <Text className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-semibold uppercase tracking-wider mt-1">Smart Hrs</Text>
          </View>
          <View className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 items-center">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalSessions}</Text>
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mt-1">Sessions</Text>
          </View>
        </View>

        {/* Settings Group 1 */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Preferences</Text>
          <View className="bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
            
            <View className="flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                  <Feather name="moon" size={16} className="text-blue-500" />
                </View>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">Dark Mode</Text>
              </View>
              <Switch value={colorScheme === 'dark'} disabled trackColor={{ true: '#10b981' }} />
            </View>

            <View className="flex-row items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-purple-500/10 items-center justify-center">
                  <Feather name="bell" size={16} className="text-purple-500" />
                </View>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">Notifications</Text>
              </View>
              <Feather name="chevron-right" size={20} className="text-gray-400" />
            </View>

            <Pressable 
              onPress={() => router.replace('/onboarding' as any)}
              className="flex-row items-center justify-between p-5 active:bg-gray-100 dark:active:bg-gray-800"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                  <Feather name="monitor" size={16} className="text-blue-500" />
                </View>
                <Text className="text-base font-semibold text-blue-500">Show Onboarding</Text>
              </View>
            </Pressable>

          </View>
        </View>

        {/* Settings Group 2 */}
        <View className="mb-8">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Data</Text>
          <View className="bg-gray-50 dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <Pressable className="flex-row items-center justify-between p-5 active:bg-gray-100 dark:active:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-orange-500/10 items-center justify-center">
                  <Feather name="download" size={16} className="text-orange-500" />
                </View>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">Export Data</Text>
              </View>
            </Pressable>
            <Pressable className="flex-row items-center justify-between p-5 active:bg-gray-100 dark:active:bg-gray-800">
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center">
                  <Feather name="trash-2" size={16} className="text-red-500" />
                </View>
                <Text className="text-base font-semibold text-red-500">Delete Account</Text>
              </View>
            </Pressable>
          </View>
        </View>
        
        <View className="items-center mb-12">
          <Text className="text-xs text-gray-400">ANTYO Focus v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import { View, Text, Pressable, ScrollView, Linking, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useColorScheme } from 'react-native';
import { useMemo, useState, useEffect } from 'react';

export default function ProfileScreen() {
  const sessions = useSessionStore(s => s.sessions);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    sleepStart, sleepEnd,
    defaultBreakMinutes,
    dailyFocusTargetHours,
    birthYear, retirementAge,
    appearance,
    updateSettings,
  } = useSettingsStore();

  // Local state for inline sleep editor
  const [sleepExpanded, setSleepExpanded] = useState(false);
  const [localSleepStart, setLocalSleepStart] = useState(sleepStart);
  const [localSleepEnd, setLocalSleepEnd] = useState(sleepEnd);
  const [localBirthYear, setLocalBirthYear] = useState(birthYear.toString());
  const [localRetirementAge, setLocalRetirementAge] = useState(retirementAge.toString());
  
  const [developerExpanded, setDeveloperExpanded] = useState(false);

  useEffect(() => {
    setLocalSleepStart(sleepStart);
    setLocalSleepEnd(sleepEnd);
  }, [sleepStart, sleepEnd]);

  const saveSleep = () => {
    updateSettings({ sleepStart: localSleepStart, sleepEnd: localSleepEnd });
    setSleepExpanded(false);
  };

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
      totalSessions: sessions.length,
    };
  }, [sessions]);

  const breakOptions = [5, 10, 15, 20];

  const handleDeleteAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently remove all sessions, plans, and tasks. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            useSessionStore.getState().clearSessions?.();
          },
        },
      ]
    );
  };

  // ── Reusable row component ──
  const SettingRow = ({
    icon, iconBg, label, right, onPress, isLast, danger,
  }: {
    icon: string; iconBg: string; label: string;
    right?: React.ReactNode; onPress?: () => void;
    isLast?: boolean; danger?: boolean;
  }) => (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center justify-between p-4 active:bg-gray-100 dark:active:bg-gray-800 ${
        isLast ? '' : 'border-b border-gray-100 dark:border-gray-800'
      }`}
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-8 h-8 rounded-full items-center justify-center ${iconBg}`}>
          <Feather name={icon as any} size={16} color={danger ? '#EF4444' : isDark ? '#D1D5DB' : '#6B7280'} />
        </View>
        <Text className={`text-base font-semibold ${danger ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
          {label}
        </Text>
      </View>
      {right || <Feather name="chevron-right" size={18} color="#9CA3AF" />}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <Feather name="x" size={20} color={isDark ? 'white' : 'black'} />
        </Pressable>
        <Text className="text-lg font-black text-gray-900 dark:text-white">Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
        
        {/* ── 1. User Card ── */}
        <View className="items-center mb-6 mt-2">
          <View className="w-20 h-20 rounded-full bg-emerald-500/20 items-center justify-center mb-3 border-2 border-emerald-500">
            <Feather name="user" size={36} color="#10B981" />
          </View>
          <Text className="text-2xl font-black text-gray-900 dark:text-white">Deep Worker</Text>
          <View className="mt-2 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Text className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Novice Level</Text>
          </View>
        </View>

        {/* ── 2. Quick Stats ── */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 items-center">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalHours}</Text>
            <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Total Hrs</Text>
          </View>
          <View className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 items-center">
            <Text className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.smartHours}</Text>
            <Text className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-bold uppercase tracking-wider mt-1">Smart Hrs</Text>
          </View>
          <View className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 items-center">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalSessions}</Text>
            <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mt-1">Sessions</Text>
          </View>
        </View>

        {/* ── 3. Settings ── */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Settings</Text>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-6">
          
          {/* Sleep Time */}
          <Pressable
            onPress={() => setSleepExpanded(!sleepExpanded)}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 active:bg-gray-50 dark:active:bg-gray-800"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-indigo-500/10 items-center justify-center">
                <Feather name="moon" size={16} color="#6366F1" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Sleep Time</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400">{sleepStart} – {sleepEnd}</Text>
              <Feather name={sleepExpanded ? 'chevron-up' : 'chevron-down'} size={18} color="#9CA3AF" />
            </View>
          </Pressable>

          {sleepExpanded && (
            <View className="px-4 py-4 bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
              <View className="flex-row gap-4 mb-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Bedtime</Text>
                  <TextInput
                    value={localSleepStart}
                    onChangeText={setLocalSleepStart}
                    keyboardType="numeric"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-gray-900 dark:text-white font-bold text-center"
                    placeholder="23:00"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Wake Up</Text>
                  <TextInput
                    value={localSleepEnd}
                    onChangeText={setLocalSleepEnd}
                    keyboardType="numeric"
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-gray-900 dark:text-white font-bold text-center"
                    placeholder="06:00"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
              <Pressable onPress={saveSleep} className="bg-indigo-600 py-2.5 rounded-xl items-center active:opacity-80">
                <Text className="text-white font-bold text-sm">Save</Text>
              </Pressable>
            </View>
          )}

          {/* Break Duration */}
          <View className="p-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-8 h-8 rounded-full bg-orange-500/10 items-center justify-center">
                <Feather name="coffee" size={16} color="#F97316" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Break Duration</Text>
            </View>
            <View className="flex-row gap-2">
              {breakOptions.map(mins => (
                <Pressable
                  key={mins}
                  onPress={() => updateSettings({ defaultBreakMinutes: mins })}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    defaultBreakMinutes === mins
                      ? 'bg-orange-500'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text className={`text-sm font-bold ${
                    defaultBreakMinutes === mins
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>{mins}m</Text>
                </Pressable>
              ))}
            </View>
          </View>



          {/* Daily Focus Target (Hours) */}
          <View className="p-4 border-t border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center">
                <Feather name="zap" size={16} color="#EF4444" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Daily Focus Target (Streak)</Text>
            </View>
            <View className="flex-row gap-2">
              {[1, 2, 3, 4, 5, 8].map(hours => (
                <Pressable
                  key={hours}
                  onPress={() => updateSettings({ dailyFocusTargetHours: hours })}
                  className={`flex-1 py-2.5 rounded-xl items-center ${
                    dailyFocusTargetHours === hours
                      ? 'bg-red-500'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Text className={`text-sm font-bold ${
                    dailyFocusTargetHours === hours
                      ? 'text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>{hours}h</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Lifetime Settings */}
          <View className="p-4 border-t border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-8 h-8 rounded-full bg-emerald-500/10 items-center justify-center">
                <Feather name="clock" size={16} color="#10B981" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Lifetime Analytics</Text>
            </View>
            
            <View className="flex-row gap-4">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-500 mb-2">Birth Year</Text>
                <TextInput
                  value={localBirthYear}
                  onChangeText={setLocalBirthYear}
                  onEndEditing={() => {
                    const year = parseInt(localBirthYear);
                    if (!isNaN(year) && year > 1900 && year < 2100) {
                      updateSettings({ birthYear: year });
                    } else {
                      setLocalBirthYear(birthYear.toString());
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={4}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-bold text-center"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-500 mb-2">Retirement Age</Text>
                <TextInput
                  value={localRetirementAge}
                  onChangeText={setLocalRetirementAge}
                  onEndEditing={() => {
                    const age = parseInt(localRetirementAge);
                    if (!isNaN(age) && age > 0 && age < 150) {
                      updateSettings({ retirementAge: age });
                    } else {
                      setLocalRetirementAge(retirementAge.toString());
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={3}
                  className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 rounded-xl font-bold text-center"
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── 4. Appearance ── */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Appearance</Text>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-6 p-4">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-8 rounded-full bg-purple-500/10 items-center justify-center">
              <Feather name={appearance === 'dark' ? 'moon' : 'sun'} size={16} color="#A855F7" />
            </View>
            <Text className="text-base font-semibold text-gray-900 dark:text-white">Theme</Text>
          </View>
          <View className="flex-row gap-2">
            {(['system', 'light', 'dark'] as const).map(option => (
              <Pressable
                key={option}
                onPress={() => updateSettings({ appearance: option })}
                className={`flex-1 py-3 rounded-xl items-center ${
                  appearance === option
                    ? 'bg-purple-500'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}
              >
                <Feather
                  name={option === 'system' ? 'smartphone' : option === 'light' ? 'sun' : 'moon'}
                  size={16}
                  color={appearance === option ? 'white' : isDark ? '#9CA3AF' : '#6B7280'}
                />
                <Text className={`text-xs font-bold mt-1 capitalize ${
                  appearance === option
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>{option === 'system' ? 'System' : option === 'light' ? 'Light' : 'Dark'}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── 5. About ── */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">About</Text>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-6">
          
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-gray-500/10 items-center justify-center">
                <Feather name="info" size={16} color={isDark ? '#D1D5DB' : '#6B7280'} />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Version</Text>
            </View>
            <Text className="text-sm font-bold text-gray-400">v1.0.1</Text>
          </View>

          <Pressable 
            onPress={() => setDeveloperExpanded(!developerExpanded)}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-emerald-500/10 items-center justify-center">
                <Feather name="code" size={16} color="#10B981" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Developer</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-gray-400">Antonius Prasetyo</Text>
              <Feather name={developerExpanded ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
            </View>
          </Pressable>

          {developerExpanded && (
            <View className="bg-gray-50 dark:bg-gray-800/50">
              <SettingRow
                icon="github"
                iconBg="bg-gray-500/10"
                label="GitHub"
                onPress={() => Linking.openURL('https://github.com/antyo-system')}
              />
              <SettingRow
                icon="instagram"
                iconBg="bg-pink-500/10"
                label="Instagram"
                isLast
                onPress={() => Linking.openURL('https://instagram.com/antyolab')}
              />
            </View>
          )}
          <SettingRow
            icon="shield"
            iconBg="bg-blue-500/10"
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://antyo-system.github.io/privacy')}
          />
          <SettingRow
            icon="file-text"
            iconBg="bg-yellow-500/10"
            label="License (MIT)"
            onPress={() => Linking.openURL('https://github.com/antyo-system/antyo-mobile/blob/main/LICENSE')}
          />
          <SettingRow
            icon="star"
            iconBg="bg-amber-500/10"
            label="Rate App"
            isLast
            onPress={() => {
              Alert.alert('Rate App', 'This will open the store page when the app is published.');
            }}
          />
        </View>

        {/* ── 6. Data (Danger Zone) ── */}
        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Data</Text>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-6">
          <SettingRow
            icon="download"
            iconBg="bg-orange-500/10"
            label="Export Data"
            onPress={() => Alert.alert('Export', 'Coming soon!')}
          />
          <SettingRow
            icon="monitor"
            iconBg="bg-blue-500/10"
            label="Show Onboarding"
            onPress={() => router.replace('/onboarding' as any)}
          />
          <SettingRow
            icon="trash-2"
            iconBg="bg-red-500/10"
            label="Delete All Data"
            danger
            isLast
            onPress={handleDeleteAllData}
          />
        </View>

        <View className="items-center mb-8">
          <Text className="text-[10px] text-gray-400 font-bold">ANTYO Focus v1.0.1</Text>
          <Text className="text-[10px] text-gray-300 dark:text-gray-700 mt-1">Made with ❤️ by Antonius Prasetyo</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

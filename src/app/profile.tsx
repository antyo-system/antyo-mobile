import { View, Text, Pressable, ScrollView, Linking, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useColorScheme } from 'react-native';
import { useMemo, useState, useEffect } from 'react';
import { ChangelogModal } from '@/components/profile/ChangelogModal';
import { APP_VERSION } from '@/constants/changelog';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { usePlanStore } from '@/store/usePlanStore';
import { useAppStore } from '@/store/useAppStore';

export default function ProfileScreen() {
  const sessions = useSessionStore(s => s.sessions);
  const plans = usePlanStore(s => s.plans);
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
  const [exportExpanded, setExportExpanded] = useState(false);
  const [changelogVisible, setChangelogVisible] = useState(false);

  useEffect(() => {
    setLocalSleepStart(sleepStart);
    setLocalSleepEnd(sleepEnd);
  }, [sleepStart, sleepEnd]);

  const saveSleep = () => {
    updateSettings({ sleepStart: localSleepStart, sleepEnd: localSleepEnd });
    setSleepExpanded(false);
  };

  const formatTimeInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 3) {
      setter(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    } else {
      setter(cleaned);
    }
  };

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

  const handleExportData = async () => {
    try {
      const data = {
        sessions,
        plans,
        settings: {
          sleepStart, sleepEnd,
          defaultBreakMinutes,
          dailyFocusTargetHours,
          birthYear, retirementAge,
        }
      };
      
      const jsonStr = JSON.stringify(data, null, 2);
      // Menggunakan .txt agar mudah dibuka dan di-share di semua HP (Android/iOS)
      const filename = `antyofocus-backup-${new Date().toISOString().split('T')[0]}.txt`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on your device.');
        return;
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Export ANTYO Focus Data',
        UTI: 'public.plain-text'
      });
    } catch (err) {
      console.error('Export failed:', err);
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const headers = ['ID', 'Start Time', 'Duration (Minutes)', 'Focus Duration (Minutes)', 'Smart Mode', 'Notes'];
      const rows = sessions.map(s => {
        return [
          s.id,
          s.startTime,
          Math.round(s.durationSeconds / 60),
          s.focusDurationSeconds ? Math.round(s.focusDurationSeconds / 60) : 0,
          s.isSmartMode ? 'Yes' : 'No',
          `"${(s.notes || '').replace(/"/g, '""')}"` // Escape quotes for CSV
        ].join(',');
      });
      const csvStr = [headers.join(','), ...rows].join('\n');
      
      const filename = `antyofocus-sessions-${new Date().toISOString().split('T')[0]}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvStr, {
        encoding: FileSystem.EncodingType.UTF8
      });
      
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on your device.');
        return;
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Export ANTYO Focus Data (CSV)',
        UTI: 'public.comma-separated-values-text'
      });
    } catch (err) {
      console.error('CSV Export failed:', err);
      Alert.alert('Error', 'Failed to export CSV data.');
    }
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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top', 'bottom']}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <Feather name="x" size={20} color={isDark ? 'white' : 'black'} />
        </Pressable>
        <Text className="text-lg font-black text-gray-900 dark:text-white">Settings</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 60 }}>
        

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
                    onChangeText={(val) => formatTimeInput(val, setLocalSleepStart)}
                    keyboardType="numeric"
                    maxLength={5}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-gray-900 dark:text-white font-bold text-center"
                    placeholder="23:00"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Wake Up</Text>
                  <TextInput
                    value={localSleepEnd}
                    onChangeText={(val) => formatTimeInput(val, setLocalSleepEnd)}
                    keyboardType="numeric"
                    maxLength={5}
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
          
          <Pressable 
            onPress={() => setChangelogVisible(true)}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                <Feather name="info" size={16} color="#3B82F6" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Version Updates</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-bold text-gray-400">v{APP_VERSION}</Text>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </View>
          </Pressable>

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
          <Pressable 
            onPress={() => setExportExpanded(!exportExpanded)}
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 active:bg-gray-100 dark:active:bg-gray-800"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-orange-500/10 items-center justify-center">
                <Feather name="download" size={16} color="#F97316" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Export Data</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name={exportExpanded ? "chevron-up" : "chevron-down"} size={16} color="#9CA3AF" />
            </View>
          </Pressable>

          {exportExpanded && (
            <View className="bg-gray-50 dark:bg-gray-800/50">
              <SettingRow
                icon="file-text"
                iconBg="bg-gray-500/10"
                label="Backup Data (TXT)"
                onPress={handleExportData}
              />
              <SettingRow
                icon="grid"
                iconBg="bg-green-500/10"
                label="Export to Excel (CSV)"
                isLast
                onPress={handleExportCSV}
              />
            </View>
          )}
          <SettingRow
            icon="monitor"
            iconBg="bg-blue-500/10"
            label="Show Onboarding"
            onPress={() => router.replace('/onboarding' as any)}
          />
          <SettingRow
            icon="refresh-cw"
            iconBg="bg-purple-500/10"
            label="Reset Tutorials"
            onPress={() => {
              useAppStore.getState().resetTutorials();
              Alert.alert('Tutorials Reset', 'You will see the tutorials again when you navigate to the tabs.');
            }}
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
          <Text className="text-[10px] text-gray-400 font-bold">ANTYO Focus v{APP_VERSION}</Text>
          <Text className="text-[10px] text-gray-300 dark:text-gray-700 mt-1">Made with ❤️ by Antonius Prasetyo</Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ChangelogModal visible={changelogVisible} onClose={() => setChangelogVisible(false)} />
    </SafeAreaView>
  );
}

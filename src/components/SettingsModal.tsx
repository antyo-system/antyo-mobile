import { View, Text, Modal, Pressable, TextInput, Switch } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SmartModeToggle } from '@/components/timer/SmartModeToggle';

interface Props {
  visible: boolean;
  onClose: () => void;
  onViewPress?: () => void;
}

export function SettingsModal({ visible, onClose, onViewPress }: Props) {
  const settings = useSettingsStore();

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16 pb-8">
        <View className="flex-row items-center justify-between mb-8">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">Settings</Text>
          <Pressable onPress={onClose} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full active:opacity-70">
            <Text className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-none">✕</Text>
          </Pressable>
        </View>

        <Text className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Pomodoro Config</Text>
        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-gray-800">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-200">Default Focus (mins)</Text>
            <TextInput 
              value={settings.defaultFocusMinutes.toString()}
              onChangeText={(val) => settings.updateSettings({ defaultFocusMinutes: parseInt(val) || 25 })}
              keyboardType="number-pad"
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl w-20 text-center font-bold text-gray-900 dark:text-white"
            />
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-200">Default Break (mins)</Text>
            <TextInput 
              value={settings.defaultBreakMinutes.toString()}
              onChangeText={(val) => settings.updateSettings({ defaultBreakMinutes: parseInt(val) || 5 })}
              keyboardType="number-pad"
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl w-20 text-center font-bold text-gray-900 dark:text-white"
            />
          </View>
        </View>

        <Text className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Sleep Schedule</Text>
        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-gray-800">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-200">Sleep Start (HH:mm)</Text>
            <TextInput 
              value={settings.sleepStart}
              onChangeText={(val) => settings.updateSettings({ sleepStart: val })}
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl w-24 text-center font-bold text-gray-900 dark:text-white"
            />
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-200">Sleep End (HH:mm)</Text>
            <TextInput 
              value={settings.sleepEnd}
              onChangeText={(val) => settings.updateSettings({ sleepEnd: val })}
              className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-xl w-24 text-center font-bold text-gray-900 dark:text-white"
            />
          </View>
        </View>

        <Text className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">AI Features (Post-MVP)</Text>
        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-gray-800">
          <SmartModeToggle onViewPress={onViewPress || (() => {})} />
        </View>

        <Text className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Preferences</Text>
        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-8 border border-gray-100 dark:border-gray-800">
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-medium text-gray-700 dark:text-gray-200">Haptics & Vibration</Text>
            <Switch 
              value={settings.hapticsEnabled}
              onValueChange={(val) => settings.updateSettings({ hapticsEnabled: val })}
              trackColor={{ true: '#2563eb' }}
            />
          </View>
        </View>

      </View>
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function QuickSleepEditorModal({ visible, onClose }: Props) {
  const { sleepStart, sleepEnd, updateSettings } = useSettingsStore();
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');

  useEffect(() => {
    if (visible) {
      setStartInput(sleepStart);
      setEndInput(sleepEnd);
    }
  }, [visible, sleepStart, sleepEnd]);

  const handleTimeInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 3) {
      setter(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    } else {
      setter(cleaned);
    }
  };

  const handleSave = () => {
    // Basic validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startInput) || !timeRegex.test(endInput)) {
      // In a real app we'd show an error alert, but for MVP just close if invalid
      onClose();
      return;
    }
    updateSettings({ sleepStart: startInput, sleepEnd: endInput });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 bg-black/50 justify-center px-6">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-xl">🌙</Text>
              <Text className="text-xl font-black text-gray-900 dark:text-white">Quick Sleep Edit</Text>
            </View>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Update your sleep schedule quickly. This will reflect in your Profile settings.
            </Text>

            <View className="flex-row gap-4 mb-8">
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Sleep At</Text>
                <TextInput
                  value={startInput}
                  onChangeText={(val) => handleTimeInput(val, setStartInput)}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="23:00"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center shadow-sm"
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Wake Up</Text>
                <TextInput
                  value={endInput}
                  onChangeText={(val) => handleTimeInput(val, setEndInput)}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="06:00"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center shadow-sm"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <Pressable 
                onPress={onClose}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-600 dark:text-gray-300">Cancel</Text>
              </Pressable>
              <Pressable 
                onPress={handleSave}
                className="flex-1 py-4 bg-blue-600 rounded-xl items-center shadow-lg shadow-blue-500/30"
              >
                <Text className="font-bold text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

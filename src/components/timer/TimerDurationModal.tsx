import { useState } from 'react';
import { View, Text, Modal, Pressable, TextInput } from 'react-native';
import { useTimerStore } from '@/store/useTimerStore';
import * as Haptics from 'expo-haptics';

const PRESETS = [5, 10, 15, 25, 30, 45, 60, 90, 120];

export function TimerDurationModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const setDuration = useTimerStore(s => s.setDuration);
  const [customVal, setCustomVal] = useState('');

  const handleSelect = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDuration(minutes * 60);
    onClose();
  };

  const handleCustomSubmit = () => {
    const mins = parseInt(customVal);
    if (!isNaN(mins) && mins > 0) {
      handleSelect(mins);
      setCustomVal('');
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-white dark:bg-gray-950 px-6 pt-16 pb-8">
        <View className="flex-row items-center justify-between mb-12">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">Set Focus Duration</Text>
          <Pressable onPress={onClose} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full active:opacity-70">
            <Text className="text-gray-500 dark:text-gray-400 font-bold text-lg leading-none">✕</Text>
          </Pressable>
        </View>
        
        <View className="flex-row flex-wrap justify-center gap-4 mb-12">
          {PRESETS.map((mins) => (
            <Pressable 
              key={mins}
              onPress={() => handleSelect(mins)}
              className="bg-gray-50 dark:bg-gray-800 w-24 h-16 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 active:bg-gray-200"
            >
              <Text className="font-bold text-xl text-gray-900 dark:text-gray-100">{mins}m</Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row items-center gap-3 px-2">
          <TextInput 
            value={customVal}
            onChangeText={setCustomVal}
            placeholder="Custom minutes..."
            placeholderTextColor="#9ca3af"
            keyboardType="number-pad"
            onSubmitEditing={handleCustomSubmit}
            className="flex-1 bg-gray-100 dark:bg-gray-800 px-6 py-5 rounded-2xl text-gray-900 dark:text-gray-100 font-bold text-lg"
          />
          <Pressable 
            onPress={handleCustomSubmit}
            className="bg-blue-600 px-8 py-5 rounded-2xl active:opacity-80"
          >
            <Text className="text-white font-bold text-lg">Set Time</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

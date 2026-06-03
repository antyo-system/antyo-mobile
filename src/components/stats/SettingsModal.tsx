import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: Props) {
  const { sleepStart, sleepEnd, updateSettings } = useSettingsStore();
  const [localStart, setLocalStart] = useState(sleepStart);
  const [localEnd, setLocalEnd] = useState(sleepEnd);

  useEffect(() => {
    if (visible) {
      setLocalStart(sleepStart);
      setLocalEnd(sleepEnd);
    }
  }, [visible, sleepStart, sleepEnd]);

  const handleSave = () => {
    updateSettings({
      sleepStart: localStart,
      sleepEnd: localEnd
    });
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">Settings</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Text className="text-gray-500 font-bold px-2">X</Text>
            </Pressable>
          </View>

          <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Sleep Schedule</Text>
          
          <View className="flex-row gap-4 mb-8">
            <View className="flex-1">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Bedtime (HH:MM)</Text>
              <TextInput
                value={localStart}
                onChangeText={setLocalStart}
                keyboardType="numeric"
                className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Wake up (HH:MM)</Text>
              <TextInput
                value={localEnd}
                onChangeText={setLocalEnd}
                keyboardType="numeric"
                className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center"
              />
            </View>
          </View>

          <Pressable 
            onPress={handleSave}
            className="w-full bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-500/30"
          >
            <Text className="text-white font-black tracking-widest uppercase text-sm">Save Settings</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

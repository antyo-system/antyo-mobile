import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, useColorScheme } from 'react-native';
import { useTimerStore } from '@/store/useTimerStore';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';

const FOCUS_PRESETS = [15, 25, 30, 45, 60, 90, 120];
const BREAK_PRESETS = [5, 10, 15, 20, 30];

export function TimerDurationModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const { duration, breakDuration, setDuration, setBreakDuration } = useTimerStore(
    useShallow(s => ({
      duration: s.duration,
      breakDuration: s.breakDuration,
      setDuration: s.setDuration,
      setBreakDuration: s.setBreakDuration,
    }))
  );
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [focusInput, setFocusInput] = useState(String(duration / 60));
  const [breakInput, setBreakInput] = useState(String(breakDuration / 60));

  useEffect(() => {
    if (visible) {
      setFocusInput(String(duration / 60));
      setBreakInput(String(breakDuration / 60));
    }
  }, [visible, duration, breakDuration]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const focusMins = parseInt(focusInput, 10) || 25;
    const breakMins = parseInt(breakInput, 10) || 5;
    
    // Convert to seconds
    setDuration(focusMins * 60);
    setBreakDuration(breakMins * 60);
    
    onClose();
  };

  const handleFocusPreset = (mins: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFocusInput(String(mins));
  };

  const handleBreakPreset = (mins: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBreakInput(String(mins));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm z-10">
            <Text className="text-xl font-black text-gray-900 dark:text-white">Timer Settings</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-gray-800 active:opacity-70">
              <Feather name="x" size={20} color={isDark ? 'white' : 'black'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Focus Duration */}
            <View className="p-6 mt-4">
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Focus Duration</Text>
              
              <View className="flex-row items-end justify-center mb-8">
                <TextInput
                  value={focusInput}
                  onChangeText={(t) => setFocusInput(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  className="text-7xl font-black text-gray-900 dark:text-white text-center p-0 m-0"
                  style={{ minWidth: 100 }}
                  selectionColor={isDark ? '#3b82f6' : '#2563eb'}
                />
                <Text className="text-xl font-bold text-gray-400 dark:text-gray-500 mb-2 ml-1">mins</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 pb-2" contentContainerStyle={{ gap: 10, paddingRight: 48 }}>
                {FOCUS_PRESETS.map(mins => {
                  const isSelected = focusInput === String(mins);
                  return (
                    <Pressable
                      key={mins}
                      onPress={() => handleFocusPreset(mins)}
                      className={`px-5 py-3 rounded-2xl border-2 active:opacity-70 ${
                        isSelected 
                        ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500' 
                        : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                      }`}
                    >
                      <Text className={`font-black text-lg ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{mins} m</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="h-px bg-gray-200 dark:bg-gray-800 mx-6 my-4" />

            {/* Break Duration */}
            <View className="p-6">
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">Break Duration</Text>
              
              <View className="flex-row items-end justify-center mb-8">
                <TextInput
                  value={breakInput}
                  onChangeText={(t) => setBreakInput(t.replace(/[^0-9]/g, ''))}
                  keyboardType="number-pad"
                  maxLength={3}
                  className="text-6xl font-black text-gray-900 dark:text-white text-center p-0 m-0"
                  style={{ minWidth: 80 }}
                  selectionColor={isDark ? '#10b981' : '#059669'}
                />
                <Text className="text-lg font-bold text-gray-400 dark:text-gray-500 mb-2 ml-1">mins</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 pb-2" contentContainerStyle={{ gap: 10, paddingRight: 48 }}>
                {BREAK_PRESETS.map(mins => {
                  const isSelected = breakInput === String(mins);
                  return (
                    <Pressable
                      key={mins}
                      onPress={() => handleBreakPreset(mins)}
                      className={`px-5 py-3 rounded-2xl border-2 active:opacity-70 ${
                        isSelected 
                        ? 'bg-emerald-600 border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500' 
                        : 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                      }`}
                    >
                      <Text className={`font-black text-lg ${isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>{mins} m</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </ScrollView>

          {/* Sticky Save Button */}
          <View className="absolute bottom-0 left-0 right-0 p-6 bg-gray-50 dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900">
            <Pressable 
              onPress={handleSave}
              className="w-full bg-gray-900 dark:bg-white rounded-2xl py-5 items-center justify-center shadow-lg active:opacity-80"
            >
              <Text className="text-white dark:text-black font-black text-lg uppercase tracking-wider">Save Changes</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

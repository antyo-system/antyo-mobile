import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, useColorScheme, Switch } from 'react-native';
import { useTimerStore } from '@/store/useTimerStore';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';

export function TimerDurationModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const { duration, breakDuration, autoPlay, setDuration, setBreakDuration, setAutoPlay } = useTimerStore(
    useShallow(s => ({
      duration: s.duration,
      breakDuration: s.breakDuration,
      autoPlay: s.autoPlay,
      setDuration: s.setDuration,
      setBreakDuration: s.setBreakDuration,
      setAutoPlay: s.setAutoPlay,
    }))
  );
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [focusInput, setFocusInput] = useState(String(duration / 60));
  const [breakInput, setBreakInput] = useState(String(breakDuration / 60));
  const [autoPlayInput, setAutoPlayInput] = useState(autoPlay);

  useEffect(() => {
    if (visible) {
      setFocusInput(String(duration / 60));
      setBreakInput(String(breakDuration / 60));
      setAutoPlayInput(autoPlay);
    }
  }, [visible, duration, breakDuration, autoPlay]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const focusMins = parseInt(focusInput, 10) || 25;
    const breakMins = parseInt(breakInput, 10) || 5;
    
    // Convert to seconds
    setDuration(focusMins * 60);
    setBreakDuration(breakMins * 60);
    setAutoPlay(autoPlayInput);
    
    onClose();
  };

  const handleFocusChange = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = parseInt(focusInput, 10) || 0;
    const next = Math.max(1, Math.min(999, current + amount));
    setFocusInput(String(next));
  };

  const handleBreakChange = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = parseInt(breakInput, 10) || 0;
    const next = Math.max(1, Math.min(999, current + amount));
    setBreakInput(String(next));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/40">
          {/* Backdrop */}
          <Pressable className="absolute inset-0" onPress={onClose} />
          
          {/* Bottom Sheet Container */}
          <View className="bg-gray-50 dark:bg-gray-950 rounded-t-3xl overflow-hidden max-h-[95%] pt-2 shadow-2xl">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm z-10">
              <Text className="text-lg font-black text-gray-900 dark:text-white">Timer Settings</Text>
              <Pressable onPress={onClose} className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-gray-800 active:opacity-70">
                <Feather name="x" size={18} color={isDark ? 'white' : 'black'} />
              </Pressable>
            </View>

          <ScrollView bounces={false} className="bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
            {/* Focus Duration */}
            <View className="px-6 mb-5">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Focus Duration</Text>
              
              <View className="flex-row items-center justify-between bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-200 dark:border-gray-800 shadow-sm">
                <Pressable onPress={() => handleFocusChange(-5)} className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="minus" size={20} color={isDark ? 'white' : 'black'} />
                </Pressable>
                
                <View className="flex-1 items-center flex-row justify-center px-2">
                  <TextInput
                    value={focusInput}
                    onChangeText={(t) => setFocusInput(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                    className="text-4xl font-black text-gray-900 dark:text-white text-center p-0 m-0 tracking-tighter"
                    style={{ minWidth: 50 }}
                    selectionColor={isDark ? '#3b82f6' : '#2563eb'}
                  />
                  <Text className="text-base font-bold text-gray-400 dark:text-gray-500 ml-1">mins</Text>
                </View>

                <Pressable onPress={() => handleFocusChange(5)} className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="plus" size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
                </Pressable>
              </View>
            </View>

            {/* Break Duration */}
            <View className="px-6 mb-6">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">Break Duration</Text>
              
              <View className="flex-row items-center justify-between bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-200 dark:border-gray-800 shadow-sm">
                <Pressable onPress={() => handleBreakChange(-5)} className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="minus" size={20} color={isDark ? 'white' : 'black'} />
                </Pressable>
                
                <View className="flex-1 items-center flex-row justify-center px-2">
                  <TextInput
                    value={breakInput}
                    onChangeText={(t) => setBreakInput(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={3}
                    className="text-4xl font-black text-gray-900 dark:text-white text-center p-0 m-0 tracking-tighter"
                    style={{ minWidth: 50 }}
                    selectionColor={isDark ? '#10b981' : '#059669'}
                  />
                  <Text className="text-base font-bold text-gray-400 dark:text-gray-500 ml-1">mins</Text>
                </View>

                <Pressable onPress={() => handleBreakChange(5)} className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="plus" size={20} color={isDark ? '#34D399' : '#059669'} />
                </Pressable>
              </View>
            </View>

            <View className="h-px bg-gray-200 dark:bg-gray-800 mx-6 mb-4" />

            {/* Auto Play Setting */}
            <View className="px-6 py-2 flex-row items-center justify-between mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">Auto-Play Sessions</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  Automatically start breaks after focus sessions, and focus sessions after breaks.
                </Text>
              </View>
              <Switch
                value={autoPlayInput}
                onValueChange={(val) => {
                  Haptics.selectionAsync();
                  setAutoPlayInput(val);
                }}
                trackColor={{ false: isDark ? '#374151' : '#E5E7EB', true: '#3B82F6' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? '#374151' : '#E5E7EB'}
              />
            </View>

            {/* Save Button */}
            <View className="px-6 mt-2">
              <Pressable 
                onPress={handleSave}
                className="w-full bg-gray-900 dark:bg-white rounded-xl py-4 items-center justify-center shadow-md active:opacity-80"
              >
                <Text className="text-white dark:text-black font-black text-base uppercase tracking-wider">Save Changes</Text>
              </Pressable>
            </View>
          </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

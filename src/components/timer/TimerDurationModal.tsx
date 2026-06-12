import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Modal, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, useColorScheme, Switch } from 'react-native';
import { useTimerStore } from '@/store/useTimerStore';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '@/hooks/useTranslation';

export function TimerDurationModal({ visible, onClose }: { visible: boolean, onClose: () => void }) {
  const { t, language } = useTranslation();
  const { duration, breakDuration, autoPlay, cycleMode, totalCycles, setStandardMode, loadTargetSession, setAutoPlay } = useTimerStore(
    useShallow(s => ({
      duration: s.duration,
      breakDuration: s.breakDuration,
      autoPlay: s.autoPlay,
      cycleMode: s.cycleMode,
      totalCycles: s.totalCycles,
      setStandardMode: s.setStandardMode,
      loadTargetSession: s.loadTargetSession,
      setAutoPlay: s.setAutoPlay,
    }))
  );
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [focusInput, setFocusInput] = useState(String(duration / 60));
  const [breakInput, setBreakInput] = useState(String(breakDuration / 60));
  const [autoPlayInput, setAutoPlayInput] = useState(autoPlay);
  const [sessionsInput, setSessionsInput] = useState(cycleMode ? String(totalCycles) : "1");

  useEffect(() => {
    if (visible) {
      setFocusInput(String(duration / 60));
      setBreakInput(String(breakDuration / 60));
      setAutoPlayInput(autoPlay);
      setSessionsInput(cycleMode ? String(totalCycles) : "1");
    }
  }, [visible, duration, breakDuration, autoPlay, cycleMode, totalCycles]);

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const focusMins = parseInt(focusInput, 10) || 25;
    const breakMins = parseInt(breakInput, 10) || 5;
    const sessions = parseInt(sessionsInput, 10) || 1;
    
    if (sessions > 1) {
      const totalTargetMins = (focusMins + breakMins) * sessions;
      loadTargetSession(totalTargetMins * 60, focusMins * 60, breakMins * 60);
    } else {
      setStandardMode(focusMins * 60, breakMins * 60);
    }
    
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

  const handleSessionsChange = (amount: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = parseInt(sessionsInput, 10) || 1;
    const next = Math.max(1, Math.min(20, current + amount));
    setSessionsInput(String(next));
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
              <Text className="text-lg font-black text-gray-900 dark:text-white">{t('timerSettings.title')}</Text>
              <Pressable onPress={onClose} className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-gray-800 active:opacity-70">
                <Feather name="x" size={18} color={isDark ? 'white' : 'black'} />
              </Pressable>
            </View>

          <ScrollView bounces={false} className="bg-gray-50 dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 32, paddingTop: 16 }}>
            {/* Focus Duration */}
            <View className="px-6 mb-5">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{t('timerSettings.focusDuration')}</Text>
              
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
                  <Text className="text-base font-bold text-gray-400 dark:text-gray-500 ml-1">{t('timerSettings.mins')}</Text>
                </View>

                <Pressable onPress={() => handleFocusChange(5)} className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="plus" size={20} color={isDark ? '#60A5FA' : '#2563EB'} />
                </Pressable>
              </View>
            </View>

            {/* Break Duration */}
            <View className="px-6 mb-6">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{t('timerSettings.breakDuration')}</Text>
              
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
                  <Text className="text-base font-bold text-gray-400 dark:text-gray-500 ml-1">{t('timerSettings.mins')}</Text>
                </View>

                <Pressable onPress={() => handleBreakChange(5)} className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="plus" size={20} color={isDark ? '#34D399' : '#059669'} />
                </Pressable>
              </View>
            </View>

            {/* Number of Sessions */}
            <View className="px-6 mb-6">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">{language === 'id' ? 'Jumlah Sesi' : 'Number of Sessions'}</Text>
              
              <View className="flex-row items-center justify-between bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-200 dark:border-gray-800 shadow-sm">
                <Pressable onPress={() => handleSessionsChange(-1)} className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="minus" size={20} color={isDark ? 'white' : 'black'} />
                </Pressable>
                
                <View className="flex-1 items-center flex-row justify-center px-2">
                  <TextInput
                    value={sessionsInput}
                    onChangeText={(t) => setSessionsInput(t.replace(/[^0-9]/g, ''))}
                    keyboardType="number-pad"
                    maxLength={2}
                    className="text-4xl font-black text-gray-900 dark:text-white text-center p-0 m-0 tracking-tighter"
                    style={{ minWidth: 50 }}
                    selectionColor={isDark ? '#8b5cf6' : '#7c3aed'}
                  />
                  <Text className="text-base font-bold text-gray-400 dark:text-gray-500 ml-1">{language === 'id' ? 'Sesi' : 'Sessions'}</Text>
                </View>

                <Pressable onPress={() => handleSessionsChange(1)} className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl items-center justify-center active:opacity-70">
                  <Feather name="plus" size={20} color={isDark ? '#A78BFA' : '#7C3AED'} />
                </Pressable>
              </View>

              {/* Dynamic Helper Text */}
              <View className="mt-2 items-center">
                <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {language === 'id' 
                    ? `Total Fokus: ${(parseInt(focusInput, 10) || 0) * (parseInt(sessionsInput, 10) || 1)} Menit`
                    : `Total Focus: ${(parseInt(focusInput, 10) || 0) * (parseInt(sessionsInput, 10) || 1)} Mins`}
                </Text>
              </View>
            </View>

            <View className="h-px bg-gray-200 dark:bg-gray-800 mx-6 mb-4" />

            {/* Auto Play Setting */}
            <View className="px-6 py-2 flex-row items-center justify-between mb-6">
              <View className="flex-1 pr-4">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">{t('timerSettings.autoPlay')}</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {t('timerSettings.autoPlayDesc')}
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
                <Text className="text-white dark:text-black font-black text-base uppercase tracking-wider">{t('timerSettings.saveChanges')}</Text>
              </Pressable>
            </View>
          </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

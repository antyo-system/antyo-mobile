import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTimerStore } from '@/store/useTimerStore';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { SmartModeToggle } from './timer/SmartModeToggle';

export type SettingsBottomSheetRef = BottomSheet;

interface Props {
  onViewPress?: () => void;
}

export const SettingsBottomSheet = forwardRef<SettingsBottomSheetRef, Props>(
  ({ onViewPress }, ref) => {
    const settings = useSettingsStore();
    const mode = useTimerStore(s => s.mode);
    const setMode = useTimerStore(s => s.setMode);
    const colorScheme = useColorScheme();
    
    // variables
    const snapPoints = useMemo(() => ['45%'], []);

    // callbacks
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
        />
      ),
      []
    );

    const isDark = colorScheme === 'dark';

    return (
      <BottomSheet
        ref={ref}
        index={-1} // Closed by default
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: isDark ? '#030712' : '#ffffff',
          borderRadius: 24,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? '#374151' : '#d1d5db',
          width: 40,
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <Text className="text-2xl font-black text-gray-900 dark:text-white mb-6">Settings</Text>

          {/* Mode Segmented Control */}
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Timer Mode</Text>
          <View className="flex-row bg-gray-100 dark:bg-gray-900 p-1 rounded-full mb-8">
            <Text 
              onPress={() => setMode('timer')}
              className={`flex-1 text-center py-2.5 rounded-full font-bold text-sm overflow-hidden ${mode === 'timer' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              Pomodoro
            </Text>
            <Text 
              onPress={() => setMode('stopwatch')}
              className={`flex-1 text-center py-2.5 rounded-full font-bold text-sm overflow-hidden ${mode === 'stopwatch' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500'}`}
            >
              Stopwatch
            </Text>
          </View>

          {/* Smart Tracking */}
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Smart Features</Text>
          <View className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-4 mb-8 border border-gray-100 dark:border-gray-800">
            <SmartModeToggle onViewPress={onViewPress || (() => {})} />
          </View>

          {/* Preferences */}
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Preferences</Text>
          <View className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-4 border border-gray-100 dark:border-gray-800 flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-blue-500/10 items-center justify-center">
                <Feather name="smartphone" size={16} className="text-blue-500" />
              </View>
              <Text className="text-base font-semibold text-gray-900 dark:text-white">Haptics & Vibration</Text>
            </View>
            <Switch 
              value={settings.hapticsEnabled}
              onValueChange={(val) => settings.updateSettings({ hapticsEnabled: val })}
              trackColor={{ true: '#10b981' }}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});

import { useState, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTimerStore } from '@/store/useTimerStore';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { TimerTitleInput } from '@/components/timer/TimerTitleInput';
import { TimerModeToggle } from '@/components/timer/TimerModeToggle';
import { SettingsModal } from '@/components/SettingsModal';
import { CircularTimer } from '@/components/timer/CircularTimer';
import { SmartModeCounters } from '@/components/timer/SmartModeCounters';
import { CameraViewModal } from '@/components/timer/CameraViewModal';
import { useShallow } from 'zustand/react/shallow';

export default function TimerScreen() {
  const { status, tick, isSmartMode } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      tick: s.tick,
      isSmartMode: s.isSmartMode,
    }))
  );
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'running') {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <View className="flex-1 pt-12 pb-8 px-6" pointerEvents="box-none">
        
        {/* Top: Space reserved for upcoming features + Toggles */}
        <View className="items-center justify-start z-10 pt-2 w-full">
          <TimerModeToggle onSettingsPress={() => setSettingsVisible(true)} />
          
          {isSmartMode && (
            <Pressable 
              onPress={() => setCameraVisible(true)}
              className="mt-6 flex-row items-center gap-2 active:opacity-60 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-2 rounded-full"
            >
              <Text className="text-sm">📹</Text>
              <Text className="text-gray-700 dark:text-gray-300 font-bold text-xs uppercase tracking-wider">View Camera</Text>
            </Pressable>
          )}
        </View>

        {/* Middle: Circular Timer (Shifted lower) */}
        <View className="flex-1 items-center justify-center z-0 mt-4" pointerEvents="box-none">
          <CircularTimer>
            <View className="items-center justify-center -mt-2">
              {(!isSmartMode || status === 'idle') && <TimerTitleInput />}
              
              <View className="mt-1">
                <TimerDisplay />
              </View>

              <SmartModeCounters />
              
              {(isSmartMode && status === 'running') && (
                <View className="mt-6 w-full opacity-60">
                  <TimerTitleInput />
                </View>
              )}
            </View>
          </CircularTimer>
        </View>

        {/* Bottom 1/3: Controls */}
        <View className="items-center justify-center h-[20%] z-10 mb-20">
          <TimerControls />
        </View>
        
      </View>
      <SettingsModal 
        visible={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
        onViewPress={() => {
          setSettingsVisible(false); // Close settings first
          setCameraVisible(true);
        }}
      />
      <CameraViewModal visible={cameraVisible} onClose={() => setCameraVisible(false)} />
    </SafeAreaView>
  );
}

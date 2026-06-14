import { View, Text } from 'react-native';
import { useTimerStore } from '@/store/useTimerStore';
import { formatTime } from '@/utils/time';
import { useShallow } from 'zustand/react/shallow';

export function SmartModeTracker() {
  const { focusTimeElapsed, distractedTimeElapsed, isSmartMode, isCurrentlyDistracted, status } = useTimerStore(
    useShallow((s) => ({
      focusTimeElapsed: s.focusTimeElapsed,
      distractedTimeElapsed: s.distractedTimeElapsed,
      isSmartMode: s.isSmartMode,
      isCurrentlyDistracted: s.isCurrentlyDistracted,
      status: s.status,
    }))
  );

  if (!isSmartMode) return null;

  const isRunning = status === 'running';
  const isFocusingNow = isRunning && !isCurrentlyDistracted;
  const isDistractedNow = isRunning && isCurrentlyDistracted;

  return (
    <View className="flex-row items-center justify-center mt-6">
      <View className="items-center px-6">
        <Text className={`font-medium text-sm mb-1 ${isFocusingNow ? 'text-green-600 dark:text-green-500' : 'text-gray-400 dark:text-gray-500'}`}>
          Focused
        </Text>
        <Text className={`font-bold text-3xl ${isFocusingNow ? 'text-green-600 dark:text-green-500' : 'text-slate-300 dark:text-slate-500'}`}>
          {formatTime(focusTimeElapsed)}
        </Text>
      </View>
      
      <View className="w-[1px] h-10 bg-gray-200 dark:bg-gray-800" />
      
      <View className="items-center px-6">
        <Text className={`font-medium text-sm mb-1 ${isDistractedNow ? 'text-red-600 dark:text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
          Distracted
        </Text>
        <Text className={`font-bold text-3xl ${isDistractedNow ? 'text-red-600 dark:text-red-500' : 'text-slate-300 dark:text-slate-500'}`}>
          {formatTime(distractedTimeElapsed)}
        </Text>
      </View>
    </View>
  );
}

import { View, Text } from 'react-native';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';
import { formatTime } from '@/utils/time';

export function SmartModeCounters() {
  const { isSmartMode, status, mode, timeLeft, duration, timeElapsed, distractedTime, isDistracted } = useTimerStore(
    useShallow((s) => ({
      isSmartMode: s.isSmartMode,
      status: s.status,
      mode: s.mode,
      timeLeft: s.timeLeft,
      duration: s.duration,
      timeElapsed: s.timeElapsed,
      distractedTime: s.distractedTime,
      isDistracted: s.isDistracted,
    }))
  );

  if (!isSmartMode || status !== 'running') return null;

  // Calculate actual focus time
  let focusSeconds = 0;
  if (mode === 'timer') {
    focusSeconds = duration - timeLeft; // Total elapsed - wait, if timer is paused by distraction?
    // Actually, timeElapsed in timer mode isn't tracked properly for focus vs distracted directly unless we use distractedTime.
    // The tick logic: if distracted, distractedTime++. Else, timeLeft--.
    // So focus time is (duration - timeLeft).
    focusSeconds = duration - timeLeft;
  } else {
    // Stopwatch
    focusSeconds = timeElapsed;
  }

  const focusedStyle = !isDistracted ? 'opacity-100' : 'opacity-40';
  const distractedStyle = isDistracted ? 'opacity-100' : 'opacity-40';

  return (
    <View className="flex-row items-center justify-center w-full mt-4 px-4">
      {/* Focus Column */}
      <View className={`flex-1 items-end pr-6 ${focusedStyle}`}>
        <Text className="text-green-500 font-medium text-xs uppercase tracking-wider mb-1">Focused</Text>
        <Text className="text-green-600 dark:text-green-500 font-black text-2xl tracking-tighter">
          {formatTime(focusSeconds)}
        </Text>
      </View>

      {/* Divider */}
      <View className="w-[1px] h-10 bg-gray-200 dark:bg-gray-700" />

      {/* Distracted Column */}
      <View className={`flex-1 items-start pl-6 ${distractedStyle}`}>
        <Text className="text-red-500 font-medium text-xs uppercase tracking-wider mb-1">Distraction</Text>
        <Text className="text-red-600 dark:text-red-500 font-black text-2xl tracking-tighter">
          {formatTime(distractedTime)}
        </Text>
      </View>
    </View>
  );
}

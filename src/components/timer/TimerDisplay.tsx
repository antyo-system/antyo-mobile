import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTimerStore } from '@/store/useTimerStore';
import { formatTime } from '@/utils/time';
import { TimerDurationModal } from './TimerDurationModal';

export function TimerDisplay({ onOpenModal }: { onOpenModal?: () => void }) {
  const { mode, timeLeft, timeElapsed, status, sessionType } = useTimerStore(
    useShallow((s) => ({
      mode: s.mode,
      timeLeft: s.timeLeft,
      timeElapsed: s.timeElapsed,
      status: s.status,
      sessionType: s.sessionType,
    }))
  );

  const displayTime = mode === 'timer' ? timeLeft : timeElapsed;

  return (
    <View className="items-center justify-center w-full">
      {sessionType === 'break' && (
        <View className="bg-emerald-100 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full mb-4">
          <Text className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs">
            ☕ Break Time
          </Text>
        </View>
      )}
      <Pressable 
        onPress={() => { if (status === 'idle' && mode === 'timer' && onOpenModal) onOpenModal() }}
        className="items-center justify-center py-2 w-full active:opacity-70"
      >
        <Text className={`text-[84px] font-bold tracking-tighter tabular-nums text-center leading-none ${
          sessionType === 'break' 
            ? 'text-emerald-500 dark:text-emerald-400' 
            : 'text-gray-900 dark:text-gray-100'
        }`}>
          {formatTime(displayTime)}
        </Text>
      </Pressable>
    </View>
  );
}

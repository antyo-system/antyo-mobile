import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTimerStore } from '@/store/useTimerStore';
import { formatTime } from '@/utils/time';
import { TimerDurationModal } from './TimerDurationModal';

export function TimerDisplay() {
  const { mode, timeLeft, timeElapsed, status } = useTimerStore(
    useShallow((s) => ({
      mode: s.mode,
      timeLeft: s.timeLeft,
      timeElapsed: s.timeElapsed,
      status: s.status,
    }))
  );

  const displayTime = mode === 'timer' ? timeLeft : timeElapsed;
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable 
        onPress={() => { if (status === 'idle' && mode === 'timer') setModalVisible(true) }}
        className="items-center justify-center py-2 w-full active:opacity-70"
      >
        <Text className="text-[84px] font-bold text-gray-900 dark:text-gray-100 tracking-tighter tabular-nums text-center leading-none">
          {formatTime(displayTime)}
        </Text>
      </Pressable>
      <TimerDurationModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
}

import { View, Text, Pressable } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTimerStore } from '@/store/useTimerStore';
import * as Haptics from 'expo-haptics';

export function TimerModeToggle({ onSettingsPress }: { onSettingsPress: () => void }) {
  const { mode, setMode, status } = useTimerStore(
    useShallow((s) => ({
      mode: s.mode,
      setMode: s.setMode,
      status: s.status,
    }))
  );

  if (status !== 'idle') return null;

  const handlePress = (newMode: 'timer' | 'stopwatch') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(newMode);
  };

  return (
    <View className="flex-row items-center justify-center w-full gap-8 mt-2">
      <Pressable
        onPress={() => handlePress('timer')}
        className="active:opacity-60 py-2"
      >
        <Text className={`font-black text-xs tracking-[0.2em] uppercase ${mode === 'timer' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
          Timer
        </Text>
      </Pressable>
      
      <Pressable 
        onPress={onSettingsPress}
        className="items-center justify-center active:opacity-60"
      >
        <Text className="text-xl">⚙️</Text>
      </Pressable>

      <Pressable
        onPress={() => handlePress('stopwatch')}
        className="active:opacity-60 py-2"
      >
        <Text className={`font-black text-xs tracking-[0.2em] uppercase ${mode === 'stopwatch' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`}>
          Stopwatch
        </Text>
      </Pressable>
    </View>
  );
}

import { TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTimerStore } from '@/store/useTimerStore';

export function TimerTitleInput() {
  const { currentTitle, setTitle, status } = useTimerStore(
    useShallow((s) => ({
      currentTitle: s.currentTitle,
      setTitle: s.setTitle,
      status: s.status,
    }))
  );

  return (
    <View className="w-[90%] items-center justify-center">
      <TextInput
        value={currentTitle}
        onChangeText={setTitle}
        editable={status === 'idle'}
        placeholder="FOCUS"
        placeholderTextColor="#9CA3AF" // Tailwind gray-400
        className="w-full text-center text-sm font-bold tracking-wider text-gray-500 dark:text-gray-400 uppercase py-2"
        maxLength={30}
      />
    </View>
  );
}

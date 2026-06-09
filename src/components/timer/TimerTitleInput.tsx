import { TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useTimerStore } from '@/store/useTimerStore';
import { useTranslation } from '@/hooks/useTranslation';

export function TimerTitleInput() {
  const { t } = useTranslation();
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
        placeholder={t('timer.focus')}
        placeholderTextColor="#9CA3AF" // Tailwind gray-400
        className="w-full text-center text-base font-black tracking-wider text-black dark:text-white uppercase py-2"
        maxLength={30}
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="characters"
      />
    </View>
  );
}

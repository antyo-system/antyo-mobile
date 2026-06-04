import { View, Text, Pressable } from 'react-native';

interface Props {
  startMinutes: number;
  durationMinutes: number;
  pixelsPerMinute: number;
  onPress?: () => void;
}

export function SleepBlock({ startMinutes, durationMinutes, pixelsPerMinute, onPress }: Props) {
  const top = startMinutes * pixelsPerMinute;
  const height = durationMinutes * pixelsPerMinute;

  return (
    <Pressable 
      onPress={onPress}
      className="absolute left-16 right-4 bg-gray-100 dark:bg-gray-900/60 border-l-4 border-gray-200 dark:border-gray-800 rounded-md px-3 py-2 z-0"
      style={{ top, height }}
    >
      <View className="flex-row items-center gap-2 opacity-50">
        <Text className="text-sm">🌙</Text>
        <Text className="text-[10px] font-black tracking-widest uppercase text-gray-500 dark:text-gray-400">Sleep Time</Text>
      </View>
    </Pressable>
  );
}

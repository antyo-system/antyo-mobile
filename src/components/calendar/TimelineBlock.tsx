import { View, Text, Pressable } from 'react-native';

interface Props {
  title: string;
  startMinutes: number;
  durationMinutes: number;
  pixelsPerMinute: number;
  type: 'plan' | 'real';
  onPress?: () => void;
}

export function TimelineBlock({ title, startMinutes, durationMinutes, pixelsPerMinute, type, onPress }: Props) {
  const top = startMinutes * pixelsPerMinute;
  const height = durationMinutes * pixelsPerMinute;
  const isReal = type === 'real';

  const Container = onPress ? Pressable : (View as any);

  return (
    <Container 
      onPress={onPress}
      className={`absolute w-[40%] rounded-md px-2 py-1.5 border-l-4 shadow-sm z-10
        ${isReal 
          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-600 right-4' 
          : 'bg-yellow-50 dark:bg-yellow-900/40 border-yellow-400 left-16'
        }
      `}
      style={{ top, height: Math.max(height, 24) }}
    >
      <Text className={`text-xs font-bold ${isReal ? 'text-blue-900 dark:text-blue-100' : 'text-yellow-900 dark:text-yellow-100'}`} numberOfLines={1}>
        {title}
      </Text>
      {height > 30 && (
        <Text className={`text-[10px] font-medium mt-0.5 ${isReal ? 'text-blue-800 dark:text-blue-200' : 'text-yellow-800 dark:text-yellow-200'}`}>
          {durationMinutes} min
        </Text>
      )}
    </Container>
  );
}

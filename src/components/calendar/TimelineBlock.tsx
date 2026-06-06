import { View, Text, Pressable } from 'react-native';

interface Props {
  title: string;
  startMinutes: number;
  durationMinutes: number;
  pixelsPerMinute: number;
  type: 'plan' | 'real';
  skillIcon?: string;
  color?: string;
  onPress?: () => void;
}

import { Feather } from '@expo/vector-icons';

export function TimelineBlock({ title, startMinutes, durationMinutes, pixelsPerMinute, type, skillIcon, color, onPress }: Props) {
  const top = startMinutes * pixelsPerMinute;
  const height = durationMinutes * pixelsPerMinute;
  const isReal = type === 'real';
  
  const blockColor = color || (isReal ? '#2563EB' : '#FBBF24');

  const Container = onPress ? Pressable : (View as any);

  return (
    <Container 
      onPress={onPress}
      className="absolute rounded-md px-2 py-1.5 border-l-4 shadow-sm z-10 bg-white dark:bg-gray-900"
      style={{ 
        top, 
        height: Math.max(height, 24),
        width: '100%',
        borderLeftColor: blockColor,
        backgroundColor: `${blockColor}20`
      }}
    >
      <View className="flex-row justify-between items-start">
        <Text className="text-xs font-bold flex-1 dark:text-gray-100" style={{ color: blockColor }} numberOfLines={1}>
          {title}
        </Text>
        {skillIcon && isReal && (
          <View className="bg-white/40 dark:bg-black/20 rounded-full p-0.5 ml-1">
            <Feather name={skillIcon as any} size={10} color={blockColor} />
          </View>
        )}
      </View>
      {height > 30 && (
        <Text className="text-[10px] opacity-80 mt-0.5 font-medium" style={{ color: blockColor }}>
          {durationMinutes} min
        </Text>
      )}
    </Container>
  );
}

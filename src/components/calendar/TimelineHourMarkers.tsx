import { View, Text } from 'react-native';

const HOURS = Array.from({ length: 25 }, (_, i) => i);

export function TimelineHourMarkers({ pixelsPerMinute }: { pixelsPerMinute: number }) {
  return (
    <View className="absolute inset-0">
      {HOURS.map((hour) => (
        <View 
          key={hour} 
          className="w-full flex-row items-start absolute"
          style={{ top: hour * 60 * pixelsPerMinute }}
        >
          <Text className="w-14 text-right text-[10px] text-gray-400 font-medium mt-[-7px] pr-2">
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </Text>
          <View className="flex-1 h-[1px] bg-gray-200 dark:bg-gray-800" />
        </View>
      ))}
    </View>
  );
}

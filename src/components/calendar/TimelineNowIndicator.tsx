import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { getMinutesFromMidnight } from '@/utils/time';

export function TimelineNowIndicator({ pixelsPerMinute }: { pixelsPerMinute: number }) {
  const [minutes, setMinutes] = useState(getMinutesFromMidnight(new Date().toISOString()));

  useEffect(() => {
    // Update the line position every 60 seconds
    const interval = setInterval(() => {
      setMinutes(getMinutesFromMidnight(new Date().toISOString()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const top = minutes * pixelsPerMinute;

  return (
    <View 
      className="absolute w-full flex-row items-center z-50 left-0"
      style={{ top: top - 4 }} // Offset by half the dot size to perfectly center on the time
    >
      <View className="w-2 h-2 rounded-full bg-red-500 ml-12" />
      <View className="flex-1 h-[1px] bg-red-500" />
    </View>
  );
}

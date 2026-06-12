import React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { format, isToday } from 'date-fns';

interface TimelineDateMarkersProps {
  days: Date[];
  pixelsPerDay: number;
}

export const TimelineDateMarkers = React.memo(({ days, pixelsPerDay }: TimelineDateMarkersProps) => {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View className="absolute top-0 bottom-0 left-0 w-16 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950/50">
      {days.map((day, i) => {
        const top = i * pixelsPerDay;
        const today = isToday(day);
        
        return (
          <View 
            key={day.toISOString()} 
            style={{ position: 'absolute', top, width: '100%', height: pixelsPerDay }}
            className="items-center pt-2 border-b border-gray-100 dark:border-gray-800"
          >
            <Text className={`text-[10px] font-bold ${today ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`}>
              {format(day, 'MMM')}
            </Text>
            <Text className={`text-sm font-black ${today ? 'text-red-500' : 'text-gray-900 dark:text-gray-300'}`}>
              {format(day, 'd')}
            </Text>
            <Text className={`text-[9px] font-bold uppercase tracking-widest ${today ? 'text-red-400' : 'text-gray-400 dark:text-gray-600'} mt-0.5`}>
              {format(day, 'EEE')}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

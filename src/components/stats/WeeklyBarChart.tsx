import { View, Text } from 'react-native';
import { useMemo } from 'react';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';
import { Session } from '@/types';

interface Props {
  sessions: Session[];
}

export function WeeklyBarChart({ sessions }: Props) {
  // Generate the last 7 days (including today)
  const daysData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];
    
    // Create an array of the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      
      // Calculate total duration for this day
      const dailySessions = sessions.filter(s => isSameDay(new Date(s.startTime), date));
      const totalSeconds = dailySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      const totalHours = totalSeconds / 3600;
      
      days.push({
        date,
        dayLabel: format(date, 'EEE'), // Mon, Tue, etc.
        totalHours,
        isToday: i === 0,
      });
    }
    
    return days;
  }, [sessions]);

  // Find the maximum hours to scale the bars relative to the highest day
  const maxHours = Math.max(...daysData.map(d => d.totalHours), 1); // minimum scale is 1 hour

  return (
    <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-gray-900 dark:text-white font-black text-xl tracking-tight">Weekly Focus</Text>
        <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400">Past 7 Days</Text>
      </View>

      <View className="flex-row items-end justify-between h-40">
        {daysData.map((day, index) => {
          // Calculate height percentage (max 100%)
          const heightPercent = Math.max((day.totalHours / maxHours) * 100, 2); // 2% minimum height for visibility
          
          return (
            <View key={index} className="items-center flex-1">
              {/* Tooltip text showing hours if > 0 */}
              <View className="h-6 justify-end mb-1">
                {day.totalHours > 0 && (
                  <Text className="text-[9px] font-bold text-gray-400">
                    {day.totalHours < 1 ? '<1h' : `${Math.round(day.totalHours)}h`}
                  </Text>
                )}
              </View>
              
              {/* The Bar */}
              <View className="w-full h-full justify-end items-center px-1">
                <View 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg ${
                    day.isToday 
                      ? 'bg-blue-500 shadow-sm shadow-blue-500/30' 
                      : day.totalHours > 0 
                        ? 'bg-blue-200 dark:bg-blue-900/50' 
                        : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                />
              </View>
              
              {/* Day Label */}
              <Text className={`text-[10px] font-bold mt-2 ${
                day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
              }`}>
                {day.dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

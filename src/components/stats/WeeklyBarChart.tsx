import { View, Text, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';
import { Session } from '@/types';
import { formatLongTime } from '@/utils/time';

interface Props {
  sessions: Session[];
}

export function WeeklyBarChart({ sessions }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

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
        dayLabel: i === 0 ? 'Today' : format(date, 'EEE'), // Mon, Tue, etc.
        totalHours,
        totalSeconds,
        sessionCount: dailySessions.length,
        isToday: i === 0,
      });
    }
    
    return days;
  }, [sessions]);

  // Find the maximum hours to scale the bars relative to the highest day
  const maxHours = Math.max(...daysData.map(d => d.totalHours), 1); // minimum scale is 1 hour

  const selectedDay = selectedIndex !== null ? daysData[selectedIndex] : null;
  const headerTitle = selectedDay ? selectedDay.dayLabel : 'This Week';
  const headerSubtitle = selectedDay ? format(selectedDay.date, 'MMM d, yyyy') : 'Past 7 Days';
  const headerValue = selectedDay 
    ? selectedDay.totalSeconds 
    : daysData.reduce((acc, curr) => acc + curr.totalSeconds, 0);
  const sessionCount = selectedDay 
    ? selectedDay.sessionCount 
    : daysData.reduce((acc, curr) => acc + curr.sessionCount, 0);

  return (
    <Pressable 
      onPress={() => setSelectedIndex(null)} 
      className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6"
    >
      <View className="flex-row items-start justify-between mb-8">
        <View>
          <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{headerTitle}</Text>
          <Text className="text-3xl font-black tabular-nums text-blue-600 dark:text-blue-400">
            {formatLongTime(headerValue)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[10px] font-bold text-gray-400">{headerSubtitle}</Text>
          <Text className="text-xs text-gray-500 font-medium mt-1">{sessionCount} sessions</Text>
        </View>
      </View>

      <View className="flex-row items-end justify-between h-40">
        {daysData.map((day, index) => {
          // Calculate height percentage (max 100%)
          const heightPercent = Math.max((day.totalHours / maxHours) * 100, 2); // 2% minimum height for visibility
          
          return (
            <Pressable 
              key={index} 
              onPress={(e) => {
                e.stopPropagation();
                setSelectedIndex(index);
              }}
              className="items-center flex-1"
            >
              {/* Tooltip text showing hours if > 0 */}
              <View className="h-6 justify-end mb-1">
                {day.totalHours > 0 && (
                  <Text className={`text-[9px] font-bold ${
                    selectedIndex === index ? 'text-blue-500' : 'text-gray-400'
                  }`}>
                    {day.totalHours < 1 ? '<1h' : `${Math.round(day.totalHours)}h`}
                  </Text>
                )}
              </View>
              
              {/* The Bar */}
              <View className="w-full h-full justify-end items-center px-1">
                <View 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-lg ${
                    selectedIndex === index
                      ? 'bg-blue-600 shadow-md shadow-blue-500/40'
                      : day.isToday 
                        ? 'bg-blue-500 shadow-sm shadow-blue-500/30' 
                        : day.totalHours > 0 
                          ? 'bg-blue-200 dark:bg-blue-900/50' 
                          : 'bg-gray-100 dark:bg-gray-800'
                  } ${
                    selectedIndex !== null && selectedIndex !== index && day.totalHours > 0
                      ? 'opacity-50' // Dim other bars when one is selected
                      : ''
                  }`}
                />
              </View>
              
              {/* Day Label */}
              <Text className={`text-[10px] font-bold mt-2 ${
                selectedIndex === index
                  ? 'text-blue-600 dark:text-blue-400'
                  : day.isToday 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400'
              }`}>
                {format(day.date, 'EEE')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

import { View, Text, Pressable } from 'react-native';
import { useMemo, useState } from 'react';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';
import { Session } from '@/types';
import { formatLongTime, formatDate } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  sessions: Session[];
  daysCount: number; // 7 for week, 30 for month
}

export function WeeklyBarChart({ sessions, daysCount }: Props) {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const daysData = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = subDays(today, i);
      
      const dailySessions = sessions.filter(s => isSameDay(new Date(s.startTime), date));
      const totalSeconds = dailySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      const totalHours = totalSeconds / 3600;
      
      // Determine label format based on days count
      let dayLabel = formatDate(date, 'd'); // Just the date number for month view
      if (daysCount <= 7) {
        dayLabel = formatDate(date, 'EEE'); // Mon, Tue for week view
      }

      days.push({
        date,
        dayLabel: i === 0 && daysCount <= 7 ? t('calendarComp.today') : dayLabel,
        totalHours,
        totalSeconds,
        sessionCount: dailySessions.length,
        isToday: i === 0,
      });
    }
    
    return days;
  }, [sessions, daysCount, t]);

  const maxHours = Math.max(...daysData.map(d => d.totalHours), 1);

  const selectedDay = selectedIndex !== null ? daysData[selectedIndex] : null;
  const headerTitle = selectedDay ? formatDate(selectedDay.date, 'EEEE') : (daysCount <= 7 ? t('statsComp.thisWeek') : t('stats.month'));
  const headerSubtitle = selectedDay ? formatDate(selectedDay.date, 'MMM d, yyyy') : (daysCount <= 7 ? t('statsComp.past7Days') : `Past ${daysCount} Days`);
  const headerValue = selectedDay 
    ? selectedDay.totalSeconds 
    : daysData.reduce((acc, curr) => acc + curr.totalSeconds, 0);
  const sessionCount = selectedDay 
    ? selectedDay.sessionCount 
    : daysData.reduce((acc, curr) => acc + curr.sessionCount, 0);

  // If showing many days, bars are thin and text under them is hidden or sparse
  const isCompact = daysCount > 7;

  return (
    <Pressable 
      onPress={() => setSelectedIndex(null)} 
      className="mb-6"
    >
      <View className="flex-row items-start justify-between mb-8">
        <View>
          <Text className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            {selectedDay ? headerTitle : ' '}
          </Text>
          <Text className="text-3xl font-black tabular-nums text-blue-600 dark:text-blue-400">
            {formatLongTime(headerValue)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-[10px] font-bold text-gray-400">{headerSubtitle}</Text>
          <Text className="text-xs text-gray-500 font-medium mt-1">{sessionCount} {t('statsComp.sessionsCompleted')}</Text>
        </View>
      </View>

      <View className="flex-row items-end justify-between h-40">
        {daysData.map((day, index) => {
          const heightPercent = Math.max((day.totalHours / maxHours) * 100, 2);
          
          return (
            <Pressable 
              key={index} 
              onPress={(e) => {
                e.stopPropagation();
                setSelectedIndex(index);
              }}
              className="items-center flex-1"
            >
              <View className="h-6 justify-end mb-1">
                {day.totalHours > 0 && !isCompact && (
                  <Text className={`text-[9px] font-bold ${
                    selectedIndex === index ? 'text-blue-500' : 'text-gray-400'
                  }`} numberOfLines={1} adjustsFontSizeToFit>
                    {day.totalHours < 1 ? '<1h' : `${Math.round(day.totalHours)}h`}
                  </Text>
                )}
                {/* For compact view, only show value if selected */}
                {day.totalHours > 0 && isCompact && selectedIndex === index && (
                  <Text className="text-[9px] font-bold text-blue-500" numberOfLines={1} adjustsFontSizeToFit>
                    {day.totalHours < 1 ? '<1h' : `${Math.round(day.totalHours)}h`}
                  </Text>
                )}
              </View>
              
              <View className={`w-full flex-1 justify-end items-center ${isCompact ? 'px-[0.5px]' : 'px-1'}`}>
                <View 
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t-sm ${
                    selectedIndex === index
                      ? 'bg-blue-600 shadow-md shadow-blue-500/40'
                      : day.isToday 
                        ? 'bg-blue-500 shadow-sm shadow-blue-500/30' 
                        : day.totalHours > 0 
                          ? 'bg-blue-200 dark:bg-blue-900/50' 
                          : 'bg-gray-100 dark:bg-gray-800'
                  } ${
                    selectedIndex !== null && selectedIndex !== index && day.totalHours > 0
                      ? 'opacity-50'
                      : ''
                  }`}
                />
              </View>
              
              {/* Labels below bars */}
              {!isCompact ? (
                <Text className={`text-[10px] font-bold mt-2 ${
                  selectedIndex === index || day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                }`}>
                  {day.dayLabel}
                </Text>
              ) : (
                // In compact mode, only show labels for first, middle, last, or selected
                <View className="h-4 justify-center mt-1">
                  {(index === 0 || index === daysCount - 1 || index % 7 === 0 || selectedIndex === index) && (
                    <Text className={`text-[8px] font-bold ${
                      selectedIndex === index || day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                    }`}>
                      {day.dayLabel}
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

import { View, Text, ScrollView } from 'react-native';
import { useMemo, useRef, useEffect } from 'react';
import { subDays, format, isSameDay, startOfDay } from 'date-fns';
import { Session } from '@/types';
import { formatLongTime } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  sessions: Session[];
}

export function ContributionHeatmap({ sessions }: Props) {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate the last 15 weeks of data (105 days)
  const WEEKS_TO_SHOW = 15;
  const DAYS_TO_SHOW = WEEKS_TO_SHOW * 7;

  const { grid, maxHours } = useMemo(() => {
    const today = startOfDay(new Date());
    
    // Group sessions by date string for O(1) lookup
    const dailyTotals = new Map<string, number>();
    sessions.forEach(s => {
      const dateStr = startOfDay(new Date(s.startTime)).toISOString();
      const current = dailyTotals.get(dateStr) || 0;
      dailyTotals.set(dateStr, current + s.durationSeconds);
    });

    // Create a 2D array for the grid: [weekIndex][dayOfWeekIndex]
    const weeks: { date: Date; hours: number }[][] = Array(WEEKS_TO_SHOW).fill(null).map(() => []);
    
    let globalMax = 0;

    // Start from DAYS_TO_SHOW days ago up to today
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = date.toISOString();
      
      const seconds = dailyTotals.get(dateStr) || 0;
      const hours = seconds / 3600;
      
      if (hours > globalMax) globalMax = hours;

      // Determine which week bucket this goes into
      // i = 0 is today (last item in the last week)
      // i = 104 is the oldest day (first item in the first week)
      const weekIndex = Math.floor((DAYS_TO_SHOW - 1 - i) / 7);
      
      weeks[weekIndex].push({
        date,
        hours
      });
    }

    return { grid: weeks, maxHours: globalMax > 0 ? globalMax : 1 };
  }, [sessions]);

  // Scroll to the end (right side) on mount to show the most recent days
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  // Determine color intensity based on hours relative to maxHours
  const getColorClass = (hours: number) => {
    if (hours === 0) return 'bg-gray-100 dark:bg-gray-800/60';
    
    const intensity = hours / maxHours;
    if (intensity < 0.25) return 'bg-emerald-200 dark:bg-emerald-900/50';
    if (intensity < 0.5) return 'bg-emerald-400 dark:bg-emerald-700/60';
    if (intensity < 0.75) return 'bg-emerald-500 dark:bg-emerald-600/80';
    return 'bg-emerald-600 dark:bg-emerald-500';
  };

  const totalSessionsAllTime = sessions.length;
  const totalSecondsAllTime = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);

  return (
    <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
      
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-gray-900 dark:text-white font-black text-xl tracking-tight flex-1 mr-2" numberOfLines={1} adjustsFontSizeToFit>{t('statsComp.masteryJourney')}</Text>
        <Text className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{t('statsComp.allTime')}</Text>
      </View>
      
      <View className="flex-row items-baseline gap-2 mb-6">
        <Text className="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
          {formatLongTime(totalSecondsAllTime)}
        </Text>
        <Text className="text-xs font-bold text-gray-400">
          / 10,000 {t('statsComp.hrs')}
        </Text>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mb-2"
        contentContainerStyle={{ paddingRight: 4 }}
      >
        <View className="flex-row gap-1">
          {grid.map((week, weekIdx) => (
            <View key={weekIdx} className="gap-1">
              {week.map((day, dayIdx) => (
                <View 
                  key={dayIdx} 
                  className={`w-3.5 h-3.5 rounded-[3px] ${getColorClass(day.hours)}`}
                />
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-[10px] font-bold text-gray-400">{totalSessionsAllTime} {t('statsComp.sessionsCompleted')}</Text>
        
        <View className="flex-row items-center gap-1">
          <Text className="text-[9px] text-gray-400 mr-1">{t('statsComp.less')}</Text>
          <View className="w-2.5 h-2.5 rounded-[2px] bg-gray-100 dark:bg-gray-800/60" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/50" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700/60" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-600/80" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
          <Text className="text-[9px] text-gray-400 ml-1">{t('statsComp.more')}</Text>
        </View>
      </View>

    </View>
  );
}

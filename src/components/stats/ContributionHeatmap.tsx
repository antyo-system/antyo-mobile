import { View, Text, ScrollView } from 'react-native';
import { useMemo, useRef, useEffect } from 'react';
import { subDays, format, startOfDay, startOfWeek, eachDayOfInterval } from 'date-fns';
import { Session } from '@/types';
import { formatLongTime } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  sessions: Session[];
}

export function ContributionHeatmap({ sessions }: Props) {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate the last 52 weeks of data
  const WEEKS_TO_SHOW = 52;

  const { weeks, maxHours, months } = useMemo(() => {
    const today = startOfDay(new Date());
    
    // Group sessions by date string for O(1) lookup
    const dailyTotals = new Map<string, number>();
    sessions.forEach(s => {
      const dateStr = startOfDay(new Date(s.startTime)).toISOString();
      const current = dailyTotals.get(dateStr) || 0;
      dailyTotals.set(dateStr, current + s.durationSeconds);
    });

    let globalMax = 0;

    // We want exactly WEEKS_TO_SHOW ending with the week of `today`
    const startDate = startOfWeek(subDays(today, (WEEKS_TO_SHOW - 1) * 7), { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: startDate, end: today });

    const generatedWeeks: { date: Date; hours: number }[][] = [];
    let currentWeek: { date: Date; hours: number }[] = [];

    days.forEach(date => {
      const dateStr = date.toISOString();
      const seconds = dailyTotals.get(dateStr) || 0;
      const hours = seconds / 3600;
      if (hours > globalMax) globalMax = hours;

      currentWeek.push({ date, hours });

      // End of week (Saturday = 6) or if it is today
      if (date.getDay() === 6 || date.getTime() === today.getTime()) {
        generatedWeeks.push(currentWeek);
        currentWeek = [];
      }
    });

    // Calculate month labels
    const generatedMonths: { label: string; colIndex: number }[] = [];
    generatedWeeks.forEach((week, i) => {
      if (week.length === 0) return;
      const currentMonth = week[0].date.getMonth();
      const prevMonth = i > 0 ? generatedWeeks[i - 1][0].date.getMonth() : -1;
      
      // Add label if month changed. Or if it's the first column (only if the next column doesn't immediately change month to avoid overlap)
      if (currentMonth !== prevMonth) {
        if (i === 0) {
           // check if next week changes month
           if (generatedWeeks.length > 1 && generatedWeeks[1][0].date.getMonth() === currentMonth) {
               generatedMonths.push({ label: format(week[0].date, 'MMM'), colIndex: i });
           }
        } else {
           generatedMonths.push({ label: format(week[0].date, 'MMM'), colIndex: i });
        }
      }
    });

    return { weeks: generatedWeeks, maxHours: globalMax > 0 ? globalMax : 1, months: generatedMonths };
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
    <View className="mb-6">
      
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

      <View className="flex-row bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm shadow-gray-200 dark:shadow-none mb-2 border border-gray-100 dark:border-gray-800">
        {/* Y-Axis Labels (Mon, Wed, Fri) */}
        <View className="mr-2 mt-5 gap-1">
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}></Text>
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}>Mon</Text>
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}></Text>
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}>Wed</Text>
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}></Text>
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}>Fri</Text>
          <Text className="text-[10px] text-gray-400 h-3.5" style={{ lineHeight: 14 }}></Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-1"
        >
          <View className="relative">
            {/* Months Label Row */}
            <View className="h-5 flex-row relative mb-0.5">
              {months.map((m, i) => (
                <Text 
                  key={i} 
                  className="text-[10px] font-bold text-gray-500 absolute"
                  style={{ left: m.colIndex * 18 }}
                >
                  {m.label}
                </Text>
              ))}
            </View>
            
            {/* Heatmap Grid */}
            <View className="flex-row gap-1">
              {weeks.map((week, weekIdx) => (
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
          </View>
        </ScrollView>
      </View>

      <View className="flex-row items-center justify-between mt-2 px-1">
        <Text className="text-[10px] font-bold text-gray-400">{totalSessionsAllTime} {t('statsComp.sessionsCompleted')}</Text>
        
        <View className="flex-row items-center gap-1">
          <Text className="text-[9px] font-bold text-gray-400 mr-1">{t('statsComp.less')}</Text>
          <View className="w-2.5 h-2.5 rounded-[2px] bg-gray-100 dark:bg-gray-800/60" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200 dark:bg-emerald-900/50" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 dark:bg-emerald-700/60" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 dark:bg-emerald-600/80" />
          <View className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600 dark:bg-emerald-500" />
          <Text className="text-[9px] font-bold text-gray-400 ml-1">{t('statsComp.more')}</Text>
        </View>
      </View>

    </View>
  );
}

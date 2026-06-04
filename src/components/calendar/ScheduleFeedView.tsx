import React from 'react';
import { View, Text, ScrollView, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { format, isSameDay } from 'date-fns';
import { usePlanStore } from '@/store/usePlanStore';
import { useSessionStore } from '@/store/useSessionStore';

interface Props {
  selectedDate: Date;
}

export function ScheduleFeedView({ selectedDate }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const plans = usePlanStore((s) => s.plans);
  const sessions = useSessionStore((s) => s.sessions);

  // Parse items for the selected day
  const dailyItems = React.useMemo(() => {
    const items: Array<{ id: string; title: string; startMins: number; durationMins: number; type: 'plan' | 'real' }> = [];

    // Add Plans
    plans.forEach((p) => {
      let matches = false;
      if (p.recurrence === 'daily') matches = true;
      else if (p.recurrence === 'weekly' && new Date(p.baseDate).getDay() === selectedDate.getDay()) matches = true;
      else if (p.recurrence === 'specific_days' && p.recurrenceDays?.includes(selectedDate.getDay())) matches = true;
      else if (isSameDay(new Date(p.baseDate), selectedDate)) matches = true;

      if (matches) {
        items.push({
          id: `plan-${p.id}`,
          title: p.title || 'Untitled Plan',
          startMins: p.startMinutes,
          durationMins: p.durationMinutes,
          type: 'plan',
        });
      }
    });

    // Add Real Sessions
    sessions.forEach((s) => {
      const sessionDate = new Date(s.startTime);
      if (isSameDay(sessionDate, selectedDate)) {
        const startMins = sessionDate.getHours() * 60 + sessionDate.getMinutes();
        items.push({
          id: `real-${s.id}`,
          title: s.title || 'Focus Session',
          startMins,
          durationMins: Math.round(s.durationSeconds / 60),
          type: 'real',
        });
      }
    });

    // Sort by start time
    return items.sort((a, b) => a.startMins - b.startMins);
  }, [plans, sessions, selectedDate]);

  const formatTimeRange = (startMins: number, durationMins: number) => {
    const startH = Math.floor(startMins / 60);
    const startM = startMins % 60;
    const endMins = startMins + durationMins;
    const endH = Math.floor(endMins / 60) % 24;
    const endM = endMins % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(startH)}:${pad(startM)} - ${pad(endH)}:${pad(endM)}`;
  };

  return (
    <ScrollView className="flex-1 px-5 pt-6 bg-white dark:bg-gray-950" contentContainerStyle={{ paddingBottom: 150 }}>
      <View className="mb-6">
        <Text className="text-xl font-black text-gray-900 dark:text-white">Daily Schedule</Text>
        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
          {format(selectedDate, 'EEEE, MMM d')}
        </Text>
      </View>

      {dailyItems.length === 0 ? (
        <View className="items-center justify-center py-20 opacity-50">
          <Feather name="calendar" size={48} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text className="text-gray-500 dark:text-gray-400 font-bold mt-4">No schedule for this day</Text>
        </View>
      ) : (
        <View className="gap-3">
          {dailyItems.map((item) => (
            <View 
              key={item.id} 
              className={`p-4 rounded-2xl border ${
                item.type === 'plan' 
                  ? 'bg-white border-yellow-100 dark:bg-gray-900 dark:border-yellow-900/30 shadow-sm' 
                  : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50 shadow-sm'
              }`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Text className={`text-xs font-black uppercase tracking-widest ${
                  item.type === 'plan' ? 'text-yellow-600 dark:text-yellow-500' : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {item.type === 'plan' ? 'Plan' : 'Real'}
                </Text>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                  {formatTimeRange(item.startMins, item.durationMins)}
                </Text>
              </View>
              <Text className={`text-lg font-black ${
                item.type === 'plan' ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-100'
              }`}>
                {item.title}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

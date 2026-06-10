import { ScrollView, View, Text, Pressable } from 'react-native';
import { isSameDay, isToday } from 'date-fns';
import { useMemo, useRef, useEffect, useState } from 'react';
import { generateDateRange, formatDate } from '@/utils/time';
import { MonthlyCalendarModal } from './MonthlyCalendarModal';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  achievedDates: Date[];
}

export function DateSelector({ selectedDate, onSelectDate, achievedDates }: Props) {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  
  // Generate 14 days in the past and 14 days in the future relative to the *selectedDate* so it updates when jumping months
  const dates = useMemo(() => generateDateRange(selectedDate, 14, 14), [selectedDate]);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Auto-scroll to center (rough estimate based on 56px width + 12px gap per item)
    // The selected date is always at index 14. 14 * 68 = 952.
    // Center of screen is roughly 150-200px offset, so scrolling to 780-800 centers it.
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: 780, animated: true });
    }, 100);
  }, [selectedDate]);

  return (
    <View className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-900 pb-3 pt-2">
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <Pressable onPress={() => setModalVisible(true)} className="flex-row items-center flex-1">
          <Text className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mr-1">
            {formatDate(selectedDate, 'MMMM yyyy')}
          </Text>
          <Text className="text-[10px] text-gray-400 mt-1">▼</Text>
        </Pressable>
        <View className="flex-row items-center gap-2">
          <Pressable 
            onPress={() => {
              onSelectDate(new Date());
            }} 
            className="bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800"
          >
            <Text className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">{t('calendarComp.today')}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const today = isToday(date);
          const isAchieved = achievedDates.some(achievedDate => isSameDay(achievedDate, date));
          
          let bgClass = 'bg-gray-50 dark:bg-gray-900';
          if (isSelected) {
            bgClass = isAchieved ? 'bg-orange-500 shadow-md' : 'bg-blue-600 shadow-md';
          } else if (today) {
            bgClass = isAchieved 
              ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800'
              : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800';
          } else if (isAchieved) {
            bgClass = 'bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-800/50';
          }

          let textClassDay = 'text-gray-400 dark:text-gray-500';
          let textClassNum = 'text-gray-800 dark:text-gray-200';
          
          if (isSelected) {
            textClassDay = 'text-white/80';
            textClassNum = 'text-white';
          } else if (today) {
            textClassDay = isAchieved ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400';
            textClassNum = isAchieved ? 'text-orange-700 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300';
          } else if (isAchieved) {
            textClassDay = 'text-orange-400 dark:text-orange-600';
            textClassNum = 'text-orange-600 dark:text-orange-500';
          }

          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              className={`items-center justify-center rounded-2xl w-14 h-[72px] ${bgClass}`}
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${textClassDay}`}>
                {formatDate(date, 'EEE')}
              </Text>
              <Text className={`text-xl font-black ${textClassNum}`}>
                {formatDate(date, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      
      <MonthlyCalendarModal 
        visible={modalVisible}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        onClose={() => setModalVisible(false)}
        achievedDates={achievedDates}
      />
    </View>
  );
}

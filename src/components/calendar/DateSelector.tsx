import { ScrollView, View, Text, Pressable } from 'react-native';
import { format, isSameDay, isToday } from 'date-fns';
import { useMemo, useRef, useEffect, useState } from 'react';
import { generateDateRange } from '@/utils/time';
import { MonthlyCalendarModal } from './MonthlyCalendarModal';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function DateSelector({ selectedDate, onSelectDate }: Props) {
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
        <Pressable onPress={() => setModalVisible(true)} className="flex-row items-center">
          <Text className="text-2xl font-black tracking-tight text-gray-900 dark:text-white mr-1">
            {format(selectedDate, 'MMMM yyyy')}
          </Text>
          <Text className="text-[10px] text-gray-400 mt-1">▼</Text>
        </Pressable>
        <Pressable 
          onPress={() => {
            onSelectDate(new Date());
          }} 
          className="bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800"
        >
          <Text className="text-[10px] font-black uppercase tracking-wider text-gray-600 dark:text-gray-400">Today</Text>
        </Pressable>
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
          return (
            <Pressable
              key={date.toISOString()}
              onPress={() => onSelectDate(date)}
              className={`items-center justify-center rounded-2xl w-14 h-[72px] ${
                isSelected 
                  ? 'bg-blue-600 shadow-md' 
                  : today 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' 
                    : 'bg-gray-50 dark:bg-gray-900'
              }`}
            >
              <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                isSelected 
                  ? 'text-blue-100' 
                  : today 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-400 dark:text-gray-500'
              }`}>
                {format(date, 'EEE')}
              </Text>
              <Text className={`text-xl font-black ${
                isSelected 
                  ? 'text-white' 
                  : today 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-800 dark:text-gray-200'
              }`}>
                {format(date, 'd')}
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
      />
    </View>
  );
}

import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { addMonths, endOfMonth, endOfWeek, isSameDay, isSameMonth, isToday, startOfMonth, startOfWeek, subMonths, addDays } from 'date-fns';
import { formatDate } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function CalendarPicker({ selectedDate, onSelectDate }: Props) {
  const { t } = useTranslation();
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [pickerVisible, setPickerVisible] = useState(false);

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart); // Sunday
    const calEnd = endOfWeek(monthEnd);

    const rows: Date[][] = [];
    let day = calStart;
    while (day <= calEnd) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      rows.push(week);
    }

    return rows;
  };

  const rows = renderCalendarGrid();

  return (
    <>
      <Pressable
        onPress={() => setPickerVisible(true)}
        className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 rounded-2xl h-[56px]"
      >
        <Text className="text-gray-900 dark:text-white font-bold text-base">
          {isToday(selectedDate) ? t('calendarComp.today') : formatDate(selectedDate, 'MMM d, yyyy')}
        </Text>
        <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs">{t('calendarComp.change')}</Text>
      </Pressable>

      <Modal visible={pickerVisible} transparent animationType="fade">
        <Pressable 
          className="flex-1 bg-black/40 items-center justify-center px-6"
          onPress={() => setPickerVisible(false)}
        >
          <Pressable 
            className="bg-white dark:bg-gray-900 rounded-3xl w-full p-5 shadow-2xl"
            onPress={() => {}} // prevent closing when tapping inside
          >
            {/* Header: Month/Year + Nav */}
            <View className="flex-row items-center justify-between mb-5">
              <Pressable 
                onPress={() => setCurrentMonth(prev => subMonths(prev, 1))}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <Text className="text-gray-600 dark:text-gray-300 font-bold text-lg">{'<'}</Text>
              </Pressable>
              <Text className="text-gray-900 dark:text-white font-bold text-lg">
                {formatDate(currentMonth, 'MMMM yyyy')}
              </Text>
              <Pressable 
                onPress={() => setCurrentMonth(prev => addMonths(prev, 1))}
                className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <Text className="text-gray-600 dark:text-gray-300 font-bold text-lg">{'>'}</Text>
              </Pressable>
            </View>

            {/* Day-of-week headers */}
            <View className="flex-row mb-2">
              {t('calendarComp.weekDaysInitial').split(',').map((d, i) => (
                <View key={i} className="flex-1 items-center">
                  <Text className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase">{d}</Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            {rows.map((week, wi) => (
              <View key={wi} className="flex-row">
                {week.map((day, di) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isTodayDate = isToday(day);

                  return (
                    <Pressable
                      key={di}
                      onPress={() => {
                        onSelectDate(day);
                        setPickerVisible(false);
                      }}
                      className="flex-1 items-center justify-center py-2"
                    >
                      <View 
                        className={`w-10 h-10 rounded-full items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-600' 
                            : isTodayDate 
                              ? 'border-2 border-blue-400' 
                              : ''
                        }`}
                      >
                        <Text className={`text-base font-bold ${
                          isSelected 
                            ? 'text-white' 
                            : !isCurrentMonth 
                              ? 'text-gray-300 dark:text-gray-700' 
                              : isTodayDate
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-900 dark:text-white'
                        }`}>
                          {formatDate(day, 'd')}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}

            {/* Close Button */}
            <Pressable 
              onPress={() => setPickerVisible(false)}
              className="mt-4 py-3 items-center"
            >
              <Text className="text-gray-400 font-black text-xs tracking-widest uppercase">{t('calendarComp.close')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

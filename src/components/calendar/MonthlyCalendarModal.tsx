import React, { useState, useEffect } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';

interface Props {
  visible: boolean;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  achievedDates?: Date[];
}

export function MonthlyCalendarModal({ visible, selectedDate, onSelectDate, onClose, achievedDates = [] }: Props) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  // Sync state if selectedDate changes externally
  useEffect(() => {
    if (visible) {
      setCurrentMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate, visible]);

  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <SafeAreaView className="flex-1 bg-black/60 justify-center px-6">
        <View className="bg-white dark:bg-gray-950 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
          <View className="flex-row justify-between items-center mb-6 px-2">
            <Pressable onPress={handlePrevMonth} className="p-2 -ml-2">
              <Text className="text-xl font-black text-gray-400">{'<'}</Text>
            </Pressable>
            <Text className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <Pressable onPress={handleNextMonth} className="p-2 -mr-2">
              <Text className="text-xl font-black text-gray-400">{'>'}</Text>
            </Pressable>
          </View>

          <View className="flex-row justify-between mb-4">
            {weekDays.map((day, i) => (
              <Text key={i} className="text-gray-400 font-black tracking-widest text-[10px] text-center flex-1">
                {day}
              </Text>
            ))}
          </View>

          <View className="flex-row flex-wrap justify-between">
            {days.map(day => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, selectedDate);
              const today = isToday(day);
              const isAchieved = achievedDates.some(ad => isSameDay(ad, day));

              let bgClass = '';
              if (isSelected) {
                bgClass = isAchieved ? 'bg-orange-500 shadow-md shadow-orange-500/30' : 'bg-blue-600 shadow-md shadow-blue-500/30';
              } else if (today && isCurrentMonth) {
                bgClass = isAchieved 
                  ? 'bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800' 
                  : 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800';
              } else if (isAchieved && isCurrentMonth) {
                bgClass = 'bg-orange-50/50 dark:bg-orange-900/10 border border-orange-200/50 dark:border-orange-800/50';
              }

              let textClass = '';
              if (isSelected) {
                textClass = 'text-white';
              } else if (today && isCurrentMonth) {
                textClass = isAchieved ? 'text-orange-600 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400';
              } else if (isAchieved && isCurrentMonth) {
                textClass = 'text-orange-600 dark:text-orange-500';
              } else if (isCurrentMonth) {
                textClass = 'text-gray-900 dark:text-gray-200';
              } else {
                textClass = 'text-gray-300 dark:text-gray-800';
              }

              return (
                <Pressable
                  key={day.toString()}
                  onPress={() => {
                    onSelectDate(day);
                    onClose();
                  }}
                  className={`w-[13%] aspect-square items-center justify-center rounded-full mb-2 ${bgClass}`}
                >
                  <Text className={`font-bold ${textClass}`}>
                    {format(day, 'd')}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          
          <Pressable onPress={onClose} className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-900 items-center">
            <Text className="text-gray-400 font-black uppercase tracking-widest text-xs">Close</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

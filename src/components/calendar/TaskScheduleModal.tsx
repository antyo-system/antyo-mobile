import React from 'react';
import { Modal, View, Text, Pressable, useColorScheme, ScrollView } from 'react-native';
import { Plan } from '@/store/usePlanStore';
import { Task } from '@/store/useTaskStore';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  visible: boolean;
  task: Task | null;
  plansToday: Plan[];
  onClose: () => void;
  onAssignToPlan: (planId: string) => void;
  onCreateNew: () => void;
}

export function TaskScheduleModal({ visible, task, plansToday, onClose, onAssignToPlan, onCreateNew }: Props) {
  const { language } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!task) return null;

  const t = (en: string, id: string) => language === 'id' ? id : en;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl pt-2 shadow-2xl max-h-[80%]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-1 pr-4">
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                {t('Schedule Task', 'Jadwalkan Tugas')}
              </Text>
              <Text className="text-lg font-black text-gray-900 dark:text-white" numberOfLines={1}>{task.title}</Text>
            </View>
            <Pressable onPress={onClose} className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Feather name="x" size={18} color={isDark ? 'white' : 'black'} />
            </Pressable>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 24, gap: 12, paddingBottom: 40 }}>
            {plansToday.length > 0 && (
              <View className="mb-2">
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {t('Existing Timeblocks Today', 'Balok Waktu Hari Ini')}
                </Text>
                <View className="gap-3">
                  {plansToday.map(plan => {
                    const startHours = Math.floor(plan.startMinutes / 60);
                    const startMins = plan.startMinutes % 60;
                    const endTotalMins = plan.startMinutes + plan.durationMinutes;
                    const endHours = Math.floor(endTotalMins / 60);
                    const endMins = endTotalMins % 60;
                    
                    const timeString = `${startHours.toString().padStart(2, '0')}:${startMins.toString().padStart(2, '0')} - ${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
                    
                    return (
                      <Pressable 
                        key={plan.id} 
                        onPress={() => onAssignToPlan(plan.id)}
                        className="flex-row items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700"
                      >
                        <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: plan.color || '#F59E0B' }} />
                        <View className="flex-1">
                          <Text className="text-base font-bold text-gray-900 dark:text-white">{plan.title}</Text>
                          <Text className="text-xs font-bold text-gray-500">{timeString}</Text>
                        </View>
                        <Feather name="chevron-right" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            <Pressable 
              onPress={onCreateNew}
              className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-2xl mt-2"
            >
              <View className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full items-center justify-center mr-4">
                <Feather name="plus" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-blue-700 dark:text-blue-400 font-black text-base">{t('Create New Timeblock', 'Buat Balok Baru')}</Text>
                <Text className="text-blue-600/70 dark:text-blue-500/70 text-xs font-bold">{t('Schedule a specific time', 'Atur jam spesifik baru')}</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

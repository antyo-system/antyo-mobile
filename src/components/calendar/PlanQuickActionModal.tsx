import React, { useState } from 'react';
import { Modal, View, Text, Pressable, useColorScheme, ScrollView, TextInput } from 'react-native';
import { Plan, usePlanStore } from '@/store/usePlanStore';
import { useTaskStore } from '@/store/useTaskStore';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  plan: Plan | null;
  onClose: () => void;
  onStartTimer: () => void;
  onMarkDone: () => void;
  onEdit: () => void;
}

export function PlanQuickActionModal({ visible, plan, onClose, onStartTimer, onMarkDone, onEdit }: Props) {
  const { language } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tasks = useTaskStore(s => s.tasks);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const addTask = useTaskStore(s => s.addTask);
  const updatePlan = usePlanStore(s => s.updatePlan);
  const planTasks = plan ? tasks.filter(t => t.planId === plan.id) : [];

  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!plan) return null;

  const t = (en: string, id: string) => language === 'id' ? id : en;

  const handleToggleTask = (id: string) => {
    Haptics.selectionAsync();
    toggleTask(id);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !plan) return;
    addTask({
      title: newTaskTitle.trim(),
      baseDate: plan.baseDate,
      planId: plan.id,
    });
    setNewTaskTitle('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl pt-2 shadow-2xl max-h-[80%]">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-black text-gray-900 dark:text-white" numberOfLines={1}>{plan.title}</Text>
              <Text className="text-xs font-bold text-gray-500">{plan.durationMinutes} {t('min', 'mnt')}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Pressable 
                onPress={() => {
                  Haptics.selectionAsync();
                  updatePlan(plan.id, { isPriority: !plan.isPriority });
                }} 
                className={`p-2 rounded-full ${plan.isPriority ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                <Feather name="star" size={18} color={plan.isPriority ? '#F59E0B' : (isDark ? 'white' : 'black')} fill={plan.isPriority ? '#F59E0B' : 'transparent'} />
              </Pressable>
              <Pressable onPress={onClose} className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-gray-800">
                <Feather name="x" size={18} color={isDark ? 'white' : 'black'} />
              </Pressable>
            </View>
          </View>
          
          <ScrollView contentContainerStyle={{ padding: 24, gap: 12, paddingBottom: 40 }}>
            <View className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-100 dark:border-gray-800">
              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {t('To-Do List', 'Daftar Tugas')}
              </Text>
              
              {planTasks.length > 0 && (
                <View className="gap-3 mb-4">
                  {planTasks.map(task => (
                    <Pressable 
                      key={task.id} 
                      onPress={() => handleToggleTask(task.id)}
                      className="flex-row items-center"
                    >
                      <View className={`w-5 h-5 rounded-md border-2 mr-3 items-center justify-center ${
                        task.completed 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {task.completed && <Feather name="check" size={12} color="white" />}
                      </View>
                      <Text className={`flex-1 text-sm font-bold ${
                        task.completed 
                          ? 'text-gray-400 dark:text-gray-600 line-through' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {task.title}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              <View className="flex-row items-center">
                <TextInput
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  placeholder={t('Add a new task...', 'Tambah tugas baru...')}
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white font-medium"
                  onSubmitEditing={handleAddTask}
                  returnKeyType="done"
                />
                <Pressable 
                  onPress={handleAddTask}
                  className={`ml-2 w-10 h-10 rounded-xl items-center justify-center ${
                    newTaskTitle.trim() ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  <Feather name="plus" size={20} color={newTaskTitle.trim() ? 'white' : (isDark ? '#6B7280' : '#9CA3AF')} />
                </Pressable>
              </View>
            </View>
            {plan.skillId && (
              <Pressable 
                onPress={onStartTimer}
                className="flex-row items-center bg-blue-600 p-4 rounded-2xl"
              >
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Feather name="play" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-black text-base">{t('Start Timer Now', 'Mulai Timer Sekarang')}</Text>
                  <Text className="text-blue-100 text-xs font-bold">{t('Focus tracking with dynamic time', 'Lacak fokus dengan waktu dinamis')}</Text>
                </View>
              </Pressable>
            )}

            {!plan.skillId && (
              <Pressable 
                onPress={onStartTimer}
                className="flex-row items-center bg-blue-600 p-4 rounded-2xl opacity-50"
              >
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mr-4">
                  <Feather name="play" size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-black text-base">{t('Start Timer Now', 'Mulai Timer Sekarang')}</Text>
                  <Text className="text-blue-100 text-xs font-bold">{t('Requires assigned skill', 'Harus pasang skill dulu')}</Text>
                </View>
              </Pressable>
            )}

            <Pressable 
              onPress={onMarkDone}
              className="flex-row items-center bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/50 p-4 rounded-2xl"
            >
              <View className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-full items-center justify-center mr-4">
                <Feather name="check" size={20} color="#0D9488" />
              </View>
              <View>
                <Text className="text-teal-700 dark:text-teal-400 font-black text-base">{t('Mark as Done', 'Tandai Selesai')}</Text>
                <Text className="text-teal-600/70 dark:text-teal-500/70 text-xs font-bold">{t('Instant log without timer', 'Catat instan tanpa timer')}</Text>
              </View>
            </Pressable>

            <Pressable 
              onPress={onEdit}
              className="flex-row items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl"
            >
              <View className="w-10 h-10 bg-white dark:bg-gray-700 rounded-full items-center justify-center mr-4">
                <Feather name="edit-2" size={20} color={isDark ? 'white' : 'black'} />
              </View>
              <View>
                <Text className="text-gray-900 dark:text-white font-black text-base">{t('Edit / Delete', 'Edit / Hapus')}</Text>
                <Text className="text-gray-500 text-xs font-bold">{t('Modify schedule or details', 'Ubah jadwal atau detail')}</Text>
              </View>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

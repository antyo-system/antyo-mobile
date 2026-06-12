import React, { useState } from 'react';
import { Modal, View, Text, Pressable, useColorScheme, ScrollView, TextInput } from 'react-native';
import { useTaskStore, Milestone } from '@/store/useTaskStore';
import { Plan } from '@/store/usePlanStore';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import * as Haptics from 'expo-haptics';

export interface TimelineRenderedPlan {
  id: string;
  type: 'milestone' | 'allday';
  title: string;
  color: string;
  top: number;
  height: number;
  _left: number;
  _width: number;
  isCompleted: boolean;
  raw: Milestone | Plan;
}

interface Props {
  visible: boolean;
  plan: TimelineRenderedPlan | null;
  onClose: () => void;
  onMarkDone: () => void;
  onEdit: () => void;
}

export function TimelineQuickActionModal({ visible, plan, onClose, onMarkDone, onEdit }: Props) {
  const { language } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tasks = useTaskStore(s => s.tasks);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const addTask = useTaskStore(s => s.addTask);
  
  const planTasks = plan 
    ? tasks.filter(t => plan.type === 'milestone' ? t.milestoneId === plan.id : t.planId === plan.id) 
    : [];

  const [newTaskTitle, setNewTaskTitle] = useState('');

  if (!plan) return null;

  const t = (en: string, id: string) => language === 'id' ? id : en;

  const handleToggleTask = (id: string) => {
    Haptics.selectionAsync();
    toggleTask(id);
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !plan) return;
    
    // For milestone, baseDate should be the current date or start date
    const baseDate = plan.type === 'allday' 
      ? (plan.raw as Plan).baseDate 
      : ((plan.raw as Milestone).startDate || (plan.raw as Milestone).date);

    addTask({
      title: newTaskTitle.trim(),
      baseDate: baseDate,
      milestoneId: plan.type === 'milestone' ? plan.id : undefined,
      planId: plan.type === 'allday' ? plan.id : undefined,
      projectId: plan.type === 'milestone' ? (plan.raw as Milestone).projectId : undefined,
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
              <Text className="text-xs font-bold text-gray-500">
                {plan.type === 'allday' ? t('All Day Plan', 'Rencana Seharian') : t('Timeline Milestone', 'Milestone Project')}
              </Text>
            </View>
            <Pressable onPress={onClose} className="p-2 -mr-2 rounded-full bg-gray-100 dark:bg-gray-800">
              <Feather name="x" size={18} color={isDark ? 'white' : 'black'} />
            </Pressable>
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

            <Pressable 
              onPress={onMarkDone}
              className={`flex-row items-center p-4 rounded-2xl ${
                plan.isCompleted 
                  ? 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
                  : 'bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/50'
              }`}
            >
              <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                plan.isCompleted ? 'bg-gray-200 dark:bg-gray-700' : 'bg-teal-100 dark:bg-teal-900/50'
              }`}>
                {plan.isCompleted ? (
                  <Feather name="x" size={20} color="#6B7280" />
                ) : (
                  <Feather name="check" size={20} color="#0D9488" />
                )}
              </View>
              <View>
                <Text className={`font-black text-base ${plan.isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-teal-700 dark:text-teal-400'}`}>
                  {plan.isCompleted ? t('Mark as Undone', 'Tandai Belum Selesai') : t('Mark as Done', 'Tandai Selesai')}
                </Text>
                <Text className={`text-xs font-bold ${plan.isCompleted ? 'text-gray-500' : 'text-teal-600/70 dark:text-teal-500/70'}`}>
                  {plan.isCompleted ? t('Re-open milestone', 'Buka kembali milestone ini') : t('Complete this milestone', 'Selesaikan milestone ini')}
                </Text>
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

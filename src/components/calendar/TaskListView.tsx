import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/useTaskStore';
import * as Haptics from 'expo-haptics';
import { formatDate } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from 'react-native';

const PROJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface Props {
  selectedDate: Date;
}

export function TaskListView({ selectedDate }: Props) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const tasks = useTaskStore(s => s.tasks);
  const projects = useTaskStore(s => s.projects) || [];
  const addTask = useTaskStore(s => s.addTask);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const addProject = useTaskStore(s => s.addProject);
  const deleteProject = useTaskStore(s => s.deleteProject);

  const [activeProjectId, setActiveProjectId] = useState<string>('all');
  const [isProjectModalVisible, setProjectModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  
  const selectedDateISO = selectedDate.toISOString();
  // We use ISO string date part just to filter by day easily
  const selectedDateString = selectedDateISO.split('T')[0];

  const dailyTasks = tasks.filter(t => t.baseDate === selectedDateString && (activeProjectId === 'all' || t.projectId === activeProjectId));
  const activeTasks = dailyTasks.filter(t => !t.completed).sort((a, b) => b.createdAt - a.createdAt);
  const completedTasks = dailyTasks.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTask({
      title: newTaskTitle.trim(),
      baseDate: selectedDateString,
      projectId: activeProjectId === 'all' ? undefined : activeProjectId,
    });
    setNewTaskTitle('');
  };

  const handleToggle = (id: string) => {
    Haptics.selectionAsync();
    toggleTask(id);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white dark:bg-gray-950"
    >
      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 150 }}>
        <View className="mb-4">
          <Text className="text-xl font-black text-gray-900 dark:text-white">{t('calendarComp.dailyTasks')}</Text>
          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
            {formatDate(selectedDate, 'EEEE, MMM d')}
          </Text>
        </View>

        {/* Project Tags (Horizontal Scroll) */}
        <View className="mb-6 -mx-5 px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 40, gap: 8 }}>
            <Pressable 
              onPress={() => setActiveProjectId('all')}
              className={`px-4 py-2 rounded-full border ${activeProjectId === 'all' ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' : 'bg-transparent border-gray-200 dark:border-gray-800'}`}
            >
              <Text className={`font-bold text-sm ${activeProjectId === 'all' ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>
                {t('calendarComp.all')}
              </Text>
            </Pressable>
            
            {projects.map(proj => (
              <Pressable 
                key={proj.id}
                onPress={() => setActiveProjectId(proj.id)}
                onLongPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  deleteProject(proj.id);
                  if (activeProjectId === proj.id) setActiveProjectId('all');
                }}
                className={`px-4 py-2 rounded-full border flex-row items-center gap-2 ${
                  activeProjectId === proj.id 
                    ? 'border-transparent' 
                    : 'bg-transparent border-gray-200 dark:border-gray-800'
                }`}
                style={activeProjectId === proj.id ? { backgroundColor: proj.color } : {}}
              >
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: activeProjectId === proj.id ? '#fff' : proj.color }} />
                <Text className={`font-bold text-sm ${activeProjectId === proj.id ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                  {proj.name}
                </Text>
              </Pressable>
            ))}

            <Pressable 
              onPress={() => setProjectModalVisible(true)}
              className="px-4 py-2 rounded-full border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-row items-center gap-2"
            >
              <Feather name="plus" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="font-bold text-sm text-gray-500 dark:text-gray-400">
                {t('calendarComp.newList')}
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Input Add Task */}
        <View className="flex-row items-center mb-8">
          <TextInput
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder={t('calendarComp.addNewTask')}
            placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
            onSubmitEditing={handleAddTask}
            className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white font-bold"
          />
          <Pressable 
            onPress={handleAddTask}
            className="ml-3 w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center active:opacity-70"
          >
            <Feather name="plus" size={24} color="white" />
          </Pressable>
        </View>

        {/* Active Tasks */}
        <View className="gap-3 mb-8">
          {activeTasks.length === 0 && completedTasks.length === 0 ? (
            <View className="items-center justify-center py-10 opacity-50">
              <Feather name="check-circle" size={40} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="text-gray-500 dark:text-gray-400 font-bold mt-4">{t('calendarComp.noTasksForThisDay')}</Text>
            </View>
          ) : (
            activeTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              return (
              <View 
                key={task.id} 
                className="flex-row items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm"
              >
                <Pressable onPress={() => handleToggle(task.id)} className="mr-4">
                  <View className="w-6 h-6 rounded-md border-2 border-gray-300 dark:border-gray-600 items-center justify-center" />
                </Pressable>
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-900 dark:text-gray-100">
                    {task.title}
                  </Text>
                  {project && activeProjectId === 'all' && (
                    <View className="flex-row items-center mt-1">
                      <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: project.color }} />
                      <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{project.name}</Text>
                    </View>
                  )}
                </View>
                <Pressable onPress={() => deleteTask(task.id)} className="p-2 opacity-50 active:opacity-100">
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </Pressable>
              </View>
            )})
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View>
            <Text className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">
              {t('calendarComp.completed')} ({completedTasks.length})
            </Text>
            <View className="gap-3 opacity-60">
              {completedTasks.map(task => (
                <View 
                  key={task.id} 
                  className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-900 p-4 rounded-2xl"
                >
                  <Pressable onPress={() => handleToggle(task.id)} className="mr-4">
                    <View className="w-6 h-6 rounded-md bg-blue-600 items-center justify-center">
                      <Feather name="check" size={14} color="white" />
                    </View>
                  </Pressable>
                  <Text className="flex-1 text-base font-bold text-gray-400 dark:text-gray-600 line-through">
                    {task.title}
                  </Text>
                  <Pressable onPress={() => deleteTask(task.id)} className="p-2 opacity-50 active:opacity-100">
                    <Feather name="trash-2" size={16} color="#EF4444" />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Project Creation Modal */}
      <Modal visible={isProjectModalVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center px-6">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl">
              <Text className="text-xl font-black text-gray-900 dark:text-white mb-4">{t('calendarComp.createNewList')}</Text>
              
              <TextInput
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder={t('calendarComp.listNamePlaceholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold mb-6"
                autoFocus
              />

              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{t('calendarComp.listColor')}</Text>
              <View className="flex-row justify-between mb-8">
                {PROJECT_COLORS.map(color => (
                  <Pressable
                    key={color}
                    onPress={() => setNewProjectColor(color)}
                    className={`w-10 h-10 rounded-full items-center justify-center border-2 ${newProjectColor === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  >
                    {newProjectColor === color && <Feather name="check" size={16} color="white" />}
                  </Pressable>
                ))}
              </View>

              <View className="flex-row gap-3">
                <Pressable 
                  onPress={() => setProjectModalVisible(false)}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-xl items-center"
                >
                  <Text className="font-bold text-gray-600 dark:text-gray-300">{t('calendarComp.cancel')}</Text>
                </Pressable>
                <Pressable 
                  onPress={() => {
                    if (newProjectName.trim()) {
                      addProject(newProjectName.trim(), newProjectColor);
                      setNewProjectName('');
                      setProjectModalVisible(false);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }
                  }}
                  className="flex-1 py-4 bg-blue-600 rounded-xl items-center"
                >
                  <Text className="font-bold text-white">{t('calendarComp.createList')}</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

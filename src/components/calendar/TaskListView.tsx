import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useTaskStore } from '@/store/useTaskStore';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';

interface Props {
  selectedDate: Date;
}

export function TaskListView({ selectedDate }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const tasks = useTaskStore(s => s.tasks);
  const addTask = useTaskStore(s => s.addTask);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const deleteTask = useTaskStore(s => s.deleteTask);
  
  const selectedDateISO = selectedDate.toISOString();
  // We use ISO string date part just to filter by day easily
  const selectedDateString = selectedDateISO.split('T')[0];

  const dailyTasks = tasks.filter(t => t.baseDate === selectedDateString);
  const activeTasks = dailyTasks.filter(t => !t.completed).sort((a, b) => b.createdAt - a.createdAt);
  const completedTasks = dailyTasks.filter(t => t.completed).sort((a, b) => b.createdAt - a.createdAt);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTask({
      title: newTaskTitle.trim(),
      baseDate: selectedDateString,
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
        <View className="mb-6">
          <Text className="text-xl font-black text-gray-900 dark:text-white">To-Do List</Text>
          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">
            {format(selectedDate, 'EEEE, MMM d')}
          </Text>
        </View>

        {/* Input Add Task */}
        <View className="flex-row items-center mb-8">
          <TextInput
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder="Add a new task..."
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
              <Text className="text-gray-500 dark:text-gray-400 font-bold mt-4">All clear for today!</Text>
            </View>
          ) : (
            activeTasks.map(task => (
              <View 
                key={task.id} 
                className="flex-row items-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-2xl shadow-sm"
              >
                <Pressable onPress={() => handleToggle(task.id)} className="mr-4">
                  <View className="w-6 h-6 rounded-md border-2 border-gray-300 dark:border-gray-600 items-center justify-center" />
                </Pressable>
                <Text className="flex-1 text-base font-bold text-gray-900 dark:text-gray-100">
                  {task.title}
                </Text>
                <Pressable onPress={() => deleteTask(task.id)} className="p-2 opacity-50 active:opacity-100">
                  <Feather name="trash-2" size={16} color="#EF4444" />
                </Pressable>
              </View>
            ))
          )}
        </View>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <View>
            <Text className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">
              Selesai ({completedTasks.length})
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
    </KeyboardAvoidingView>
  );
}

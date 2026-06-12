import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, useColorScheme, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTaskStore } from '@/store/useTaskStore';
import * as Haptics from 'expo-haptics';
import { formatDate, getMinutesFromMidnight } from '@/utils/time';
import { isToday } from 'date-fns';
import { usePlanStore } from '@/store/usePlanStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Modal } from 'react-native';

const PROJECT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

interface Props {
  selectedDate: Date;
  onScheduleTask?: (task: any) => void;
}

export function TaskListView({ selectedDate, onScheduleTask }: Props) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const tasks = useTaskStore(s => s.tasks);
  const plans = usePlanStore(s => s.plans);
  const projects = useTaskStore(s => s.projects) || [];
  const milestones = useTaskStore(s => s.milestones) || [];
  const addTask = useTaskStore(s => s.addTask);
  const toggleTask = useTaskStore(s => s.toggleTask);
  const deleteTask = useTaskStore(s => s.deleteTask);
  const toggleTaskPriority = useTaskStore(s => s.toggleTaskPriority);
  const addProject = useTaskStore(s => s.addProject);
  const deleteProject = useTaskStore(s => s.deleteProject);
  const assignTaskToMilestone = useTaskStore(s => s.assignTaskToMilestone);

  const [activeProjectId, setActiveProjectId] = useState<string>('all');
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(null);
  const [isProjectModalVisible, setProjectModalVisible] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);

  const selectedDateString = selectedDate.toISOString().split('T')[0];

  // Milestones belonging to the active project
  const projectMilestones = activeProjectId !== 'all'
    ? milestones.filter(m => m.projectId === activeProjectId)
    : [];

  // Reset milestone filter when project changes
  const handleProjectChange = (projectId: string) => {
    setActiveProjectId(projectId);
    setActiveMilestoneId(null);
  };

  const dailyTasks = tasks.filter(t =>
    t.baseDate === selectedDateString &&
    !t.planId &&
    (activeProjectId === 'all' || t.projectId === activeProjectId) &&
    (activeMilestoneId === null || t.milestoneId === activeMilestoneId)
  );
  const activeTasks = dailyTasks.filter(t => !t.completed).sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.createdAt - a.createdAt;
  });
  const completedTasks = dailyTasks.filter(t => t.completed).sort((a, b) => {
    if (a.isPriority && !b.isPriority) return -1;
    if (!a.isPriority && b.isPriority) return 1;
    return b.createdAt - a.createdAt;
  });

  const isSelectedDateToday = isToday(selectedDate);
  const currentMins = getMinutesFromMidnight(new Date().toISOString());

  const ongoingPlan = isSelectedDateToday
    ? plans.find(p =>
        p.baseDate.split('T')[0] === selectedDateString &&
        p.startMinutes <= currentMins &&
        p.startMinutes + p.durationMinutes > currentMins
      )
    : null;
  const ongoingTasks = ongoingPlan
    ? tasks.filter(t => t.planId === ongoingPlan.id && !t.completed).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addTask({
      title: newTaskTitle.trim(),
      baseDate: selectedDateString,
      projectId: activeProjectId === 'all' ? undefined : activeProjectId,
      milestoneId: activeMilestoneId ?? undefined,
    });
    setNewTaskTitle('');
  };

  const handleToggle = (id: string) => {
    Haptics.selectionAsync();
    toggleTask(id);
  };

  const handleTogglePriority = (id: string) => {
    Haptics.selectionAsync();
    toggleTaskPriority(id);
  };

  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-white dark:bg-gray-950"
    >
      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 150 }}>

        {/* ── Project Chips ── */}
        <View className="mb-3 -mx-5 px-5">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 40, gap: 8 }}>
            <Pressable
              onPress={() => handleProjectChange('all')}
              className={`px-4 py-2 rounded-full border ${activeProjectId === 'all'
                ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white'
                : 'bg-transparent border-gray-200 dark:border-gray-800'}`}
            >
              <Text className={`font-bold text-sm ${activeProjectId === 'all' ? 'text-white dark:text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>
                {t('calendarComp.all')}
              </Text>
            </Pressable>

            {projects.map(proj => (
              <Pressable
                key={proj.id}
                onPress={() => handleProjectChange(proj.id)}
                onLongPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  deleteProject(proj.id);
                  if (activeProjectId === proj.id) handleProjectChange('all');
                }}
                className={`px-4 py-2 rounded-full border flex-row items-center gap-2 ${
                  activeProjectId === proj.id ? 'border-transparent' : 'bg-transparent border-gray-200 dark:border-gray-800'
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

        {/* ── Milestone Sub-filter (visible only when a project is selected and has milestones) ── */}
        {activeProjectId !== 'all' && projectMilestones.length > 0 && (
          <View className="mb-5 -mx-5 px-5">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 40, gap: 6 }}>
              {/* "All tasks" chip */}
              <Pressable
                onPress={() => setActiveMilestoneId(null)}
                className={`px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border ${
                  activeMilestoneId === null
                    ? 'border-transparent'
                    : 'border-gray-200 dark:border-gray-800 bg-transparent'
                }`}
                style={activeMilestoneId === null && activeProject ? { backgroundColor: activeProject.color + '25' } : {}}
              >
                <Feather
                  name="layers"
                  size={11}
                  color={activeMilestoneId === null ? (activeProject?.color ?? '#6B7280') : (isDark ? '#6B7280' : '#9CA3AF')}
                />
                <Text
                  style={{ color: activeMilestoneId === null ? (activeProject?.color ?? '#6B7280') : (isDark ? '#6B7280' : '#9CA3AF') }}
                  className="text-xs font-bold"
                >
                  All Tasks
                </Text>
              </Pressable>

              {projectMilestones.map(ms => {
                const isActive = activeMilestoneId === ms.id;
                const color = activeProject?.color ?? '#3B82F6';
                return (
                  <Pressable
                    key={ms.id}
                    onPress={() => setActiveMilestoneId(isActive ? null : ms.id)}
                    className="px-3 py-1.5 rounded-full flex-row items-center gap-1.5 border"
                    style={{
                      borderColor: isActive ? color : (isDark ? '#374151' : '#E5E7EB'),
                      backgroundColor: isActive ? color + '20' : 'transparent',
                    }}
                  >
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        backgroundColor: isActive ? color : (isDark ? '#6B7280' : '#9CA3AF'),
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      style={{ color: isActive ? color : (isDark ? '#9CA3AF' : '#6B7280'), maxWidth: 100 }}
                      className="text-xs font-bold"
                    >
                      {ms.title}
                    </Text>
                    {ms.isCompleted && (
                      <Feather name="check" size={9} color={isActive ? color : (isDark ? '#6B7280' : '#9CA3AF')} />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Input Add Task ── */}
        <View className="flex-row items-center mb-8">
          <TextInput
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            placeholder={
              activeMilestoneId
                ? `Add task to "${milestones.find(m => m.id === activeMilestoneId)?.title}"...`
                : t('calendarComp.addNewTask')
            }
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

        {/* ── Ongoing Tasks ── */}
        {ongoingPlan && ongoingTasks.length > 0 && (
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Feather name="play-circle" size={14} color="#3B82F6" />
              <Text className="ml-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">
                {t('calendarComp.ongoing')}: {ongoingPlan.title}
              </Text>
            </View>
            <View className="gap-3">
              {ongoingTasks.map(task => (
                <View
                  key={task.id}
                  className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-2xl shadow-sm"
                >
                  <Pressable onPress={() => handleToggle(task.id)} className="mr-4">
                    <View className="w-6 h-6 rounded-md border-2 border-blue-300 dark:border-blue-600 items-center justify-center" />
                  </Pressable>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-blue-900 dark:text-blue-100">{task.title}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Active Tasks ── */}
        <View className="gap-3 mb-8">
          {activeTasks.length === 0 && completedTasks.length === 0 && ongoingTasks.length === 0 ? (
            <View className="items-center justify-center py-10 opacity-50">
              <Feather name="check-circle" size={40} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="text-gray-500 dark:text-gray-400 font-bold mt-4">
                {t('calendarComp.noTasksForThisDay')}
              </Text>
            </View>
          ) : (
            activeTasks.map(task => {
              const project = projects.find(p => p.id === task.projectId);
              const milestone = milestones.find(m => m.id === task.milestoneId);
              const accentColor = project?.color ?? '#3B82F6';
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
                    {/* Project + Milestone badges */}
                    <View className="flex-row items-center flex-wrap gap-x-2 mt-1">
                      {project && activeProjectId === 'all' && (
                        <View className="flex-row items-center">
                          <View className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: accentColor }} />
                          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {project.name}
                          </Text>
                        </View>
                      )}
                      {milestone && (
                        <View
                          className="flex-row items-center px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: accentColor + '18' }}
                        >
                          <Feather name="flag" size={9} color={accentColor} />
                          <Text
                            numberOfLines={1}
                            style={{ color: accentColor, maxWidth: 120 }}
                            className="text-[10px] font-bold ml-1"
                          >
                            {milestone.title}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => onScheduleTask?.(task)}
                      className="p-2 opacity-70 active:opacity-100 border border-gray-200 dark:border-gray-800 rounded-lg"
                    >
                      <Feather name="calendar" size={16} color="#3B82F6" />
                    </Pressable>
                    <Pressable
                      onPress={() => handleTogglePriority(task.id)}
                      className="p-2 active:opacity-70"
                    >
                      <Feather name="star" size={18} color={task.isPriority ? "#F59E0B" : (isDark ? "#4B5563" : "#D1D5DB")} fill={task.isPriority ? "#F59E0B" : "transparent"} />
                    </Pressable>
                    <Pressable onPress={() => deleteTask(task.id)} className="p-2 opacity-50 active:opacity-100">
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ── Completed Tasks ── */}
        {completedTasks.length > 0 && (
          <View>
            <Text className="text-sm font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mb-4">
              {t('calendarComp.completed')} ({completedTasks.length})
            </Text>
            <View className="gap-3 opacity-60">
              {completedTasks.map(task => {
                const milestone = milestones.find(m => m.id === task.milestoneId);
                const project = projects.find(p => p.id === task.projectId);
                const accentColor = project?.color ?? '#3B82F6';
                return (
                  <View
                    key={task.id}
                    className="flex-row items-center bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-900 p-4 rounded-2xl"
                  >
                    <Pressable onPress={() => handleToggle(task.id)} className="mr-4">
                      <View className="w-6 h-6 rounded-md bg-blue-600 items-center justify-center">
                        <Feather name="check" size={14} color="white" />
                      </View>
                    </Pressable>
                    <View className="flex-1">
                      <Text className="flex-1 text-base font-bold text-gray-400 dark:text-gray-600 line-through">
                        {task.title}
                      </Text>
                      {milestone && (
                        <View className="flex-row items-center mt-0.5">
                          <Feather name="flag" size={9} color={isDark ? '#4B5563' : '#9CA3AF'} />
                          <Text className="text-[10px] font-bold text-gray-400 dark:text-gray-600 ml-1" numberOfLines={1}>
                            {milestone.title}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Pressable onPress={() => deleteTask(task.id)} className="p-2 opacity-50 active:opacity-100">
                      <Feather name="trash-2" size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Project Creation Modal ── */}
      <Modal visible={isProjectModalVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-center px-6">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl">
              <Text className="text-xl font-black text-gray-900 dark:text-white mb-4">
                {t('calendarComp.createNewList')}
              </Text>

              <TextInput
                value={newProjectName}
                onChangeText={setNewProjectName}
                placeholder={t('calendarComp.listNamePlaceholder')}
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-gray-900 dark:text-white font-bold mb-6"
                autoFocus
              />

              <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {t('calendarComp.listColor')}
              </Text>
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

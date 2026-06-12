import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore, Milestone } from '@/store/useTaskStore';
import { Feather } from '@expo/vector-icons';
import { CalendarPicker } from './CalendarPicker';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  visible: boolean;
  milestone: Milestone | null;
  initialDate?: Date;
  onClose: () => void;
  onSave: (data: Partial<Milestone>) => void;
  onDelete: (id: string) => void;
}

const PALETTE = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

export function TimelineEditorModal({ visible, milestone, initialDate, onClose, onSave, onDelete }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [projectId, setProjectId] = useState<string | null>(null);
  const [isReminderEnabled, setIsReminderEnabled] = useState(true);

  const projects = useTaskStore(s => s.projects);

  useEffect(() => {
    setTitle(milestone?.title || '');
    setProjectId(milestone?.projectId || null);
    setIsReminderEnabled(milestone?.isReminderEnabled ?? true);
    
    if (milestone?.startDate) {
      setStartDate(new Date(milestone.startDate));
    } else if (initialDate) {
      setStartDate(initialDate);
    } else {
      setStartDate(new Date());
    }

    if (milestone?.date) {
      setEndDate(new Date(milestone.date));
    } else if (initialDate) {
      setEndDate(initialDate);
    } else {
      setEndDate(new Date());
    }
  }, [milestone, initialDate, visible]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({ 
      title: title.trim(), 
      startDate: startDate.toISOString(),
      date: endDate.toISOString(),
      projectId: projectId || undefined,
      isCompleted: milestone?.isCompleted || false,
      isReminderEnabled,
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 px-6 pt-4 pb-6"
        >
          <View className="flex-row justify-between items-center mb-8">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">
              {milestone ? 'Edit Timeline' : 'Timeline Baru'}
            </Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Text className="text-gray-500 font-bold px-2">X</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Judul Timeline (Milestone)</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="misal: MVP Selesai"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg mb-6 shadow-sm"
              autoFocus={!milestone?.title}
            />

            <View className="flex-row gap-3 mb-6">
              <View style={{ flex: 1 }}>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Mulai</Text>
                <CalendarPicker selectedDate={startDate} onSelectDate={setStartDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Selesai</Text>
                <CalendarPicker selectedDate={endDate} onSelectDate={setEndDate} />
              </View>
              <View style={{ width: 64 }}>
                <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider text-center">Pengingat</Text>
                <Pressable 
                  onPress={() => setIsReminderEnabled(!isReminderEnabled)}
                  className={`items-center justify-center rounded-2xl border h-[56px] ${
                    isReminderEnabled 
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50' 
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Text className={isReminderEnabled ? 'text-blue-500 text-xl' : 'text-gray-400 dark:text-gray-500 text-xl opacity-40 grayscale'}>
                    🔔
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Pilih Project</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
              <View className="flex-row gap-2 pr-6">
                <Pressable
                  onPress={() => setProjectId(null)}
                  className={`px-4 py-3 rounded-2xl border flex-row items-center gap-2 ${
                    projectId === null 
                      ? 'bg-gray-800 border-gray-800 dark:bg-white dark:border-white' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Text className={`font-bold ${projectId === null ? 'text-white dark:text-gray-900' : 'text-gray-500'}`}>Tidak Ada</Text>
                </Pressable>
                
                {projects.map(project => {
                  const isSelected = projectId === project.id;
                  const color = project.color || '#3B82F6';
                  return (
                    <Pressable
                      key={project.id}
                      onPress={() => setProjectId(project.id)}
                      className={`px-4 py-3 rounded-2xl border flex-row items-center gap-2 ${
                        isSelected 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50' 
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      }`}
                      style={isSelected ? { backgroundColor: `${color}20`, borderColor: `${color}50` } : undefined}
                    >
                      <Feather name="folder" size={14} color={isSelected ? color : "#6B7280"} />
                      <Text style={{ color: isSelected ? color : undefined }} className={`font-bold ${isSelected ? '' : 'text-gray-600 dark:text-gray-300'}`}>
                        {project.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

          </ScrollView>

          <View className="flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-900">
            {milestone && milestone.id !== '' && (
              <Pressable 
                onPress={() => onDelete(milestone.id)}
                className="bg-red-50 dark:bg-red-900/20 px-4 py-4 rounded-2xl items-center justify-center border border-red-100 dark:border-red-900/50"
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </Pressable>
            )}
            <Pressable 
              onPress={handleSave}
              className="flex-1 bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-black tracking-wider uppercase text-sm">SIMPAN</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

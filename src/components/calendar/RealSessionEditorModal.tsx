import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Session } from '@/types';
import { format } from 'date-fns';
import { formatLongTime } from '@/utils/time';

interface Props {
  visible: boolean;
  session: Session | null;
  onClose: () => void;
  onSave: (updates: Partial<Session>) => void;
  onDelete: (id: string) => void;
}

export function RealSessionEditorModal({ visible, session, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setDescription(session.description || '');
    }
  }, [session, visible]);

  if (!visible || !session) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-gray-950"
      >
        <SafeAreaView className="flex-1">
          <View className="flex-1 p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">Edit Session</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Text className="text-gray-500 font-bold px-2">X</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Read-only Time Info */}
            <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl mb-6 border border-blue-100 dark:border-blue-800/50">
              <Text className="text-blue-800 dark:text-blue-200 text-xs font-black tracking-widest uppercase mb-2">
                Recorded Time (Locked)
              </Text>
              <Text className="text-blue-900 dark:text-blue-100 font-bold mb-1 text-lg">
                {format(new Date(session.startTime), 'MMM d, yyyy')}
              </Text>
              <Text className="text-blue-700 dark:text-blue-300 font-medium">
                {format(new Date(session.startTime), 'h:mm a')} • Duration: {formatLongTime(session.durationSeconds)}
              </Text>
            </View>

            {/* Smart Mode Analytics Infographic */}
            {session.isSmartMode && session.focusDurationSeconds !== undefined && session.distractedDurationSeconds !== undefined && (
              <View className="mb-8">
                <View className="flex-row items-center gap-2 mb-4">
                  <Text className="text-lg">🤖</Text>
                  <Text className="text-gray-900 dark:text-white font-black text-lg">Smart Analytics</Text>
                </View>
                
                {/* Stat Cards */}
                <View className="flex-row gap-3 mb-4">
                  <View className="flex-1 bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-900/30">
                    <Text className="text-green-800 dark:text-green-300 text-[10px] font-black tracking-widest uppercase mb-1">Focused</Text>
                    <Text className="text-green-600 dark:text-green-400 font-bold text-lg">
                      {formatLongTime(session.focusDurationSeconds)}
                    </Text>
                  </View>
                  <View className="flex-1 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                    <Text className="text-red-800 dark:text-red-300 text-[10px] font-black tracking-widest uppercase mb-1">Distracted</Text>
                    <Text className="text-red-600 dark:text-red-400 font-bold text-lg">
                      {formatLongTime(session.distractedDurationSeconds)}
                    </Text>
                  </View>
                </View>

                {/* Progress Bar Chart */}
                <View className="w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full flex-row overflow-hidden mb-2">
                  <View 
                    style={{ width: `${(session.focusDurationSeconds / Math.max(1, session.durationSeconds)) * 100}%` }} 
                    className="h-full bg-green-500" 
                  />
                  <View 
                    style={{ width: `${(session.distractedDurationSeconds / Math.max(1, session.durationSeconds)) * 100}%` }} 
                    className="h-full bg-red-500" 
                  />
                </View>
                
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-xs font-bold">
                    {Math.round((session.focusDurationSeconds / Math.max(1, session.durationSeconds)) * 100)}% Focus
                  </Text>
                  <Text className="text-gray-500 text-xs font-bold">
                    {Math.round((session.distractedDurationSeconds / Math.max(1, session.durationSeconds)) * 100)}% Distracted
                  </Text>
                </View>
              </View>
            )}

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Task / Focus</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="What did you focus on?"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg mb-6"
            />

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description / Notes</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add some notes about this session..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-medium min-h-[120px]"
            />
          </ScrollView>

          <View className="flex-row gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-900 pb-4">
            <Pressable 
              onPress={() => onDelete(session.id)}
              className="bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-2xl items-center justify-center border border-red-100 dark:border-red-900/50"
            >
              <Text className="text-red-600 dark:text-red-400 font-black tracking-wider uppercase text-xs">Delete</Text>
            </Pressable>
            
            <Pressable 
              onPress={() => {
                if (title.trim()) {
                  onSave({ title, description });
                  onClose();
                }
              }}
              className="flex-1 bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-black tracking-wider uppercase text-sm">Save Changes</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
    </Modal>
  );
}

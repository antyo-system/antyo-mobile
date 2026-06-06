import { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (minutes: number) => void;
  initialMinutes?: number | null;
  skillName: string;
}

const PRESETS = [15, 30, 60, 120]; // minutes

export function SkillTargetModal({ visible, onClose, onSave, initialMinutes, skillName }: Props) {
  const isDark = useColorScheme() === 'dark';
  const [minutesStr, setMinutesStr] = useState(initialMinutes?.toString() || '');

  useEffect(() => {
    if (visible) {
      setMinutesStr(initialMinutes ? initialMinutes.toString() : '');
    }
  }, [visible, initialMinutes]);

  const handleSave = () => {
    const mins = parseInt(minutesStr);
    if (!isNaN(mins) && mins > 0) {
      onSave(mins);
    } else {
      onSave(0); // clear target
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        className="flex-1 justify-end bg-black/50"
      >
        <Pressable className="flex-1" onPress={onClose} />
        
        <View className="bg-white dark:bg-gray-900 rounded-t-3xl p-6 pb-10 shadow-2xl border-t border-gray-200 dark:border-gray-800">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-2xl font-black text-gray-900 dark:text-white">Daily Target</Text>
              <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1">{skillName}</Text>
            </View>
            <Pressable 
              onPress={onClose} 
              className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
            >
              <Feather name="x" size={16} color={isDark ? "white" : "black"} />
            </Pressable>
          </View>

          <View className="flex-row gap-2 mb-6">
            {PRESETS.map(mins => (
              <Pressable
                key={mins}
                onPress={() => setMinutesStr(mins.toString())}
                className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                  minutesStr === mins.toString()
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50'
                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <Text className={`font-bold ${
                  minutesStr === mins.toString()
                    ? 'text-orange-600 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}>
                  {mins >= 60 ? `${mins/60}h` : `${mins}m`}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Custom Minutes</Text>
          <View className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl flex-row items-center px-4 mb-8">
            <TextInput
              value={minutesStr}
              onChangeText={setMinutesStr}
              keyboardType="numeric"
              placeholder="e.g. 45"
              placeholderTextColor="#9ca3af"
              className="flex-1 py-4 text-gray-900 dark:text-white font-bold text-lg"
            />
            <Text className="text-gray-400 font-bold">mins / day</Text>
          </View>

          <Pressable 
            onPress={handleSave}
            className="w-full py-4 rounded-2xl items-center bg-orange-500 shadow-sm shadow-orange-500/30"
          >
            <Text className="text-white font-black text-lg">Save Target</Text>
          </Pressable>
          
          {(initialMinutes || 0) > 0 && (
            <Pressable 
              onPress={() => {
                onSave(0);
                onClose();
              }}
              className="w-full py-4 mt-2 items-center"
            >
              <Text className="text-red-500 font-bold">Remove Target</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

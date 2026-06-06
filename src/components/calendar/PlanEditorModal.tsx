import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plan, Recurrence } from '@/store/usePlanStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface Props {
  visible: boolean;
  plan: Plan | null;
  onClose: () => void;
  onSave: (planData: Partial<Plan>) => void;
  onDelete: (id: string) => void;
}

const formatMinsToTimeStr = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const PLAN_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const parseTimeInput = (str: string, defaultMins: number) => {
  const parts = str.split(':');
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
  }
  return defaultMins;
};

export function PlanEditorModal({ visible, plan, onClose, onSave, onDelete }: Props) {
  const { sleepStart, sleepEnd } = useSettingsStore();
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [isAllDay, setIsAllDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [isReminderEnabled, setIsReminderEnabled] = useState(true);
  const [color, setColor] = useState(PLAN_COLORS[2]); // Default yellow-ish

  useEffect(() => {
    setTitle(plan?.title || '');
    setRecurrence(plan?.recurrence || 'none');
    setRecurrenceDays(plan?.recurrenceDays || []);
    setIsAllDay(plan?.isAllDay || false);
    setNotes(plan?.notes || '');
    setIsReminderEnabled(plan?.isReminderEnabled ?? true);
    setColor(plan?.color || PLAN_COLORS[2]);
    
    if (plan && !isNaN(plan.startMinutes) && !plan?.isAllDay) {
      setStartTimeStr(formatMinsToTimeStr(plan.startMinutes));
      setEndTimeStr(formatMinsToTimeStr(plan.startMinutes + plan.durationMinutes));
    } else {
      setStartTimeStr('');
      setEndTimeStr('');
    }
  }, [plan, visible]);

  const handleTimeInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 3) {
      setter(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    } else {
      setter(cleaned);
    }
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    let startMinutes = 0;
    let durationMinutes = 1440;

    if (!isAllDay) {
      startMinutes = parseTimeInput(startTimeStr, plan ? plan.startMinutes : 9 * 60);
      let endMinutes = parseTimeInput(endTimeStr, startMinutes + 30);
      if (endMinutes <= startMinutes) endMinutes = startMinutes + 15; // enforce min 15m duration
      durationMinutes = endMinutes - startMinutes;
    } else {
      const wakeUpMins = parseTimeInput(sleepEnd, 6 * 60);
      const goSleepMins = parseTimeInput(sleepStart, 23 * 60);
      
      startMinutes = wakeUpMins;
      durationMinutes = goSleepMins > wakeUpMins 
        ? goSleepMins - wakeUpMins 
        : (24 * 60 - wakeUpMins) + goSleepMins;
    }

    onSave({ 
      title, 
      recurrence,
      recurrenceDays: recurrence === 'specific_days' ? recurrenceDays : undefined,
      startMinutes,
      durationMinutes,
      isAllDay,
      notes,
      isReminderEnabled,
      color
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
              {plan && plan.id && plan.title ? 'Edit Plan' : 'New Plan'}
            </Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Text className="text-gray-500 font-bold px-2">X</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Plan Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Deep Work"
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg mb-6 shadow-sm"
              autoFocus={!plan?.title}
            />

            <View className="flex-row items-center justify-between mb-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              <Text className="text-sm font-bold text-gray-700 dark:text-gray-300">All Day Plan</Text>
              <Switch value={isAllDay} onValueChange={setIsAllDay} />
            </View>

            {!isAllDay && (
              <View className="flex-row items-center justify-between mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <View className="flex-row items-center gap-2">
                  <Text className="text-lg">🔔</Text>
                  <View>
                    <Text className="text-sm font-bold text-blue-900 dark:text-blue-100">Remind Me</Text>
                    <Text className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">Auto-start focus timer at start time</Text>
                  </View>
                </View>
                <Switch 
                  value={isReminderEnabled} 
                  onValueChange={setIsReminderEnabled} 
                  trackColor={{ true: '#2563EB', false: '#D1D5DB' }}
                />
              </View>
            )}

            {!isAllDay && (
              <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Start Time</Text>
                  <TextInput
                    value={startTimeStr}
                    onChangeText={(val) => handleTimeInput(val, setStartTimeStr)}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="09:00"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center shadow-sm"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">End Time</Text>
                  <TextInput
                    value={endTimeStr}
                    onChangeText={(val) => handleTimeInput(val, setEndTimeStr)}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="09:30"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center shadow-sm"
                  />
                </View>
              </View>
            )}

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-4">Card Color</Text>
            <View className="flex-row justify-between mb-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              {PLAN_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-10 h-10 rounded-full items-center justify-center border-2 ${color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Text className="text-white font-bold">✓</Text>}
                </Pressable>
              ))}
            </View>

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Recurrence</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {(['none', 'daily', 'weekly', 'specific_days'] as Recurrence[]).map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setRecurrence(r)}
                  className={`px-4 py-2.5 rounded-full border ${
                    recurrence === r 
                      ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-500/30' 
                      : 'bg-transparent border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <Text className={`font-bold capitalize ${
                    recurrence === r ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {r === 'specific_days' ? 'Custom Days' : r}
                  </Text>
                </Pressable>
              ))}
            </View>

            {recurrence === 'specific_days' && (
              <View className="flex-row justify-between mb-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayStr, index) => {
                  const isSelected = recurrenceDays.includes(index);
                  return (
                    <Pressable
                      key={index}
                      onPress={() => {
                        if (isSelected) {
                          setRecurrenceDays(prev => prev.filter(d => d !== index));
                        } else {
                          setRecurrenceDays(prev => [...prev, index]);
                        }
                      }}
                      className={`w-10 h-10 rounded-full items-center justify-center border ${
                        isSelected 
                          ? 'bg-blue-600 border-blue-600 shadow-sm' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Text className={`font-bold ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                        {dayStr}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-4">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add details or context..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-medium text-base mb-8 shadow-sm min-h-[100px]"
            />


          </ScrollView>

          <View className="flex-row gap-4 mt-auto pt-4 border-t border-gray-100 dark:border-gray-900">
            {plan && plan.title && (
              <Pressable 
                onPress={() => onDelete(plan.id)}
                className="bg-red-50 dark:bg-red-900/20 px-6 py-4 rounded-2xl items-center justify-center border border-red-100 dark:border-red-900/50"
              >
                <Text className="text-red-600 dark:text-red-400 font-black tracking-wider uppercase text-xs">Delete</Text>
              </Pressable>
            )}
            <Pressable 
              onPress={handleSave}
              className="flex-1 bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-black tracking-wider uppercase text-sm">Save Plan</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

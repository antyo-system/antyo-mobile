import { useMasteryStore } from '@/store/useMasteryStore';
import { Recurrence, usePlanStore } from '@/store/usePlanStore';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const parseTimeInput = (str: string, defaultMins: number) => {
  const parts = str.split(':');
  if (parts.length === 2) {
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (!isNaN(h) && !isNaN(m)) return h * 60 + m;
  }
  return defaultMins;
};

export function NewSkillModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const addSkill = useMasteryStore(s => s.addSkill);
  const addPlan = usePlanStore(s => s.addPlan);

  const [skillName, setSkillName] = useState('');

  // Target
  const [dailyTarget, setDailyTarget] = useState('');

  // Pillars
  const [pillars, setPillars] = useState<string[]>([]);
  const [pillarInput, setPillarInput] = useState('');

  // Routine
  const [enableRoutine, setEnableRoutine] = useState(false);
  const [startTimeStr, setStartTimeStr] = useState('08:00');
  const [endTimeStr, setEndTimeStr] = useState('09:00');
  const [recurrence, setRecurrence] = useState<Recurrence>('daily');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  const handleTimeInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 3) {
      setter(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    } else {
      setter(cleaned);
    }
  };

  const handleAddPillar = () => {
    if (pillarInput.trim() && !pillars.includes(pillarInput.trim())) {
      setPillars([...pillars, pillarInput.trim()]);
      setPillarInput('');
    }
  };

  const handleRemovePillar = (name: string) => {
    setPillars(pillars.filter(p => p !== name));
  };

  const handleSave = () => {
    if (!skillName.trim()) return;

    const skillId = Date.now().toString();
    const targetMins = parseInt(dailyTarget);

    addSkill({
      id: skillId,
      name: skillName.trim(),
      icon: 'star',
      color: 'blue',
      dailyTargetMinutes: (!isNaN(targetMins) && targetMins > 0) ? targetMins : undefined,
      initialPillars: pillars.length > 0 ? pillars : undefined
    });

    if (enableRoutine) {
      const startMinutes = parseTimeInput(startTimeStr, 8 * 60);
      let endMinutes = parseTimeInput(endTimeStr, startMinutes + 60);
      if (endMinutes <= startMinutes) endMinutes = startMinutes + 15;
      const durationMinutes = endMinutes - startMinutes;

      addPlan({
        id: Date.now().toString() + '-routine',
        title: `${skillName.trim()} Routine`,
        startMinutes,
        durationMinutes,
        recurrence,
        recurrenceDays: recurrence === 'specific_days' ? recurrenceDays : undefined,
        baseDate: new Date().toISOString(),
        isAllDay: false,
        isReminderEnabled: true,
        color: '#3B82F6',
        skillId,
        pillarId: null // We don't link the routine to a specific pillar during skill creation for simplicity
      });
    }

    // Reset state
    setSkillName('');
    setDailyTarget('');
    setPillars([]);
    setPillarInput('');
    setEnableRoutine(false);
    setStartTimeStr('08:00');
    setEndTimeStr('09:00');
    setRecurrence('daily');
    setRecurrenceDays([]);

    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 px-6 pt-4 pb-6"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-black text-gray-900 dark:text-white">{t('newSkill.newSkill')}</Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Text className="text-gray-500 font-bold px-2">X</Text>
            </Pressable>
          </View>

          <ScrollView 
            className="flex-1" 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 120 }}
          >
            {/* Skill Name */}
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('newSkill.skillName')}</Text>
            <TextInput
              value={skillName}
              onChangeText={setSkillName}
              placeholder={t('newSkill.skillNamePlaceholder')}
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg mb-6 shadow-sm"
              autoFocus
            />

            {/* Daily Target */}
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('newSkill.dailyTarget')}</Text>
            <TextInput
              value={dailyTarget}
              onChangeText={setDailyTarget}
              placeholder={t('newSkill.dailyTargetPlaceholder')}
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg mb-6 shadow-sm"
            />

            {/* Subskills (Pillars) */}
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('newSkill.subskills')}</Text>
            <View className="flex-row gap-2 mb-3">
              <TextInput
                value={pillarInput}
                onChangeText={setPillarInput}
                placeholder={t('newSkill.subskillsPlaceholder')}
                placeholderTextColor="#9ca3af"
                className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-xl text-gray-900 dark:text-white font-medium shadow-sm"
                onSubmitEditing={handleAddPillar}
              />
              <Pressable
                onPress={handleAddPillar}
                className="bg-gray-200 dark:bg-gray-800 px-4 items-center justify-center rounded-xl"
              >
                <Feather name="plus" size={20} color={isDark ? "white" : "black"} />
              </Pressable>
            </View>

            {pillars.length > 0 && (
              <View className="flex-row flex-wrap gap-2 mb-6">
                {pillars.map(p => (
                  <View key={p} className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-900/50">
                    <Text className="text-sm font-bold text-blue-700 dark:text-blue-300 mr-2">{p}</Text>
                    <Pressable onPress={() => handleRemovePillar(p)}>
                      <Feather name="x" size={14} color="#3B82F6" />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
            {pillars.length === 0 && <View className="mb-6" />}

            {/* Routine Section */}
            <View className="flex-row justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 mb-4">
              <View>
                <Text className="text-base font-bold text-gray-900 dark:text-white">{t('newSkill.createRoutine')}</Text>
                <Text className="text-xs font-medium text-gray-500">{t('newSkill.createRoutineDesc')}</Text>
              </View>
              <Switch value={enableRoutine} onValueChange={setEnableRoutine} />
            </View>

            {enableRoutine && (
              <View className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl mb-8">
                <View className="flex-row gap-3 mb-4">
                  <View style={{ flex: 1 }}>
                    <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('newSkill.start')}</Text>
                    <TextInput
                      value={startTimeStr}
                      onChangeText={(val) => handleTimeInput(val, setStartTimeStr)}
                      keyboardType="numeric"
                      maxLength={5}
                      placeholder="08:00"
                      placeholderTextColor="#9ca3af"
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white font-bold text-center"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('newSkill.end')}</Text>
                    <TextInput
                      value={endTimeStr}
                      onChangeText={(val) => handleTimeInput(val, setEndTimeStr)}
                      keyboardType="numeric"
                      maxLength={5}
                      placeholder="09:00"
                      placeholderTextColor="#9ca3af"
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-xl text-gray-900 dark:text-white font-bold text-center"
                    />
                  </View>
                </View>

                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">{t('newSkill.recurrence')}</Text>
                <View className="flex-row flex-wrap gap-2 mb-4">
                  {([
                    { id: 'daily', label: t('newSkill.daily') },
                    { id: 'weekdays', label: t('newSkill.weekdays') },
                    { id: 'weekly', label: t('newSkill.weekly') },
                    { id: 'specific_days', label: t('newSkill.custom') },
                  ] as { id: Recurrence; label: string }[]).map((r) => (
                    <Pressable
                      key={r.id}
                      onPress={() => setRecurrence(r.id)}
                      className={[
                        'px-3 py-2 rounded-full border',
                        recurrence === r.id
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      ].join(' ')}
                    >
                      <Text className={[
                        'font-bold text-xs',
                        recurrence === r.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      ].join(' ')}>
                        {r.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {recurrence === 'specific_days' && (
                  <View className="flex-row justify-between bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                    {t('calendarComp.weekDaysInitial').split(',').map((dayStr, index) => {
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
                          className={`w-8 h-8 rounded-full items-center justify-center border ${isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}
                        >
                          <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                            {dayStr}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            <View className="h-12" />
          </ScrollView>

          <View className="pt-4 border-t border-gray-100 dark:border-gray-900 mt-auto">
            <Pressable
              onPress={handleSave}
              className={`py-4 rounded-2xl items-center shadow-sm ${skillName.trim() ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-800'}`}
              disabled={!skillName.trim()}
            >
              <Text className="text-white font-black tracking-wider uppercase text-sm">{t('newSkill.createSkillBtn')}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plan, Recurrence } from '@/store/usePlanStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useMasteryStore } from '@/store/useMasteryStore';
import { useTimerStore } from '@/store/useTimerStore';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { CalendarPicker } from './CalendarPicker';
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();
  const { sleepStart, sleepEnd } = useSettingsStore();
  const [title, setTitle] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [isAllDay, setIsAllDay] = useState(false);
  const [notes, setNotes] = useState('');
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [isReminderEnabled, setIsReminderEnabled] = useState(true);
  const [color, setColor] = useState(PLAN_COLORS[2]);
  const [planDate, setPlanDate] = useState(new Date());
  const [skillId, setSkillId] = useState<string | null>(null);
  const [pillarId, setPillarId] = useState<string | null>(null);

  const skills = useMasteryStore(s => s.skills);

  useEffect(() => {
    setTitle(plan?.title || '');
    setRecurrence(plan?.recurrence || 'none');
    setRecurrenceDays(plan?.recurrenceDays || []);
    setIsAllDay(plan?.isAllDay || false);
    setNotes(plan?.notes || '');
    setIsReminderEnabled(plan?.isReminderEnabled ?? true);
    setColor(plan?.color || PLAN_COLORS[2]);
    setSkillId(plan?.skillId || null);
    setPillarId(plan?.pillarId || null);
    
    // Set date from plan's baseDate or default to today
    if (plan?.baseDate) {
      setPlanDate(new Date(plan.baseDate));
    } else {
      setPlanDate(new Date());
    }
    
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

    // Use planDate directly for baseDate
    const baseDate = planDate.toISOString();

    onSave({ 
      title, 
      recurrence,
      recurrenceDays: recurrence === 'specific_days' ? recurrenceDays : undefined,
      startMinutes,
      durationMinutes,
      isAllDay,
      notes,
      isReminderEnabled,
      color,
      baseDate,
      skillId,
      pillarId
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
              {plan && plan.id && plan.title ? t('planEditor.editPlan') : t('planEditor.newPlan')}
            </Text>
            <Pressable onPress={onClose} className="p-2 -mr-2 bg-gray-100 dark:bg-gray-800 rounded-full">
              <Text className="text-gray-500 font-bold px-2">X</Text>
            </Pressable>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('planEditor.planTitle')}</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('planEditor.planTitlePlaceholder')}
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg mb-6 shadow-sm"
              autoFocus={!plan?.title}
            />

            {/* Date + All Day + Remind Me row */}
            <View className="flex-row gap-3 mb-4">
              <View style={{ flex: 2 }}>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('planEditor.date')}</Text>
                <CalendarPicker selectedDate={planDate} onSelectDate={setPlanDate} />
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider text-center">{t('planEditor.allDay')}</Text>
                <View className="items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 h-[56px]">
                  <Switch value={isAllDay} onValueChange={setIsAllDay} />
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider text-center">{t('planEditor.remind')}</Text>
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

            {!isAllDay && (
              <View className="flex-row gap-3 mb-4">
                <View style={{ flex: 1 }}>
                  <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('planEditor.start')}</Text>
                  <TextInput
                    value={startTimeStr}
                    onChangeText={(val) => handleTimeInput(val, setStartTimeStr)}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="09:00"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('planEditor.end')}</Text>
                  <TextInput
                    value={endTimeStr}
                    onChangeText={(val) => handleTimeInput(val, setEndTimeStr)}
                    keyboardType="numeric"
                    maxLength={5}
                    placeholder="09:30"
                    placeholderTextColor="#9ca3af"
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center"
                  />
                </View>
              </View>
            )}

            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('planEditor.color')}</Text>
            <View className="flex-row justify-between mb-6 bg-gray-50 dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800">
              {PLAN_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setColor(c)}
                  className={`w-9 h-9 rounded-full items-center justify-center border-2 ${color === c ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Text className="text-white font-bold text-xs">✓</Text>}
                </Pressable>
              ))}
            </View>

            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('planEditor.linkToSkill')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
              <View className="flex-row gap-2 pr-6">
                <Pressable
                  onPress={() => setSkillId(null)}
                  className={`px-4 py-3 rounded-2xl border flex-row items-center gap-2 ${
                    skillId === null 
                      ? 'bg-gray-800 border-gray-800 dark:bg-white dark:border-white' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                  }`}
                >
                  <Text className={`font-bold ${skillId === null ? 'text-white dark:text-gray-900' : 'text-gray-500'}`}>{t('planEditor.none')}</Text>
                </Pressable>
                
                {skills.map(skill => {
                  const isSelected = skillId === skill.id;
                  return (
                    <Pressable
                      key={skill.id}
                      onPress={() => {
                        setSkillId(skill.id);
                        const colorMap: Record<string, string> = {
                          'blue': '#3B82F6',
                          'green': '#10B981',
                          'yellow': '#F59E0B',
                          'red': '#EF4444',
                          'purple': '#8B5CF6',
                          'pink': '#EC4899',
                        };
                        const hex = colorMap[skill.color] || PLAN_COLORS[0];
                        setColor(hex);
                      }}
                      className={`px-4 py-3 rounded-2xl border flex-row items-center gap-2 ${
                        isSelected 
                          ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50' 
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <Feather name={skill.icon as any} size={14} color={isSelected ? "#F97316" : "#6B7280"} />
                      <Text className={`font-bold ${isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>
                        {skill.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {skillId && skills.find(s => s.id === skillId)?.pillars.length ? (
              <>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">{t('planEditor.linkToSubskill')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
                  <View className="flex-row gap-2 pr-6">
                    <Pressable
                      onPress={() => setPillarId(null)}
                      className={`px-4 py-2 rounded-2xl border flex-row items-center ${
                        pillarId === null 
                          ? 'bg-gray-800 border-gray-800 dark:bg-white dark:border-white' 
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${pillarId === null ? 'text-white dark:text-gray-900' : 'text-gray-500'}`}>{t('planEditor.none')}</Text>
                    </Pressable>
                    
                    {skills.find(s => s.id === skillId)?.pillars.map(pillar => {
                      const isSelected = pillarId === pillar.id;
                      return (
                        <Pressable
                          key={pillar.id}
                          onPress={() => setPillarId(pillar.id)}
                          className={`px-4 py-2 rounded-2xl border flex-row items-center ${
                            isSelected 
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50' 
                              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          <Text className={`text-xs font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                            {pillar.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
              </>
            ) : null}

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('planEditor.recurrence')}</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {([
                { id: 'none', label: t('planEditor.once') },
                { id: 'daily', label: t('planEditor.daily') },
                { id: 'weekdays', label: t('planEditor.weekdays') },
                { id: 'weekly', label: t('planEditor.weekly') },
                { id: 'monthly', label: t('planEditor.monthly') },
                { id: 'annually', label: t('planEditor.annually') },
                { id: 'specific_days', label: t('planEditor.customDays') },
              ] as { id: Recurrence; label: string }[]).map((r) => (
                <Pressable
                  key={r.id}
                  onPress={() => setRecurrence(r.id)}
                  className={[
                    'px-4 py-2.5 rounded-full border',
                    recurrence === r.id 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'bg-transparent border-gray-300 dark:border-gray-700'
                  ].join(' ')}
                >
                  <Text className={[
                    'font-bold',
                    recurrence === r.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                  ].join(' ')}>
                    {r.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {recurrence === 'specific_days' && (
              <View className="flex-row justify-between mb-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
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

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-4">{t('planEditor.notes')}</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder={t('planEditor.notesPlaceholder')}
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-medium text-base mb-8 shadow-sm min-h-[100px]"
            />


          </ScrollView>

          <View className="flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-900">
            {plan && plan.title && plan.id !== '' && (
              <Pressable 
                onPress={() => onDelete(plan.id)}
                className="bg-red-50 dark:bg-red-900/20 px-4 py-4 rounded-2xl items-center justify-center border border-red-100 dark:border-red-900/50"
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </Pressable>
            )}
            {plan && plan.id !== '' && !skillId && (
              <Pressable 
                onPress={() => {
                  let dur = 1440;
                  if (!isAllDay) {
                    const startMins = parseTimeInput(startTimeStr, 9 * 60);
                    let endMins = parseTimeInput(endTimeStr, startMins + 30);
                    if (endMins <= startMins) endMins = startMins + 15;
                    dur = endMins - startMins;
                  }
                  
                  const d = new Date(baseDate || new Date().toISOString());
                  const startMins = parseTimeInput(startTimeStr, 9 * 60);
                  d.setHours(Math.floor(startMins / 60), startMins % 60, 0, 0);
                  
                  const { addSession } = useSessionStore.getState();
                  addSession({
                    id: Date.now().toString(),
                    title: title || 'Life Activity',
                    startTime: d.toISOString(),
                    durationSeconds: dur * 60,
                    focusDurationSeconds: dur * 60,
                    distractedDurationSeconds: 0,
                    isSmartMode: false,
                    color: color,
                    skillId: null,
                    pillarId: null,
                  } as any);
                  onClose();
                }}
                className="bg-teal-50 dark:bg-teal-900/20 px-4 py-4 rounded-2xl items-center justify-center border border-teal-100 dark:border-teal-900/50"
              >
                <Feather name="check" size={20} color="#0D9488" />
              </Pressable>
            )}
            {plan && plan.id !== '' && skillId && (
              <Pressable 
                onPress={() => {
                  const timerStore = useTimerStore.getState();
                  timerStore.setSelectedSkillId(skillId);
                  if (pillarId) timerStore.setSelectedPillarId(pillarId);
                  
                  let dur = 1440;
                  if (!isAllDay) {
                    const startMins = parseTimeInput(startTimeStr, 9 * 60);
                    let endMins = parseTimeInput(endTimeStr, startMins + 30);
                    if (endMins <= startMins) endMins = startMins + 15;
                    dur = endMins - startMins;
                  }
                  timerStore.setDuration(dur * 60);
                  if (title) timerStore.setTitle(title);
                  
                  onClose();
                  router.push('/(tabs)');
                }}
                className="bg-green-50 dark:bg-green-900/20 px-4 py-4 rounded-2xl items-center justify-center border border-green-100 dark:border-green-900/50"
              >
                <Feather name="play" size={20} color="#10B981" />
              </Pressable>
            )}
            <Pressable 
              onPress={handleSave}
              className="flex-1 bg-blue-600 py-4 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-black tracking-wider uppercase text-sm">{t('planEditor.savePlan')}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

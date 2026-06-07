import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Session } from '@/types';
import { format } from 'date-fns';
import { formatLongTime } from '@/utils/time';
import { useMasteryStore } from '@/store/useMasteryStore';
import { Feather } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  session: Session | null;
  onClose: () => void;
  onSave: (updates: Partial<Session>) => void;
  onDelete: (id: string) => void;
}

const SESSION_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function RealSessionEditorModal({ visible, session, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(SESSION_COLORS[0]);
  
  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  
  const [skillId, setSkillId] = useState<string | null>(null);
  const [pillarId, setPillarId] = useState<string | null>(null);

  const skills = useMasteryStore(s => s.skills);

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setDescription(session.description || '');
      setColor(session.color || SESSION_COLORS[0]);
      setSkillId(session.skillId || null);
      setPillarId(session.pillarId || null);

      const startDate = new Date(session.startTime);
      const startH = startDate.getHours().toString().padStart(2, '0');
      const startM = startDate.getMinutes().toString().padStart(2, '0');
      setStartTimeStr(`${startH}:${startM}`);
      
      const endDate = new Date(startDate.getTime() + session.durationSeconds * 1000);
      const endH = endDate.getHours().toString().padStart(2, '0');
      const endM = endDate.getMinutes().toString().padStart(2, '0');
      setEndTimeStr(`${endH}:${endM}`);
    }
  }, [session, visible]);

  if (!visible || !session) return null;

  const handleTimeInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length >= 3) {
      setter(`${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`);
    } else {
      setter(cleaned);
    }
  };

  const parseTimeInput = (str: string, fallback: Date) => {
    const parts = str.split(':');
    if (parts.length === 2) {
      const h = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      if (!isNaN(h) && !isNaN(m)) {
        const d = new Date(session.startTime);
        d.setHours(h, m, 0, 0);
        return d;
      }
    }
    return fallback;
  };

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
            
            {/* Time Settings */}
            <View className="flex-row gap-4 mb-6">
              <View style={{ flex: 1 }}>
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Start Time</Text>
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
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">End Time</Text>
                <TextInput
                  value={endTimeStr}
                  onChangeText={(val) => handleTimeInput(val, setEndTimeStr)}
                  keyboardType="numeric"
                  maxLength={5}
                  placeholder="10:00"
                  placeholderTextColor="#9ca3af"
                  className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-bold text-lg text-center"
                />
              </View>
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

            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Link to Skill (Mastery)</Text>
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
                  <Text className={`font-bold ${skillId === null ? 'text-white dark:text-gray-900' : 'text-gray-500'}`}>None</Text>
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
                        const hex = colorMap[skill.color] || SESSION_COLORS[0];
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
                <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">Link to Subskill (Pillar)</Text>
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
                      <Text className={`text-xs font-bold ${pillarId === null ? 'text-white dark:text-gray-900' : 'text-gray-500'}`}>None</Text>
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

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Description / Notes</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Add some notes about this session..."
              placeholderTextColor="#9ca3af"
              multiline
              textAlignVertical="top"
              className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl text-gray-900 dark:text-white font-medium min-h-[120px] mb-6"
            />

            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 mt-2">Card Color</Text>
            <View className="flex-row justify-between mb-8 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
              {SESSION_COLORS.map(c => (
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
          </ScrollView>

          <View className="flex-row gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-900 pb-4">
            {session && session.id !== '' && (
              <Pressable 
                onPress={() => onDelete(session.id)}
                className="bg-red-50 dark:bg-red-900/20 px-4 py-4 rounded-2xl items-center justify-center border border-red-100 dark:border-red-900/50"
              >
                <Feather name="trash-2" size={20} color="#EF4444" />
              </Pressable>
            )}
            
            <Pressable 
              onPress={() => {
                if (title.trim()) {
                  let updates: Partial<Session> = { title, description, color, skillId, pillarId };
                  
                  const newStart = parseTimeInput(startTimeStr, new Date(session.startTime));
                  let newEnd = parseTimeInput(endTimeStr, new Date(newStart.getTime() + session.durationSeconds * 1000));
                  
                  if (newEnd <= newStart) {
                    newEnd = new Date(newStart.getTime() + 15 * 60 * 1000); // min 15 mins
                  }

                  const durSeconds = Math.floor((newEnd.getTime() - newStart.getTime()) / 1000);
                  updates.startTime = newStart.toISOString();
                  updates.durationSeconds = durSeconds;
                  
                  if (session.isSmartMode && session.focusDurationSeconds !== undefined) {
                    if (session.focusDurationSeconds > durSeconds) {
                       updates.focusDurationSeconds = durSeconds;
                       updates.distractedDurationSeconds = 0;
                    }
                  } else {
                     updates.focusDurationSeconds = durSeconds;
                  }

                  onSave(updates);
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

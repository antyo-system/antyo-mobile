import { useState, useRef } from 'react';
import { ScrollView, View, PanResponder, Pressable, Text, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';
import { useSessionStore } from '@/store/useSessionStore';
import { usePlanStore, Plan } from '@/store/usePlanStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Session } from '@/types';
import { TimelineHourMarkers } from '@/components/calendar/TimelineHourMarkers';
import { TimelineBlock } from '@/components/calendar/TimelineBlock';
import { InteractivePlanBlock } from '@/components/calendar/InteractivePlanBlock';
import { PlanEditorModal } from '@/components/calendar/PlanEditorModal';
import { RealSessionEditorModal } from '@/components/calendar/RealSessionEditorModal';
import { SettingsModal } from '@/components/stats/SettingsModal';
import { SleepBlock } from '@/components/calendar/SleepBlock';
import { TimelineNowIndicator } from '@/components/calendar/TimelineNowIndicator';
import { DateSelector } from '@/components/calendar/DateSelector';
import { getMinutesFromMidnight } from '@/utils/time';
import { isSameDay, isToday, addDays, subDays } from 'date-fns';
import { images } from '@/constants/images';

const PIXELS_PER_MINUTE = 1.5;

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const insets = useSafeAreaInsets();
  
  // Real Sessions
  const sessions = useSessionStore(s => s.sessions);
  const updateSession = useSessionStore(s => s.updateSession);
  const removeSession = useSessionStore(s => s.removeSession);
  const dailySessions = sessions.filter(s => isSameDay(new Date(s.startTime), selectedDate));
  
  // Planned Sessions (The Engine)
  const plans = usePlanStore(s => s.plans);
  const addPlan = usePlanStore(s => s.addPlan);
  const updatePlan = usePlanStore(s => s.updatePlan);
  const deletePlan = usePlanStore(s => s.deletePlan);

  const [activeTab, setActiveTab] = useState<'plan' | 'real'>('plan');
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [realEditorVisible, setRealEditorVisible] = useState(false);
  const [editingRealSession, setEditingRealSession] = useState<Session | null>(null);
  
  const { sleepStart, sleepEnd } = useSettingsStore();
  const [settingsVisible, setSettingsVisible] = useState(false);

  // Calculate Sleep Blocks
  const parseMins = (str: string) => {
    const parts = str.split(':');
    if (parts.length !== 2) return 0;
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  };
  const sleepStartMins = parseMins(sleepStart || '23:00');
  const sleepEndMins = parseMins(sleepEnd || '06:00');
  const sleepBlocks = [];
  if (sleepStartMins > sleepEndMins) {
    sleepBlocks.push({ start: 0, duration: sleepEndMins });
    sleepBlocks.push({ start: sleepStartMins, duration: 24 * 60 - sleepStartMins });
  } else if (sleepStartMins < sleepEndMins) {
    sleepBlocks.push({ start: sleepStartMins, duration: sleepEndMins - sleepStartMins });
  }

  // Recurrence logic parsing for the current selected date
  const dailyPlans = plans.filter(p => {
    if (p.recurrence === 'daily') return true;
    if (p.recurrence === 'weekly' && new Date(p.baseDate).getDay() === selectedDate.getDay()) return true;
    if (p.recurrence === 'specific_days' && p.recurrenceDays?.includes(selectedDate.getDay())) return true;
    return isSameDay(new Date(p.baseDate), selectedDate);
  });
  
  const isSelectedToday = isToday(selectedDate);

  // Bulletproof native swiping that won't crash on unlinked gesture handler libraries
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only capture horizontal swipes to avoid blocking the vertical scroll
        return Math.abs(gestureState.dx) > 30 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -50) {
          setSelectedDate(prev => addDays(prev, 1));
        } else if (gestureState.dx > 50) {
          setSelectedDate(prev => subDays(prev, 1));
        }
      },
    })
  ).current;

  const handleCreateNew = () => {
    setEditingPlan(null);
    setEditorVisible(true);
  };

  const handleEditPress = (plan: Plan) => {
    setEditingPlan(plan);
    setEditorVisible(true);
  };

  const handleSavePlan = (data: Partial<Plan>) => {
    // If it exists in the store, update it. Otherwise, add it.
    if (editingPlan && plans.some(p => p.id === editingPlan.id)) {
      updatePlan(editingPlan.id, data);
    } else {
      addPlan({
        id: editingPlan ? editingPlan.id : Date.now().toString(),
        title: data.title || 'New Plan',
        startMinutes: data.startMinutes ?? (editingPlan ? editingPlan.startMinutes : 9 * 60),
        durationMinutes: data.durationMinutes ?? (editingPlan ? editingPlan.durationMinutes : 30),
        recurrence: data.recurrence || 'none',
        recurrenceDays: data.recurrenceDays,
        baseDate: selectedDate.toISOString(),
      });
    }
    setEditorVisible(false);
  };

  const handleTimelinePress = (e: any) => {
    // Capture the Y coordinate to determine the time tapped
    const y = e.nativeEvent.locationY;
    let clickedMinutes = Math.round(y / PIXELS_PER_MINUTE);
    clickedMinutes = Math.floor(clickedMinutes / 15) * 15; // Snap down to nearest 15 mins block
    
    // Auto-create a new 30 minute plan at that exact time
    setEditingPlan({
      id: Date.now().toString(),
      title: '',
      startMinutes: clickedMinutes,
      durationMinutes: 30,
      recurrence: 'none',
      baseDate: selectedDate.toISOString(),
    });
    setEditorVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top']}>
      {/* Force hide the duplicate Expo Router header */}
      <Tabs.Screen options={{ headerShown: false }} />
      
      <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      
      {/* PLAN vs REAL Minimalist Toggle */}
      <View className="flex-row bg-white dark:bg-gray-950 py-2.5 z-10 border-b border-gray-100 dark:border-gray-900 justify-center gap-12 shadow-sm">
        <Pressable 
          onPress={() => setActiveTab('plan')}
          className="items-center justify-center py-1 px-4"
        >
          <Text className={`text-[10px] font-black tracking-[0.2em] uppercase ${
            activeTab === 'plan' ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-400 dark:text-gray-600'
          }`}>
            Plan
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setActiveTab('real')}
          className="items-center justify-center py-1 px-4"
        >
          <Text className={`text-[10px] font-black tracking-[0.2em] uppercase ${
            activeTab === 'real' ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-600'
          }`}>
            Real
          </Text>
        </Pressable>
      </View>

      <View className="flex-1" {...panResponder.panHandlers}>
        <ScrollView 
          className="flex-1"
          scrollEnabled={isScrollEnabled}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 150 }}
        >
          {/* Wrap absolute elements in a sized Pressable to catch taps and allow edge padding */}
          <Pressable 
            style={{ height: 24 * 60 * PIXELS_PER_MINUTE }}
            onPress={handleTimelinePress}
          >
            <TimelineHourMarkers pixelsPerMinute={PIXELS_PER_MINUTE} />
        
        {/* Render Sleep Blocks */}
        {sleepBlocks.map((block, i) => (
          <SleepBlock 
            key={`sleep-${i}`}
            startMinutes={block.start}
            durationMinutes={block.duration}
            pixelsPerMinute={PIXELS_PER_MINUTE}
            onPress={() => setSettingsVisible(true)}
          />
        ))}

        {/* Render Planned Blocks */}
        {dailyPlans.map(plan => (
          <View 
            key={plan.id} 
            style={{ opacity: activeTab === 'plan' ? 1 : 0.35, zIndex: activeTab === 'plan' ? 30 : 10 }}
            pointerEvents={activeTab === 'plan' ? 'box-none' : 'none'}
          >
            <InteractivePlanBlock
              plan={plan}
              pixelsPerMinute={PIXELS_PER_MINUTE}
              onUpdatePlan={updatePlan}
              onEditPress={handleEditPress}
              setScrollEnabled={setIsScrollEnabled}
            />
          </View>
        ))}

        {/* Render Real Sessions */}
        {dailySessions.map(session => (
          <View 
            key={session.id} 
            style={{ opacity: activeTab === 'real' ? 1 : 0.35, zIndex: activeTab === 'real' ? 30 : 10 }}
            pointerEvents={activeTab === 'real' ? 'box-none' : 'none'}
          >
            <TimelineBlock
              title={session.title}
              startMinutes={getMinutesFromMidnight(session.startTime)}
              durationMinutes={session.durationSeconds / 60}
              pixelsPerMinute={PIXELS_PER_MINUTE}
              type="real"
              onPress={() => {
                setEditingRealSession(session);
                setRealEditorVisible(true);
              }}
            />
          </View>
        ))}
        
        {/* Render the current time red line indicator if viewing today */}
        {isSelectedToday && <TimelineNowIndicator pixelsPerMinute={PIXELS_PER_MINUTE} />}
        
        {/* Empty State Watermark Removed */}

        {/* Center Divider Line */}
        <View className="absolute top-0 bottom-0 left-[52.5%] w-[1px] bg-gray-100 dark:bg-gray-800 pointer-events-none" />
          </Pressable>
        </ScrollView>
      </View>

      {/* Floating Action Button (FAB) */}
      <Pressable 
        onPress={handleCreateNew}
        className="absolute right-6 w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50 z-50"
        style={{ bottom: Math.max(insets.bottom + 84, 112) }}
      >
        <Text className="text-white text-3xl leading-none mt-[-2px]">+</Text>
      </Pressable>

      <PlanEditorModal 
        visible={editorVisible}
        plan={editingPlan}
        onClose={() => setEditorVisible(false)}
        onSave={handleSavePlan}
        onDelete={(id) => {
          deletePlan(id);
          setEditorVisible(false);
        }}
      />

      <RealSessionEditorModal 
        visible={realEditorVisible}
        session={editingRealSession}
        onClose={() => setRealEditorVisible(false)}
        onSave={(updates) => {
          if (editingRealSession) updateSession(editingRealSession.id, updates);
        }}
        onDelete={(id) => {
          removeSession(id);
          setRealEditorVisible(false);
        }}
      />

      <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
    </SafeAreaView>
  );
}

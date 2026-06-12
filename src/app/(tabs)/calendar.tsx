import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { View, PanResponder, Pressable, Text, Image, Platform, Dimensions, Alert } from 'react-native';
import { PinchGestureHandler, State, ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Tabs, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSessionStore } from '@/store/useSessionStore';
import { usePlanStore, Plan } from '@/store/usePlanStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Session } from '@/types';
import { TimelineDateMarkers } from '@/components/calendar/TimelineDateMarkers';
import { TimelineHourMarkers } from '@/components/calendar/TimelineHourMarkers';
import { TimelineBlock } from '@/components/calendar/TimelineBlock';
import { InteractivePlanBlock } from '@/components/calendar/InteractivePlanBlock';
import { PlanEditorModal } from '@/components/calendar/PlanEditorModal';
import { PlanQuickActionModal } from '@/components/calendar/PlanQuickActionModal';
import { TaskScheduleModal } from '@/components/calendar/TaskScheduleModal';
import { RealSessionEditorModal } from '@/components/calendar/RealSessionEditorModal';
import { MonthlyCalendarModal } from '@/components/calendar/MonthlyCalendarModal';
import { QuickSleepEditorModal } from '@/components/calendar/QuickSleepEditorModal';
import { TimelineEditorModal } from '@/components/calendar/TimelineEditorModal';
import { TimelineQuickActionModal, TimelineRenderedPlan } from '@/components/calendar/TimelineQuickActionModal';
import { InteractiveTimelineBlock } from '@/components/calendar/InteractiveTimelineBlock';
import { useMasteryStore } from '@/store/useMasteryStore';
import { Milestone } from '@/store/useTaskStore';
import { SleepBlock } from '@/components/calendar/SleepBlock';
import { TimelineNowIndicator } from '@/components/calendar/TimelineNowIndicator';
import { DateSelector } from '@/components/calendar/DateSelector';
import { OnTheRadar } from '@/components/calendar/OnTheRadar';
import { calculateStreak } from '@/utils/streak';
import { ScheduleFeedView } from '@/components/calendar/ScheduleFeedView';
import { TaskListView } from '@/components/calendar/TaskListView';
import { getMinutesFromMidnight } from '@/utils/time';
import { getPlansForDate } from '@/utils/calendar';
import { isSameDay, isToday, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfDay, differenceInDays, startOfMonth, endOfMonth } from 'date-fns';
import { images } from '@/constants/images';
import { useAppStore } from '@/store/useAppStore';
import { SpotlightOverlay, SpotlightStep, SpotlightCoords } from '@/components/tutorial/SpotlightOverlay';
import { useTranslation } from '@/hooks/useTranslation';


function calculateLayout<T extends { startMinutes: number; durationMinutes?: number; durationSeconds?: number }>(items: T[]) {
  const sorted = [...items].sort((a, b) => {
    const aStart = a.startMinutes;
    const bStart = b.startMinutes;
    if (aStart !== bStart) return aStart - bStart;
    const aDur = a.durationMinutes ?? Math.round((a.durationSeconds || 0) / 60);
    const bDur = b.durationMinutes ?? Math.round((b.durationSeconds || 0) / 60);
    return bDur - aDur;
  });

  const layoutItems: (T & { _left: number; _width: number })[] = [];
  let columns: T[][] = [];
  let lastEventEnding: number | null = null;

  for (const item of sorted) {
    const start = item.startMinutes;
    const duration = item.durationMinutes ?? Math.max(1, Math.round((item.durationSeconds || 0) / 60));
    const end = start + duration;

    if (lastEventEnding !== null && start >= lastEventEnding) {
      packColumns(columns, layoutItems);
      columns = [];
      lastEventEnding = null;
    }

    let placed = false;
    for (const col of columns) {
      const lastEventInCol = col[col.length - 1];
      const lastEnd = lastEventInCol.startMinutes + (lastEventInCol.durationMinutes ?? Math.max(1, Math.round((lastEventInCol.durationSeconds || 0) / 60)));
      if (start >= lastEnd) {
        col.push(item);
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      columns.push([item]);
    }

    if (lastEventEnding === null || end > lastEventEnding) {
      lastEventEnding = end;
    }
  }

  if (columns.length > 0) {
    packColumns(columns, layoutItems);
  }

  function packColumns(cols: T[][], result: any[]) {
    const numCols = cols.length;
    for (let i = 0; i < numCols; i++) {
      for (const item of cols[i]) {
        const start = item.startMinutes;
        const duration = item.durationMinutes ?? Math.max(1, Math.round((item.durationSeconds || 0) / 60));
        const end = start + duration;
        
        let colSpan = 1;
        for (let j = i + 1; j < numCols; j++) {
           let overlaps = false;
           for (const ev of cols[j]) {
              const evStart = ev.startMinutes;
              const evDur = ev.durationMinutes ?? Math.max(1, Math.round((ev.durationSeconds || 0) / 60));
              const evEnd = evStart + evDur;
              if (start < evEnd && end > evStart) {
                 overlaps = true;
                 break;
              }
           }
           if (overlaps) break;
           colSpan++;
        }
        
        result.push({
           ...item,
           _left: (i / numCols) * 100,
           _width: (colSpan / numCols) * 100
        });
      }
    }
  }

  return layoutItems;
}

export default function CalendarScreen() {
  const { t, language } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCompareMode, setIsCompareMode] = useState(true);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  // Zoom state
  const [baseScale, setBaseScale] = useState(1);
  const [pinchScale, setPinchScale] = useState(1);
  const zoomScale = Math.min(Math.max(0.5, baseScale * pinchScale), 3);

  const PIXELS_PER_MINUTE = 1.5 * zoomScale;
  const PIXELS_PER_DAY = 150 * zoomScale;

  const onPinchGestureEvent = useCallback((event: any) => {
    setPinchScale(event.nativeEvent.scale);
  }, []);

  const onPinchHandlerStateChange = useCallback((event: any) => {
    if (event.nativeEvent.state === State.END) {
      setBaseScale(prev => Math.min(Math.max(0.5, prev * event.nativeEvent.scale), 3));
      setPinchScale(1);
    }
  }, []);
  
  // Tutorial State
  const { hasSeenCalendarTutorial, setTutorialSeen } = useAppStore();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<SpotlightStep[]>([]);
  const isFocused = useIsFocused();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: tutorialVisible ? { display: 'none' } : undefined
    });
  }, [navigation, tutorialVisible]);
  
  const dateRef = useRef<View>(null);
  const toggleRef = useRef<View>(null);
  const fabRef = useRef<View>(null);
  const rootRef = useRef<View>(null);
  const bodyRef = useRef<View>(null);

  useEffect(() => {
    if (!hasSeenCalendarTutorial && isFocused) {
      setTutorialSteps([
        { targetRef: dateRef, text: t('tutorial.calendar.step1'), holeType: 'rect', holePadding: 8 },
        { targetRef: toggleRef, text: t('tutorial.calendar.step2'), holeType: 'rect', holePadding: 8 },
        { targetRef: toggleRef, text: t('tutorial.calendar.step3'), holeType: 'rect', holePadding: 8 },
        { targetRef: fabRef, text: t('tutorial.calendar.step4'), holeType: 'circle', holePadding: 16, buttonText: t('planEditor.start') },
      ]);
      const timeout = setTimeout(() => {
        setTutorialVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenCalendarTutorial, isFocused, t]);

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

  const [activeTab, setActiveTab] = useState<'plan' | 'timeline' | 'real' | 'task'>('plan');
  const [isLocked, setIsLocked] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const [editorVisible, setEditorVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [quickActionVisible, setQuickActionVisible] = useState(false);
  const [quickActionPlan, setQuickActionPlan] = useState<Plan | null>(null);

  const [taskScheduleVisible, setTaskScheduleVisible] = useState(false);
  const [taskToSchedule, setTaskToSchedule] = useState<any | null>(null);
  const [realEditorVisible, setRealEditorVisible] = useState(false);
  const [quickSleepVisible, setQuickSleepVisible] = useState(false);
  const [editingRealSession, setEditingRealSession] = useState<Session | null>(null);

  const [timelineEditorVisible, setTimelineEditorVisible] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  
  const [timelineQuickActionVisible, setTimelineQuickActionVisible] = useState(false);
  const [timelineQuickActionPlan, setTimelineQuickActionPlan] = useState<TimelineRenderedPlan | null>(null);
  
  const addMilestone = useTaskStore(s => s.addMilestone);
  const updateMilestone = useTaskStore(s => s.updateMilestone);
  const deleteMilestone = useTaskStore(s => s.deleteMilestone);
  const tasks = useTaskStore(s => s.tasks);
  
  const verticalScrollRef = useRef<ScrollView>(null);
  
  const { sleepStart, sleepEnd, dailyFocusTargetHours } = useSettingsStore();
  const skills = useMasteryStore(s => s.skills);

  const { achievedDates } = useMemo(() => calculateStreak(sessions, dailyFocusTargetHours), [sessions, dailyFocusTargetHours]);

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
  const dailyPlansRaw = useMemo(() => getPlansForDate(plans, selectedDate), [plans, selectedDate]);
  
  const dailyPlans = useMemo(() => calculateLayout(dailyPlansRaw), [dailyPlansRaw]);

  const topPriorityItem = useMemo(() => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const topTask = tasks.find(t => t.baseDate === selectedDateString && t.isPriority && !t.completed);
    if (topTask) return { type: 'task', title: topTask.title };
    
    const topPlan = dailyPlansRaw.find(p => p.isPriority);
    if (topPlan) return { type: 'plan', title: topPlan.title };
    
    return null;
  }, [tasks, dailyPlansRaw, selectedDate]);
  
  const dailySessionsWithStartMins = useMemo(() => 
    dailySessions.map(s => ({
      ...s,
      startMinutes: getMinutesFromMidnight(s.startTime)
    })), 
  [dailySessions]);
  
  const dailySessionsLayout = useMemo(() => calculateLayout(dailySessionsWithStartMins), [dailySessionsWithStartMins]);
  
  const isSelectedToday = isToday(selectedDate);

  // --- TIMELINE MODE LOGIC ---
  const timelineDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);
  
  const timelineStart = timelineDays[0];
  const milestones = useTaskStore(s => s.milestones);
  const projects = useTaskStore(s => s.projects);
  const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

  const timelinePlans = useMemo(() => {
    if (activeTab !== 'timeline') return [];
    
    const mappedMilestones = milestones.filter(m => {
      if (!m.date || !m.projectId) return false;
      const endDate = startOfDay(new Date(m.date));
      const startDate = m.startDate ? startOfDay(new Date(m.startDate)) : endDate;
      return endDate >= timelineDays[0] && startDate <= timelineDays[timelineDays.length - 1];
    }).map(m => {
      const p = projectMap.get(m.projectId!);
      const endDate = startOfDay(new Date(m.date));
      const startDate = m.startDate ? startOfDay(new Date(m.startDate)) : endDate;
      
      const startDayIndex = differenceInDays(startDate, timelineStart);
      const endDayIndex = differenceInDays(endDate, timelineStart);
      
      const top = Math.max(0, startDayIndex) * PIXELS_PER_DAY;
      const bottom = Math.min(timelineDays.length, endDayIndex + 1) * PIXELS_PER_DAY;
      const height = bottom - top;

      return {
        id: m.id,
        type: 'milestone',
        title: m.title,
        color: p?.color || '#3B82F6',
        _left: 0,
        _width: 100,
        top,
        height,
        isCompleted: m.isCompleted,
        isPriority: false, // Milestones don't have priority yet
        raw: m
      };
    });

    const allDayPlans = plans.filter(p => {
      if (!p.isAllDay) return false;
      const pDate = startOfDay(new Date(p.baseDate || (p as any).date)); // Fallback to date for backward compat
      return pDate >= timelineDays[0] && pDate <= timelineDays[timelineDays.length - 1];
    }).map(p => {
      const pDate = startOfDay(new Date(p.baseDate || (p as any).date));
      const dayIndex = differenceInDays(pDate, timelineStart);
      const top = dayIndex * PIXELS_PER_DAY;
      const height = PIXELS_PER_DAY;

      return {
        id: p.id,
        type: 'allday',
        title: p.title,
        color: p.color || '#F59E0B',
        _left: 0,
        _width: 100,
        top,
        height,
        isCompleted: false, // Or map to a state if we have one
        isPriority: p.isPriority,
        raw: p
      };
    });

    return [...mappedMilestones, ...allDayPlans];
  }, [milestones, projectMap, timelineStart, timelineDays, activeTab, plans]);

  const timelineSessionsLayout = useMemo(() => {
    if (activeTab !== 'timeline') return [];
    const validSkillIds = new Set(projects.map(p => p.skillId).filter(Boolean));
    const projectBySkillId = new Map(projects.filter(p => p.skillId).map(p => [p.skillId, p]));

    const filtered = sessions.filter(s => {
      if (!s.skillId || !validSkillIds.has(s.skillId)) return false;
      const sDate = startOfDay(new Date(s.startTime));
      return sDate >= timelineDays[0] && sDate <= timelineDays[timelineDays.length - 1];
    });

    const sessionsByDayAndProject = new Map<string, any>();
    filtered.forEach(s => {
      const sDate = startOfDay(new Date(s.startTime));
      const p = projectBySkillId.get(s.skillId!)!;
      const key = `${sDate.toISOString()}_${p.id}`;
      if (!sessionsByDayAndProject.has(key)) {
        sessionsByDayAndProject.set(key, { date: sDate, project: p, durationMins: 0, count: 0 });
      }
      const data = sessionsByDayAndProject.get(key);
      data.durationMins += Math.round(s.durationSeconds / 60);
      data.count += 1;
    });

    return Array.from(sessionsByDayAndProject.values()).map(data => {
      const dayIndex = differenceInDays(data.date, timelineStart);
      const top = dayIndex * PIXELS_PER_DAY + 5;
      const height = PIXELS_PER_DAY - 10;
      return {
        id: `${data.date.toISOString()}_${data.project.id}`,
        title: `${data.project.name} (${data.count}x)`,
        duration: data.durationMins,
        color: data.project.color,
        top,
        height,
        _left: 0,
        _width: 100,
      };
    });
  }, [sessions, projects, timelineStart, timelineDays, activeTab]);

  // Bulletproof native swiping that won't crash on unlinked gesture handler libraries
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Prevent pan responder from killing pinch gesture
        if (evt.nativeEvent.touches && evt.nativeEvent.touches.length > 1) return false;
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

  // Auto-scroll to current time when Today is selected
  useEffect(() => {
    if (isSelectedToday) {
      setTimeout(() => {
        if (activeTab === 'timeline') {
          const todayIndex = timelineDays.findIndex(d => isToday(d));
          if (todayIndex !== -1) {
            const yPos = Math.max(0, todayIndex * PIXELS_PER_DAY - 150);
            verticalScrollRef.current?.scrollTo({ y: yPos, animated: true });
          }
        } else {
          const currentMins = getMinutesFromMidnight(new Date().toISOString());
          // Calculate Y position of current time, subtract ~300px to center it on screen
          const yPos = Math.max(0, currentMins * PIXELS_PER_MINUTE - 300);
          verticalScrollRef.current?.scrollTo({ y: yPos, animated: true });
        }
      }, 100);
    }
  }, [selectedDate, isSelectedToday, activeTab, timelineDays]);

  const handleCreateNew = () => {
    if (activeTab === 'timeline') {
      setEditingMilestone(null);
      setTimelineEditorVisible(true);
    } else {
      setEditingPlan(null);
      setEditorVisible(true);
    }
  };

  const handleEditPress = useCallback((plan: Plan) => {
    setQuickActionPlan(plan);
    setQuickActionVisible(true);
  }, []);

  const handleSleepBlockPress = useCallback(() => {
    setQuickSleepVisible(true);
  }, []);

  const handleSavePlan = (data: Partial<Plan>) => {
    const planId = editingPlan ? editingPlan.id : Date.now().toString();
    // If it exists in the store, update it. Otherwise, add it.
    if (editingPlan && plans.some(p => p.id === editingPlan.id)) {
      updatePlan(editingPlan.id, data);
    } else {
      addPlan({
        id: planId,
        title: data.title || 'New Plan',
        startMinutes: data.startMinutes ?? (editingPlan ? editingPlan.startMinutes : 9 * 60),
        durationMinutes: data.durationMinutes ?? (editingPlan ? editingPlan.durationMinutes : 30),
        recurrence: data.recurrence || 'none',
        recurrenceDays: data.recurrenceDays,
        baseDate: data.baseDate || selectedDate.toISOString(),
        color: data.color,
        skillId: data.skillId,
      });
    }

    if (linkedTaskId) {
      const { assignTaskToPlan } = useTaskStore.getState();
      assignTaskToPlan(linkedTaskId, planId);
      setLinkedTaskId(null); // reset
    }

    setEditorVisible(false);
  };

  const handleUpdateTimelineDates = useCallback((id: string, type: 'milestone' | 'allday', deltaStart: number, deltaEnd: number) => {
    if (deltaStart === 0 && deltaEnd === 0) return;
    if (type === 'milestone') {
      const m = milestones.find(x => x.id === id);
      if (m) {
        const currentEndDate = new Date(m.date);
        const currentStartDate = m.startDate ? new Date(m.startDate) : currentEndDate;
        const newStartDate = addDays(currentStartDate, deltaStart);
        const newEndDate = addDays(currentEndDate, deltaEnd);
        updateMilestone(id, { 
          startDate: newStartDate.toISOString(), 
          date: newEndDate.toISOString() 
        });
      }
    } else if (type === 'allday') {
      const p = plans.find(x => x.id === id);
      if (p) {
        const currentDate = new Date(p.baseDate || (p as any).date);
        const newDate = addDays(currentDate, deltaStart);
        updatePlan(id, { baseDate: newDate.toISOString() });
      }
    }
  }, [milestones, plans, updateMilestone, updatePlan]);

  const handleTimelineMarkDone = useCallback(() => {
    if (timelineQuickActionPlan?.type === 'milestone') {
      const toggleMilestone = useTaskStore.getState().toggleMilestone;
      toggleMilestone(timelineQuickActionPlan.id);
    }
    setTimelineQuickActionVisible(false);
  }, [timelineQuickActionPlan]);

  const handleTimelinePress = (e: any) => {
    if (isLocked) return;
    
    const y = e.nativeEvent.locationY ?? e.nativeEvent.offsetY ?? 0;
    const x = e.nativeEvent.locationX ?? e.nativeEvent.offsetX ?? 0;
    const screenWidth = Dimensions.get('window').width;

    let clickedMinutes = Math.round(y / PIXELS_PER_MINUTE);
    clickedMinutes = Math.floor(clickedMinutes / 15) * 15; // Snap down to nearest 15 mins block
    
    let isTappingReal = activeTab === 'real';

    if (isCompareMode) {
      if (x > screenWidth / 2) {
        isTappingReal = true;
      } else {
        isTappingReal = false;
      }
    }

    if (isTappingReal) {
      Alert.alert(
        t('calendar.strictRealTitle') || 'Strict Tracking',
        t('calendar.strictRealMessage') || 'Real sessions can only be logged using the Focus Timer or by completing a Plan. Stay honest to the Mastery process!'
      );
      return;
    }

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

  const [linkedTaskId, setLinkedTaskId] = useState<string | null>(null);

  const handleScheduleTask = useCallback((task: any) => {
    setTaskToSchedule(task);
    setTaskScheduleVisible(true);
  }, []);

  const handleCreateNewFromTask = useCallback(() => {
    setTaskScheduleVisible(false);
    if (!taskToSchedule) return;

    setLinkedTaskId(taskToSchedule.id);
    const currentMins = getMinutesFromMidnight(new Date().toISOString());
    const startMins = Math.floor(currentMins / 15) * 15; // snap to 15 mins
    
    setEditingPlan({
      id: Date.now().toString(),
      title: taskToSchedule.title,
      startMinutes: startMins,
      durationMinutes: 30,
      recurrence: 'none',
      baseDate: selectedDate.toISOString(),
    } as any);
    setEditorVisible(true);
  }, [taskToSchedule, selectedDate]);

  const handleAssignToExistingPlan = useCallback((planId: string) => {
    if (taskToSchedule) {
      const { assignTaskToPlan } = useTaskStore.getState();
      assignTaskToPlan(taskToSchedule.id, planId);
    }
    setTaskScheduleVisible(false);
  }, [taskToSchedule]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <View style={{ flex: 1 }} ref={rootRef} collapsable={false}>

      
      {isHeaderVisible && (
        <View ref={dateRef} collapsable={false}>
          <DateSelector 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
            achievedDates={achievedDates}
          />
        </View>
      )}
      
      {/* PLAN vs REAL Minimalist Toggle */}
      <View 
        ref={toggleRef} 
        collapsable={false}
        className="flex-row bg-white dark:bg-gray-950 py-2.5 z-10 border-b border-gray-100 dark:border-gray-900 justify-center gap-12 shadow-sm"
      >
        <Pressable 
          onPress={() => setActiveTab(activeTab === 'plan' ? 'timeline' : 'plan')}
          className="items-center justify-center py-1 px-4"
        >
          <Text className={`text-[10px] font-black tracking-[0.2em] uppercase ${
            (activeTab === 'plan' || activeTab === 'timeline') ? 'text-yellow-600 dark:text-yellow-500' : 'text-gray-400 dark:text-gray-600'
          }`}>
            {activeTab === 'timeline' ? 'TIMELINE' : t('calendar.plan')}
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => setActiveTab(activeTab === 'real' ? 'task' : 'real')}
          className="items-center justify-center py-1 px-4"
        >
          <Text className={`text-[10px] font-black tracking-[0.2em] uppercase ${
            (activeTab === 'real' || activeTab === 'task') ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-600'
          }`}>
            {activeTab === 'task' ? t('calendar.task') : t('calendar.real')}
          </Text>
        </Pressable>

        {/* Hide Header Toggle */}
        <Pressable 
          onPress={() => setIsHeaderVisible(p => !p)}
          className="absolute left-4 top-2.5 px-3 py-1 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
        >
          <Feather name={isHeaderVisible ? "chevron-up" : "chevron-down"} size={14} color="#9CA3AF" />
        </Pressable>

        <View className="absolute right-4 top-2.5 flex-row gap-2">
          {/* Compare Toggle */}
          <Pressable 
            onPress={() => setIsCompareMode(p => !p)}
            className={`px-3 py-1 items-center justify-center rounded-xl border ${isCompareMode ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' : 'bg-gray-50 border-gray-100 dark:bg-gray-900 dark:border-gray-800'}`}
          >
            <Feather name={isCompareMode ? "eye" : "eye-off"} size={14} color={isCompareMode ? "#3b82f6" : "#9CA3AF"} />
          </Pressable>

          {/* Lock Toggle */}
          <Pressable 
            onPress={() => setIsLocked(p => !p)}
            className="px-3 py-1 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          >
            <Feather name={isLocked ? "lock" : "unlock"} size={14} color={isLocked ? "#F59E0B" : "#9CA3AF"} />
          </Pressable>
        </View>
      </View>

      <View className="px-4 pt-4 z-10">
        <OnTheRadar />
        {topPriorityItem && (
          <View className="mt-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex-row items-center shadow-sm">
            <View className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800/50 items-center justify-center mr-3">
              <Feather name="star" size={16} color="#D97706" fill="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider mb-0.5">
                {language === 'id' ? 'Prioritas Utama Hari Ini' : 'Top Priority Today'}
              </Text>
              <Text className="text-sm font-black text-gray-900 dark:text-white" numberOfLines={1}>
                {topPriorityItem.title}
              </Text>
            </View>
          </View>
        )}
      </View>

      {activeTab === 'task' && <TaskListView selectedDate={selectedDate} onScheduleTask={handleScheduleTask} />}

      {(activeTab === 'plan' || activeTab === 'real' || activeTab === 'timeline') && (
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        >
          <View className="flex-1" {...panResponder.panHandlers} ref={bodyRef} collapsable={false}>
          <ScrollView 
            ref={verticalScrollRef}
          className="flex-1"
          scrollEnabled={isScrollEnabled}
          contentContainerStyle={{ paddingTop: 20, paddingBottom: 150 }}
        >
          {/* Wrap absolute elements in a sized Pressable to catch taps and allow edge padding */}
          <Pressable 
            style={{ height: activeTab === 'timeline' ? timelineDays.length * PIXELS_PER_DAY : 24 * 60 * PIXELS_PER_MINUTE }}
            onPress={activeTab === 'timeline' ? undefined : handleTimelinePress}
          >
            {activeTab === 'timeline' ? (
              <TimelineDateMarkers days={timelineDays} pixelsPerDay={PIXELS_PER_DAY} />
            ) : (
              <TimelineHourMarkers pixelsPerMinute={PIXELS_PER_MINUTE} />
            )}
        
        {/* Render Sleep Blocks (Daily Only) */}
        {activeTab !== 'timeline' && sleepBlocks.map((block, i) => (
          <SleepBlock 
            key={`sleep-${i}`}
            startMinutes={block.start}
            durationMinutes={block.duration}
            pixelsPerMinute={PIXELS_PER_MINUTE}
            onPress={handleSleepBlockPress}
          />
        ))}

        {/* Render Planned Blocks / Milestones */}
        <View className="absolute top-0 bottom-0 left-16 right-4" pointerEvents="box-none">
          {activeTab === 'timeline' ? (
            timelinePlans.map((plan, i) => {
              if (!isCompareMode && activeTab !== 'timeline') return null;
              return (
                <View 
                  key={`plan-${plan.id}-${i}`}
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: isCompareMode ? '0%' : '0%', 
                    width: isCompareMode ? '49%' : '100%',
                    opacity: isCompareMode ? (activeTab === 'timeline' ? 1 : 0.5) : 1, 
                    zIndex: activeTab === 'timeline' ? 30 : 10 
                  }}
                  pointerEvents={activeTab === 'timeline' ? 'box-none' : 'none'}
                >
                  <InteractiveTimelineBlock
                    plan={plan as TimelineRenderedPlan}
                    pixelsPerDay={PIXELS_PER_DAY}
                    onUpdateDates={handleUpdateTimelineDates}
                    onEditPress={(p) => {
                      setTimelineQuickActionPlan(p);
                      setTimelineQuickActionVisible(true);
                    }}
                    setScrollEnabled={setIsScrollEnabled}
                    width={isCompareMode ? 49 : 100}
                    isLocked={isLocked}
                  />
                </View>
              );
            })
          ) : (
            dailyPlans.map(plan => {
              if (!isCompareMode && activeTab !== 'plan') return null;
              return (
                <View 
                  key={plan.id} 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: isCompareMode ? `${plan._left * 0.49}%` : `${plan._left}%`, 
                    width: isCompareMode ? `${plan._width * 0.49}%` : `${plan._width}%`,
                    opacity: isCompareMode ? (activeTab === 'plan' ? 1 : 0.5) : 1, 
                    zIndex: activeTab === 'plan' ? 30 : 10 
                  }}
                  pointerEvents={activeTab === 'plan' ? 'box-none' : 'none'}
                >
                  <InteractivePlanBlock
                    plan={plan}
                    pixelsPerMinute={PIXELS_PER_MINUTE}
                    onUpdatePlan={updatePlan}
                    onEditPress={handleEditPress}
                    setScrollEnabled={setIsScrollEnabled}
                    width={isCompareMode ? plan._width * 0.49 : plan._width}
                    isLocked={isLocked}
                  />
                </View>
              );
            })
          )}
        </View>

        {/* Render Real Sessions */}
        <View className="absolute top-0 bottom-0 left-16 right-4" pointerEvents="box-none">
          {activeTab === 'timeline' ? (
            <>
              {timelineSessionsLayout.map((session, i) => {
                if (!isCompareMode && activeTab !== 'timeline') return null;
                return (
                  <View 
                    key={`real-${session.id}-${i}`}
                    style={{ 
                      position: 'absolute',
                      top: session.top,
                      height: session.height,
                      left: isCompareMode ? '51%' : '0%', 
                      width: isCompareMode ? '49%' : '100%',
                      backgroundColor: session.color,
                      borderRadius: 6,
                      padding: 6,
                      opacity: 1 
                    }}
                    pointerEvents="none"
                  >
                    <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '800', color: 'white' }}>
                      {session.title}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: 'white', opacity: 0.8, marginTop: 2 }}>
                      {session.duration} min
                    </Text>
                  </View>
                );
              })}
              {timelinePlans.filter(p => p.isCompleted).map((plan, i) => {
                if (!isCompareMode && activeTab !== 'timeline') return null;
                return (
                  <View 
                    key={`real-completed-plan-${plan.id}-${i}`}
                    style={{ 
                      position: 'absolute',
                      top: plan.top,
                      height: plan.height,
                      left: isCompareMode ? '51%' : '0%', 
                      width: isCompareMode ? '49%' : '100%',
                      backgroundColor: plan.color,
                      borderRadius: 6,
                      padding: 6,
                    }}
                    pointerEvents="none"
                  >
                    <Text numberOfLines={1} style={{ fontSize: 11, fontWeight: '800', color: 'white' }}>
                      {plan.title}
                    </Text>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: 'white', opacity: 0.9, marginTop: 2 }}>
                      {plan.type === 'allday' ? 'ALL DAY' : 'COMPLETED'}
                    </Text>
                  </View>
                );
              })}
            </>
          ) : (
            dailySessionsLayout.map(session => {
              if (!isCompareMode && activeTab !== 'real') return null;

              const startMins = getMinutesFromMidnight(session.startTime);
              const durationMins = Math.max(1, Math.round(session.durationSeconds / 60));
              
              let skillIcon = undefined;
              if (session.skillId) {
                const s = skills.find(sk => sk.id === session.skillId);
                if (s) skillIcon = s.icon;
              }

              return (
                <View 
                  key={session.id} 
                  style={{ 
                    position: 'absolute',
                    top: 0,
                    left: isCompareMode ? `${51 + (session._left * 0.49)}%` : `${session._left}%`, 
                    width: isCompareMode ? `${session._width * 0.49}%` : `${session._width}%`,
                    opacity: isCompareMode ? (activeTab === 'real' ? 1 : 0.5) : 1, 
                    zIndex: activeTab === 'real' ? 30 : 10 
                  }}
                  pointerEvents={activeTab === 'real' ? 'box-none' : 'none'}
                >
                  <TimelineBlock
                    title={session.title}
                    startMinutes={startMins}
                    durationMinutes={durationMins}
                    pixelsPerMinute={PIXELS_PER_MINUTE}
                    type="real"
                    skillIcon={skillIcon}
                    color={session.color}
                    onPress={() => {
                      setEditingRealSession(session);
                      setRealEditorVisible(true);
                    }}
                  />
                </View>
              );
            })
          )}
        </View>
        
        {/* Render the current time red line indicator */}
        {activeTab === 'timeline' ? (
          (() => {
            const today = startOfDay(new Date());
            const todayIndex = timelineDays.findIndex((d: Date) => isSameDay(d, today));
            if (todayIndex !== -1) {
              const now = new Date();
              const minsSinceMidnight = now.getHours() * 60 + now.getMinutes();
              const proportion = minsSinceMidnight / (24 * 60);
              const top = todayIndex * PIXELS_PER_DAY + proportion * PIXELS_PER_DAY;
              return (
                <View style={{ position: 'absolute', top, left: 64, right: 0, flexDirection: 'row', alignItems: 'center', zIndex: 10 }} pointerEvents="none">
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginLeft: -4 }} />
                  <View style={{ flex: 1, height: 1, backgroundColor: '#EF4444' }} />
                </View>
              );
            }
            return null;
          })()
        ) : (
          isSelectedToday && <TimelineNowIndicator pixelsPerMinute={PIXELS_PER_MINUTE} />
        )}
        
        {/* Center Divider Line */}
        {isCompareMode && (
          <View className="absolute top-0 bottom-0 left-[52.5%] w-[1px] bg-gray-100 dark:bg-gray-800 pointer-events-none" />
        )}
          </Pressable>
        </ScrollView>
        </View>
      </PinchGestureHandler>
      )}

      {/* Floating Action Button (FAB) */}
      <View ref={fabRef} collapsable={false} style={{ position: 'absolute', right: 24, bottom: Math.max(insets.bottom + 84, 112), zIndex: 50 }}>
        <Pressable 
          onPress={handleCreateNew}
          className="w-14 h-14 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50"
        >
          <Text className="text-white text-3xl leading-none mt-[-2px]">+</Text>
        </Pressable>
      </View>

      <PlanQuickActionModal
        visible={quickActionVisible}
        plan={quickActionPlan}
        onClose={() => setQuickActionVisible(false)}
        onEdit={() => {
          setQuickActionVisible(false);
          setEditingPlan(quickActionPlan);
          setEditorVisible(true);
        }}
        onStartTimer={() => {
          setQuickActionVisible(false);
          if (quickActionPlan && quickActionPlan.skillId) {
             const timerStore = useTimerStore.getState();
             timerStore.setSelectedSkillId(quickActionPlan.skillId);
             if (quickActionPlan.pillarId) timerStore.setSelectedPillarId(quickActionPlan.pillarId);
             timerStore.setDuration(quickActionPlan.durationMinutes * 60);
             if (quickActionPlan.title) timerStore.setTitle(quickActionPlan.title);
             navigation.navigate('index' as never);
          }
        }}
        onMarkDone={() => {
          setQuickActionVisible(false);
          if (quickActionPlan) {
             const startTime = new Date(selectedDate);
             startTime.setHours(Math.floor(quickActionPlan.startMinutes / 60), quickActionPlan.startMinutes % 60, 0, 0);
             const endTime = new Date(startTime.getTime() + quickActionPlan.durationMinutes * 60 * 1000);
             
             const { addSession } = useSessionStore.getState();
             addSession({
               id: Date.now().toString(),
               title: quickActionPlan.title || 'Life Activity',
               startTime: startTime.toISOString(),
               endTime: endTime.toISOString(),
               durationSeconds: quickActionPlan.durationMinutes * 60,
               focusDurationSeconds: quickActionPlan.durationMinutes * 60,
               distractedDurationSeconds: 0,
               isSmartMode: false,
               color: quickActionPlan.color || '#3B82F6',
               skillId: quickActionPlan.skillId || null,
               pillarId: quickActionPlan.pillarId || null,
             } as any);
          }
        }}
      />

      <TaskScheduleModal
        visible={taskScheduleVisible}
        task={taskToSchedule}
        plansToday={plans}
        onClose={() => setTaskScheduleVisible(false)}
        onAssignToPlan={handleAssignToExistingPlan}
        onCreateNew={handleCreateNewFromTask}
      />

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

      <TimelineEditorModal
        visible={timelineEditorVisible}
        milestone={editingMilestone}
        initialDate={selectedDate}
        onClose={() => setTimelineEditorVisible(false)}
        onSave={(data) => {
          if (editingMilestone) {
            updateMilestone(editingMilestone.id, data);
          } else {
            addMilestone({
              ...data,
              id: Date.now().toString(),
              projectId: data.projectId!
            } as Milestone);
          }
          setTimelineEditorVisible(false);
        }}
        onDelete={(id) => {
          deleteMilestone(id);
          setTimelineEditorVisible(false);
        }}
      />

      <TimelineQuickActionModal
        visible={timelineQuickActionVisible}
        plan={timelineQuickActionPlan}
        onClose={() => setTimelineQuickActionVisible(false)}
        onMarkDone={handleTimelineMarkDone}
        onEdit={() => {
          setTimelineQuickActionVisible(false);
          if (timelineQuickActionPlan?.type === 'milestone') {
            setEditingMilestone(timelineQuickActionPlan.raw as Milestone);
            setTimelineEditorVisible(true);
          } else if (timelineQuickActionPlan?.type === 'allday') {
            setEditingPlan(timelineQuickActionPlan.raw as Plan);
            setEditorVisible(true);
          }
        }}
      />

      <RealSessionEditorModal 
        visible={realEditorVisible}
        session={editingRealSession}
        onClose={() => setRealEditorVisible(false)}
        onSave={(updates) => {
          if (editingRealSession) {
            const exists = sessions.some(s => s.id === editingRealSession.id);
            if (exists) {
              updateSession(editingRealSession.id, updates);
            } else {
              const { addSession } = useSessionStore.getState();
              addSession({ ...editingRealSession, ...updates } as any);
            }
          }
        }}
        onDelete={(id) => {
          removeSession(id);
          setRealEditorVisible(false);
        }}
      />

      <QuickSleepEditorModal 
        visible={quickSleepVisible}
        onClose={() => setQuickSleepVisible(false)}
      />

      {/* Custom Tutorial Overlay */}
      <SpotlightOverlay
        visible={tutorialVisible}
        steps={tutorialSteps}
        rootRef={rootRef}
        onFinish={() => {
          setTutorialVisible(false);
          setTutorialSeen('calendar');
          // Simulated interactive onboarding: immediately open the plan editor!
          setEditingPlan({
            id: Date.now().toString(),
            title: '',
            startMinutes: 480, // Default to 8:00 AM
            durationMinutes: 60,
            recurrence: 'none',
            baseDate: selectedDate.toISOString(),
          } as any);
          setEditorVisible(true);
        }}
      />
      </View>
    </SafeAreaView>
  );
}

import { ScrollView, View, Text, Pressable, Image, Platform, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Tabs, router } from 'expo-router';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { usePlanStore } from '@/store/usePlanStore';

import { isToday, isThisWeek, format } from 'date-fns';
import { formatLongTime } from '@/utils/time';
import { images } from '@/constants/images';
import { calculateStreak } from '@/utils/streak';
import { WeeklyBarChart } from '@/components/stats/WeeklyBarChart';
import { ContributionHeatmap } from '@/components/stats/ContributionHeatmap';
import { LifetimeCountdown } from '@/components/stats/LifetimeCountdown';
import { getWeeklyPlannedMinutes } from '@/utils/calendar';
import { useAppStore } from '@/store/useAppStore';
import { SpotlightOverlay, SpotlightStep, SpotlightCoords } from '@/components/tutorial/SpotlightOverlay';
import { useTranslation } from '@/hooks/useTranslation';

export default function StatsScreen() {
  const { t } = useTranslation();
  const sessions = useSessionStore(s => s.sessions);
  const removeSession = useSessionStore(s => s.removeSession);
  
  // Tutorial State
  const { hasSeenStatsTutorial, setTutorialSeen } = useAppStore();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<SpotlightStep[]>([]);
  const isFocused = useIsFocused();
  
  const timeWidgetsRef = useRef<View>(null);
  const chartRef = useRef<View>(null);
  const heatmapRef = useRef<View>(null);
  const rootRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [stepLayouts, setStepLayouts] = useState<Record<number, {y: number, h: number}>>({});
  const handleLayout = (index: number) => (e: any) => {
    const { y, height } = e.nativeEvent.layout;
    setStepLayouts(prev => ({ ...prev, [index]: { y, h: height } }));
  };

  useEffect(() => {
    if (!hasSeenStatsTutorial && isFocused) {
      setTutorialSteps([
        { targetRef: timeWidgetsRef, text: t('tutorial.stats.step1'), holeType: 'rect', holePadding: 8 },
        { targetRef: chartRef, text: t('tutorial.stats.step2'), holeType: 'rect', holePadding: 8 },
        { targetRef: heatmapRef, text: t('tutorial.stats.step3'), holeType: 'rect', holePadding: 8 },
      ]);
      const timeout = setTimeout(() => {
        setTutorialVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenStatsTutorial, isFocused, t]);

  // Today Stats
  const todaysSessions = sessions.filter(s => isToday(new Date(s.startTime)));
  const totalSecondsToday = todaysSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);

  // This Week Stats (Week starting on Monday)
  const thisWeekSessions = sessions.filter(s => isThisWeek(new Date(s.startTime), { weekStartsOn: 1 }));
  const totalSecondsThisWeek = thisWeekSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const executedMinutesThisWeek = Math.floor(totalSecondsThisWeek / 60);

  // Plan vs Reality
  const plans = usePlanStore(s => s.plans);
  const plannedMinutesThisWeek = useMemo(() => getWeeklyPlannedMinutes(plans), [plans]);
  
  const adherenceScoreRaw = plannedMinutesThisWeek > 0 
    ? Math.round((executedMinutesThisWeek / plannedMinutesThisWeek) * 100)
    : (executedMinutesThisWeek > 0 ? 100 : 0);
  
  const adherenceScore = Math.min(100, adherenceScoreRaw); // Cap at 100% for display

  let coachFeedback = '';
  if (plannedMinutesThisWeek === 0) {
    coachFeedback = t('stats.feedbackNoPlan');
  } else if (adherenceScore >= 90) {
    coachFeedback = t('stats.feedbackOutstanding');
  } else if (adherenceScore >= 70) {
    coachFeedback = t('stats.feedbackGood');
  } else {
    coachFeedback = t('stats.feedbackMissed').replace('{planned}', (plannedMinutesThisWeek/60).toFixed(1)).replace('{executed}', (executedMinutesThisWeek/60).toFixed(1));
  }

  // All-Time Stats
  const totalSecondsAllTime = sessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalSessionsAllTime = sessions.length;

  // Smart Analytics
  const smartSessions = sessions.filter(s => s.isSmartMode && s.focusDurationSeconds !== undefined && s.distractedDurationSeconds !== undefined);
  const totalSmartDuration = smartSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalFocusDuration = smartSessions.reduce((acc, curr) => acc + (curr.focusDurationSeconds || 0), 0);
  const totalDistractedDuration = smartSessions.reduce((acc, curr) => acc + (curr.distractedDurationSeconds || 0), 0);
  const focusPercentage = totalSmartDuration > 0 ? Math.round((totalFocusDuration / totalSmartDuration) * 100) : 0;
  const distractedPercentage = totalSmartDuration > 0 ? Math.round((totalDistractedDuration / totalSmartDuration) * 100) : 0;

  // History List (Newest first)
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Settings & Time Left Logic
  const { sleepStart, sleepEnd, dailyFocusTargetHours } = useSettingsStore();

  const { currentStreak, achievedDates } = useMemo(() => calculateStreak(sessions, dailyFocusTargetHours), [sessions, dailyFocusTargetHours]);

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, sleeping: false });
  const [isStillAwake, setIsStillAwake] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const currentSecs = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
      
      const parseSecs = (str: string) => {
        const parts = str.split(':');
        if (parts.length !== 2) return 0;
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60;
      };

      const startSecs = parseSecs(sleepStart || '23:00');
      const endSecs = parseSecs(sleepEnd || '06:00');

      let sleeping = false;
      let left = 0;
      let debt = 0;

      if (startSecs > endSecs) {
        // Crosses midnight (e.g. 23:00 to 06:00)
        if (currentSecs >= startSecs || currentSecs < endSecs) sleeping = true;
      } else {
        // Same day (e.g. 01:00 to 08:00)
        if (currentSecs >= startSecs && currentSecs < endSecs) sleeping = true;
      }

      if (sleeping) {
        if (currentSecs >= startSecs) {
          debt = currentSecs - startSecs;
        } else {
          debt = (24 * 3600 - startSecs) + currentSecs;
        }
        setTimeLeft({ 
          hours: Math.floor(debt / 3600), 
          minutes: Math.floor((debt % 3600) / 60), 
          seconds: debt % 60, 
          sleeping: true 
        });
        return;
      } else {
        // Automatically reset the awake state if the user crosses back into waking hours
        if (isStillAwake) setIsStillAwake(false);
      }

      if (currentSecs < startSecs) {
        left = startSecs - currentSecs;
      } else {
        left = (24 * 3600 - currentSecs) + startSecs;
      }

      setTimeLeft({ 
        hours: Math.floor(left / 3600), 
        minutes: Math.floor((left % 3600) / 60),
        seconds: left % 60,
        sleeping: false
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000); // update every second
    return () => clearInterval(interval);
  }, [sleepStart, sleepEnd]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <View style={{ flex: 1 }} ref={rootRef} collapsable={false}>
      {/* Hide duplicate expo router header */}
      <Tabs.Screen options={{ 
        headerShown: false,
        tabBarStyle: tutorialVisible ? { display: 'none' } : undefined
      }} />
      
      <ScrollView ref={scrollViewRef} className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
        <View className="flex-row justify-between items-center mb-8 mt-4">
          <Text className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {t('stats.title')}
          </Text>
          <View className="flex-row items-center gap-3">
            {currentStreak > 0 && (
              <View className="flex-row items-center bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
                <Text className="text-orange-600 dark:text-orange-400 font-black text-sm mr-1">{currentStreak}</Text>
                <Text className="text-sm">🔥</Text>
              </View>
            )}
            <Pressable onPress={() => router.push('/profile')} className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center overflow-hidden">
              <Feather name="settings" size={18} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* TIME WIDGETS ROW */}
        <View className="flex-row gap-4 mb-6" ref={timeWidgetsRef} collapsable={false} onLayout={handleLayout(0)}>
          
          {/* TIME LEFT WIDGET (2/3 width) */}
          <View className={`flex-[2] rounded-3xl p-6 shadow-sm relative overflow-hidden border ${
            timeLeft.sleeping 
              ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30' 
              : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
          }`}>
            <View className="absolute top-0 right-0 p-4 opacity-10">
              <Feather name={timeLeft.sleeping ? 'moon' : 'clock'} size={80} color={timeLeft.sleeping ? '#EF4444' : '#F97316'} />
            </View>

            <Text className={`font-black tracking-widest uppercase text-[10px] mb-2 ${
              timeLeft.sleeping ? 'text-red-600 dark:text-red-500' : 'text-orange-600 dark:text-orange-500'
            }`}>
              {timeLeft.sleeping ? t('stats.sleepDebt') : t('stats.timeLeftToday')}
            </Text>
            
            <Text className="mt-1 flex-row items-baseline" adjustsFontSizeToFit numberOfLines={1}>
              {timeLeft.sleeping && <Text className="text-3xl font-black tabular-nums text-red-600 dark:text-red-500 mr-1">-</Text>}
              
              <Text className={`text-3xl font-black tabular-nums ${timeLeft.sleeping ? 'text-red-600 dark:text-red-500' : 'text-orange-600 dark:text-orange-500'}`}>
                {timeLeft.hours.toString().padStart(2, '0')}
              </Text>
              <Text className={`text-base font-bold mr-1 ${timeLeft.sleeping ? 'text-red-400' : 'text-orange-400'}`}>h </Text>
              
              <Text className={`text-3xl font-black tabular-nums ${timeLeft.sleeping ? 'text-red-600 dark:text-red-500' : 'text-orange-600 dark:text-orange-500'}`}>
                {timeLeft.minutes.toString().padStart(2, '0')}
              </Text>
              <Text className={`text-base font-bold mr-1 ${timeLeft.sleeping ? 'text-red-400' : 'text-orange-400'}`}>m </Text>
              
              <Text className={`text-3xl font-black tabular-nums ${timeLeft.sleeping ? 'text-red-600/80 dark:text-red-500/80' : 'text-orange-600/80 dark:text-orange-500/80'}`}>
                {timeLeft.seconds.toString().padStart(2, '0')}
              </Text>
              <Text className={`text-base font-bold ${timeLeft.sleeping ? 'text-red-400' : 'text-orange-400'}`}>s</Text>
            </Text>
          </View>

          {/* LIFETIME COUNTDOWN (1/3 width) */}
          <View>
            <LifetimeCountdown />
          </View>
        </View>

        {/* WEEKLY BAR CHART */}
        <View ref={chartRef} collapsable={false} onLayout={handleLayout(1)}>
          <WeeklyBarChart sessions={sessions} />
        </View>

        {/* PLAN VS REALITY SCORECARD */}
        <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 mt-2">
          <View className="flex-row items-center gap-2 mb-4">
            <Feather name="target" size={20} color="#3B82F6" />
            <Text className="text-gray-900 dark:text-white font-black text-xl">{t('stats.planVsReality')}</Text>
          </View>

          <View className="flex-row items-end justify-between mb-2">
            <View>
              <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{t('stats.disciplineScore')}</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className={`text-4xl font-black ${adherenceScore >= 70 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-500'}`}>
                  {plannedMinutesThisWeek === 0 && executedMinutesThisWeek === 0 ? '--' : adherenceScore}
                </Text>
                {plannedMinutesThisWeek > 0 || executedMinutesThisWeek > 0 ? (
                  <Text className="text-xl font-bold text-gray-400">%</Text>
                ) : null}
              </View>
            </View>
            
            <View className="items-end">
              <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{t('stats.executedPlanned')}</Text>
              <Text className="text-gray-900 dark:text-white font-black text-lg">
                {(executedMinutesThisWeek / 60).toFixed(1)} <Text className="text-gray-400 text-sm">/ {(plannedMinutesThisWeek / 60).toFixed(1)} h</Text>
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full flex-row overflow-hidden my-3">
            <View style={{ width: `${adherenceScore}%` }} className={`h-full ${adherenceScore >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`} />
          </View>

          {/* Coach Feedback Banner */}
          <View className="mt-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl flex-row items-center">
            <Text className="text-lg mr-2">💬</Text>
            <Text className="flex-1 text-blue-800 dark:text-blue-300 font-medium text-xs leading-relaxed">
              {coachFeedback}
            </Text>
          </View>
        </View>


        {/* HEATMAP */}
        <View ref={heatmapRef} collapsable={false} onLayout={handleLayout(2)}>
          <ContributionHeatmap sessions={sessions} />
        </View>


        {/* Global Smart Mode Analytics */}
        {totalSmartDuration > 0 && (
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="text-xl">🤖</Text>
              <Text className="text-gray-900 dark:text-white font-black text-xl">{t('stats.smartAnalytics')}</Text>
            </View>
            
            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-green-600 dark:text-green-500 text-[10px] font-black tracking-widest uppercase mb-1">{t('stats.focused')}</Text>
                <Text className="text-green-600 dark:text-green-400 font-black text-2xl">
                  {formatLongTime(totalFocusDuration)}
                </Text>
              </View>
              <View className="flex-1 border-l border-gray-100 dark:border-gray-800 pl-4">
                <Text className="text-red-600 dark:text-red-500 text-[10px] font-black tracking-widest uppercase mb-1">{t('stats.distracted')}</Text>
                <Text className="text-red-600 dark:text-red-400 font-black text-2xl">
                  {formatLongTime(totalDistractedDuration)}
                </Text>
              </View>
            </View>

            <View className="w-full h-5 bg-gray-100 dark:bg-gray-800 rounded-full flex-row overflow-hidden mb-2">
              <View style={{ width: `${focusPercentage}%` }} className="h-full bg-green-500" />
              <View style={{ width: `${distractedPercentage}%` }} className="h-full bg-red-500" />
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs">{focusPercentage}% {t('stats.globalFocusScore')}</Text>
              <Text className="text-gray-500 dark:text-gray-400 font-bold text-xs">{distractedPercentage}% {t('stats.distracted')}</Text>
            </View>
          </View>
        )}

        <Text className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
          {t('stats.recentSessions')}
        </Text>

        <View className="gap-3">
          {sortedSessions.map((session) => (
            <View 
              key={session.id} 
              className="flex-row items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800"
            >
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 dark:text-white mb-1" numberOfLines={1}>
                  {session.title}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">
                  {format(new Date(session.startTime), 'MMM d, yyyy • h:mm a')}
                </Text>
              </View>
              
              <View className="items-end ml-4 justify-between h-12">
                <Text className="text-sm font-black text-blue-600 dark:text-blue-400">
                  {formatLongTime(session.durationSeconds)}
                </Text>
                <Pressable 
                  onPress={() => removeSession(session.id)}
                  hitSlop={15}
                >
                  <Text className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{t('stats.delete')}</Text>
                </Pressable>
              </View>
            </View>
          ))}

          {sortedSessions.length === 0 && (
            <Text className="text-center text-gray-500 font-medium my-4">{t('stats.noSessionsYet')}</Text>
          )}
        </View>
      </ScrollView>

      {/* Custom Tutorial Overlay */}
      <SpotlightOverlay
        visible={tutorialVisible}
        steps={tutorialSteps}
        rootRef={rootRef}
        onStepChange={(index) => {
          const layout = stepLayouts[index];
          if (layout && scrollViewRef.current) {
            const screenH = Dimensions.get('window').height;
            const scrollY = Math.max(0, layout.y - (screenH / 2) + (layout.h / 2));
            scrollViewRef.current?.scrollTo({ y: scrollY, animated: true });
          }
        }}
        onFinish={() => {
          setTutorialVisible(false);
          setTutorialSeen('stats');
        }}
      />
      </View>
    </SafeAreaView>
  );
}

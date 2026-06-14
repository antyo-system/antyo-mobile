import { usePlanStore } from '@/store/usePlanStore';
import { useSessionStore } from '@/store/useSessionStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Feather } from '@expo/vector-icons';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View, Modal, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContributionHeatmap } from '@/components/stats/ContributionHeatmap';
import { SmartInsights } from '@/components/stats/SmartInsights';
import { WeeklyBarChart } from '@/components/stats/WeeklyBarChart';
import { SpotlightOverlay, SpotlightStep } from '@/components/tutorial/SpotlightOverlay';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppStore } from '@/store/useAppStore';
import { getPlannedMinutes } from '@/utils/calendar';
import { generateInsights } from '@/utils/insights';
import { calculateStreak } from '@/utils/streak';
import { formatLongTime } from '@/utils/time';
import { DailyDonutChart, DailyLegend } from '@/components/stats/DailyDonutChart';
import { MonthlyLineChart } from '@/components/stats/MonthlyLineChart';
import { format, isThisWeek, isToday, isThisMonth, isThisYear, endOfDay, endOfWeek, endOfMonth, endOfYear, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

type Timeframe = 'day' | 'week' | 'month' | 'year';

export default function StatsScreen() {
  const { t } = useTranslation();
  const sessions = useSessionStore(s => s.sessions);
  const plans = usePlanStore(s => s.plans);
  const removeSession = useSessionStore(s => s.removeSession);

  // Filters & State
  const [timeframe, setTimeframe] = useState<Timeframe>('week');
  const [historyVisible, setHistoryVisible] = useState(false);

  const insightsData = useMemo(() => generateInsights(sessions, plans), [sessions, plans]);

  // Tutorial State
  const { hasSeenStatsTutorial, setTutorialSeen } = useAppStore();
  const [tutorialVisible, setTutorialVisible] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<SpotlightStep[]>([]);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      tabBarStyle: tutorialVisible ? { display: 'none' } : undefined
    });
  }, [navigation, tutorialVisible]);

  const filterRef = useRef<View>(null);
  const timerRef = useRef<View>(null);
  const chartRef = useRef<View>(null);
  const rootRef = useRef<View>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  const [stepLayouts, setStepLayouts] = useState<Record<number, { y: number, h: number }>>({});
  const handleLayout = (index: number) => (e: any) => {
    const { y, height } = e.nativeEvent.layout;
    setStepLayouts(prev => ({ ...prev, [index]: { y, h: height } }));
  };

  useEffect(() => {
    if (!hasSeenStatsTutorial && isFocused) {
      setTutorialSteps([
        { targetRef: filterRef, text: "Gunakan filter ini untuk melihat data harian, mingguan, bulanan, atau tahunan.", holeType: 'rect', holePadding: 8 },
        { targetRef: timerRef, text: "Timer Urgensi: Mengingatkan Anda berapa banyak waktu yang tersisa untuk mengejar target Anda.", holeType: 'rect', holePadding: 8 },
        { targetRef: chartRef, text: "Visualisasi data performa Anda yang bisa diganti antara Bar Chart dan Heatmap.", holeType: 'rect', holePadding: 8 },
      ]);
      const timeout = setTimeout(() => {
        setTutorialVisible(true);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [hasSeenStatsTutorial, isFocused, t]);

  // Dynamic Time Data
  const { startDate, daysCount, currentSessions } = useMemo(() => {
    const now = new Date();
    let start = startOfDay(now);
    let days = 1;
    let filtered = sessions;

    switch (timeframe) {
      case 'day':
        start = startOfDay(now);
        days = 1;
        filtered = sessions.filter(s => isToday(new Date(s.startTime)));
        break;
      case 'week':
        start = startOfWeek(now, { weekStartsOn: 1 });
        days = 7;
        filtered = sessions.filter(s => isThisWeek(new Date(s.startTime), { weekStartsOn: 1 }));
        break;
      case 'month':
        start = startOfMonth(now);
        const endMo = endOfMonth(now);
        days = endMo.getDate();
        filtered = sessions.filter(s => isThisMonth(new Date(s.startTime)));
        break;
      case 'year':
        start = startOfYear(now);
        days = 365; // approximation for scorecard
        filtered = sessions.filter(s => isThisYear(new Date(s.startTime)));
        break;
    }
    return { startDate: start, daysCount: days, currentSessions: filtered };
  }, [timeframe, sessions]);

  // Execution vs Plan
  const totalSeconds = currentSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const executedMinutes = Math.floor(totalSeconds / 60);
  const plannedMinutes = useMemo(() => getPlannedMinutes(plans, startDate, daysCount), [plans, startDate, daysCount]);

  const { dailyFocusTargetHours, birthYear, retirementAge } = useSettingsStore();
  const { currentStreak, longestStreak } = useMemo(() => calculateStreak(sessions, dailyFocusTargetHours), [sessions, dailyFocusTargetHours]);

  const lifetimeDaysLeft = useMemo(() => {
    const endOfLife = new Date(`${birthYear + retirementAge}-01-01`);
    const diffTime = endOfLife.getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }, [birthYear, retirementAge]);

  const adherenceScoreRaw = plannedMinutes > 0
    ? Math.round((executedMinutes / plannedMinutes) * 100)
    : (executedMinutes > 0 ? 100 : 0);
  const adherenceScore = Math.min(100, adherenceScoreRaw);

  // Smart Analytics
  const smartSessions = currentSessions.filter(s => s.isSmartMode && s.focusDurationSeconds !== undefined && s.distractedDurationSeconds !== undefined);
  const totalSmartDuration = smartSessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const totalFocusDuration = smartSessions.reduce((acc, curr) => acc + (curr.focusDurationSeconds || 0), 0);
  const totalDistractedDuration = smartSessions.reduce((acc, curr) => acc + (curr.distractedDurationSeconds || 0), 0);
  const focusPercentage = totalSmartDuration > 0 ? Math.round((totalFocusDuration / totalSmartDuration) * 100) : 0;
  const distractedPercentage = totalSmartDuration > 0 ? Math.round((totalDistractedDuration / totalSmartDuration) * 100) : 0;

  // History List (Newest first)
  const sortedSessions = [...sessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Global Timer Logic
  const [timeLeftObj, setTimeLeftObj] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const settings = useSettingsStore.getState();
      const [sleepH, sleepM] = settings.sleepStart.split(':').map(Number);
      
      let targetDate = new Date();
      targetDate.setHours(sleepH, sleepM, 0, 0);

      // If current time is past sleep start, or if sleep time is in the early morning
      if (sleepH < 12 && now.getHours() >= 12) {
        targetDate.setDate(targetDate.getDate() + 1);
      } else if (now.getTime() > targetDate.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      
      const diffMs = targetDate.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        setTimeLeftObj({ h: 0, m: 0, s: 0 });
        return;
      }

      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs / 1000 / 60) % 60);
      const s = Math.floor((diffMs / 1000) % 60);

      setTimeLeftObj({ h, m, s });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const T_LABELS: Record<string, string> = {
    day: t('stats.day') || 'Hari',
    week: t('stats.week') || 'Minggu',
    month: t('stats.month') || 'Bulan',
    year: t('stats.year') || 'Tahun',
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      <View style={{ flex: 1 }} ref={rootRef} collapsable={false}>

        <ScrollView ref={scrollViewRef} className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 130 }}>
          
          <View className="flex-row justify-between items-center mb-6 mt-4">
            <Text className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
              {t('stats.title')}
            </Text>
            <View className="flex-row items-center gap-2">
              {longestStreak > 0 && longestStreak > currentStreak && (
                <View className="flex-row items-center bg-gray-100 dark:bg-gray-800/60 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">
                  <Text className="text-gray-500 dark:text-gray-400 font-black text-sm mr-1">{longestStreak}</Text>
                  <Text className="text-sm">🏆</Text>
                </View>
              )}
              {currentStreak > 0 && (
                <View className="flex-row items-center bg-orange-50 dark:bg-orange-900/30 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
                  <Text className="text-orange-600 dark:text-orange-400 font-black text-sm mr-1">{currentStreak}</Text>
                  <Text className="text-sm">🔥</Text>
                </View>
              )}
              <Pressable onPress={() => router.push('/profile')} className="w-10 h-10 ml-1 rounded-full bg-gray-200 dark:bg-gray-800 items-center justify-center overflow-hidden">
                <Feather name="settings" size={18} color="#6B7280" />
              </Pressable>
            </View>
          </View>

          {/* GLOBAL DASHBOARD HEADER */}
          <View className="flex-row gap-3 mb-6" ref={timerRef} collapsable={false} onLayout={handleLayout(0)}>
            {/* TIME LEFT TODAY */}
            <View style={{ flex: 1.8 }} className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm shadow-gray-200 dark:shadow-none relative overflow-hidden">
              <View className="absolute top-0 right-0 p-3 opacity-10">
                <Feather name="clock" size={80} color="#F97316" />
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest text-[10px]">
                  {t('stats.timeLeftToday') || 'TIME LEFT TODAY'}
                </Text>
              </View>
              <View className="flex-row items-baseline">
                <Text className="font-black tabular-nums text-orange-600 dark:text-orange-500" style={{ fontSize: 36, lineHeight: 40 }} adjustsFontSizeToFit numberOfLines={1}>
                  {timeLeftObj.h.toString().padStart(2, '0')}:{timeLeftObj.m.toString().padStart(2, '0')}
                </Text>
                <Text className="font-bold text-orange-400" style={{ fontSize: 16, lineHeight: 20 }}>
                  :{timeLeftObj.s.toString().padStart(2, '0')}
                </Text>
              </View>
            </View>

            {/* LIFETIME DAYS LEFT */}
            <View style={{ flex: 1 }} className="bg-gray-900 dark:bg-gray-800 rounded-3xl p-4 shadow-sm shadow-gray-200 dark:shadow-none relative overflow-hidden">
              <View className="absolute top-0 right-0 p-2 opacity-10">
                <Feather name="battery" size={60} color="#10B981" />
              </View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-400 font-black uppercase tracking-widest text-[9px]" numberOfLines={1}>
                  {t('stats.lifeDays') || 'LIFETIME'}
                </Text>
              </View>
              <Text className="font-black text-white tabular-nums tracking-tighter" style={{ fontSize: 26, lineHeight: 30 }} adjustsFontSizeToFit numberOfLines={1}>
                {lifetimeDaysLeft.toLocaleString()}
              </Text>
              <Text className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{t('statsComp.daysLeft') || 'DAYS LEFT'}</Text>
            </View>
          </View>

          {/* TIME FILTER */}
          <View ref={filterRef} collapsable={false} onLayout={handleLayout(1)} className="flex-row bg-gray-200/80 dark:bg-gray-900 rounded-full p-1 mb-6">
            {(['day', 'week', 'month', 'year'] as Timeframe[]).map(tf => (
              <Pressable 
                key={tf} 
                onPress={() => setTimeframe(tf)} 
                className={`flex-1 items-center py-2.5 rounded-full transition-all ${timeframe === tf ? 'bg-blue-600 dark:bg-blue-500 shadow-sm' : ''}`}
              >
                <Text className={`font-bold text-xs uppercase tracking-wider ${timeframe === tf ? 'text-white' : 'text-gray-500'}`}>
                  {T_LABELS[tf]}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* VISUALISASI DYNAMIC */}
          <View ref={chartRef} collapsable={false} onLayout={handleLayout(2)}>
            <View className="mt-2">
              {timeframe === 'day' && <DailyDonutChart sessions={currentSessions} />}
              {timeframe === 'week' && <WeeklyBarChart sessions={sessions} daysCount={7} />}
              {timeframe === 'month' && <MonthlyLineChart sessions={sessions} daysCount={30} />}
              {timeframe === 'year' && <ContributionHeatmap sessions={sessions} />}
            </View>
          </View>

          {/* DISCIPLINE SCORECARD (TARGET VS ACTUAL) */}
          <View className="mb-8 mt-2">
            <View className="flex-row items-end justify-between mb-3">
              <View>
                <Text className="text-gray-500 dark:text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">{t('stats.disciplineScore') || 'SKOR DISIPLIN'}</Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className={`text-5xl font-black tracking-tighter ${adherenceScore >= 70 ? 'text-blue-600 dark:text-blue-500' : 'text-orange-500'}`}>
                    {plannedMinutes === 0 && executedMinutes === 0 ? '--' : adherenceScore}
                  </Text>
                  {plannedMinutes > 0 || executedMinutes > 0 ? (
                    <Text className="text-2xl font-bold text-gray-400">%</Text>
                  ) : null}
                </View>
              </View>

              <View className="items-end">
                <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                  {t('stats.actual') || 'EXECUTED'} <Text className="text-gray-300 mx-1">/</Text> {t('stats.target') || 'PLANNED'}
                </Text>
                <Text className="text-gray-900 dark:text-white font-black text-xl">
                  {(executedMinutes / 60).toFixed(1)} <Text className="text-gray-400 text-sm font-bold">/ {(plannedMinutes / 60).toFixed(1)} h</Text>
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="w-full h-4 bg-gray-200 dark:bg-gray-800 rounded-full flex-row overflow-hidden my-2">
              <View style={{ width: `${adherenceScore}%` }} className={`h-full ${adherenceScore >= 70 ? 'bg-blue-500' : 'bg-orange-500'}`} />
            </View>
          </View>

          {/* DAY LEGEND */}
          {timeframe === 'day' && (
            <View>
              <DailyLegend sessions={currentSessions} />
            </View>
          )}

          {/* SMART INSIGHTS */}
          <View className="-mx-6 px-6">
            <SmartInsights insights={insightsData} />
          </View>

          {/* VIEW HISTORY BUTTON */}
          <TouchableOpacity 
            onPress={() => setHistoryVisible(true)}
            className="mt-8 bg-gray-100 dark:bg-gray-900 py-4 rounded-2xl flex-row items-center justify-center border border-gray-200 dark:border-gray-800 active:bg-gray-200 dark:active:bg-gray-800"
          >
            <Feather name="list" size={18} color="#6B7280" className="mr-2" />
            <Text className="text-gray-700 dark:text-gray-300 font-bold ml-2">
              {t('stats.viewHistory') || 'Lihat Riwayat Sesi'}
            </Text>
          </TouchableOpacity>

        </ScrollView>

        {/* HISTORY MODAL */}
        <Modal visible={historyVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setHistoryVisible(false)}>
          <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top']}>
            <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-900">
              <Text className="text-xl font-black dark:text-white">{t('stats.history') || 'Riwayat Sesi'}</Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)} className="w-10 h-10 items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-full">
                <Feather name="x" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 px-6 py-4">
              <View className="gap-3 pb-20">
                {sortedSessions.map((session) => (
                  <View
                    key={session.id}
                    className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800/60"
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
                  <View className="items-center justify-center py-20">
                    <Feather name="inbox" size={48} color="#9CA3AF" className="mb-4 opacity-50" />
                    <Text className="text-center text-gray-500 font-medium">{t('stats.noSessionsYet')}</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>

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

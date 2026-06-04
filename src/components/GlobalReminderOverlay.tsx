import { useState, useEffect } from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { usePlanStore, Plan } from '@/store/usePlanStore';
import { useTimerStore } from '@/store/useTimerStore';
import * as Haptics from 'expo-haptics';

export function GlobalReminderOverlay() {
  const router = useRouter();
  const plans = usePlanStore(s => s.plans);
  const [notifiedPlanIds, setNotifiedPlanIds] = useState<Set<string>>(new Set());
  const [activeAlert, setActiveAlert] = useState<Plan | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeAlert) return; // Wait until current alert is dismissed

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const todayISO = now.toISOString().split('T')[0];
      const currentDayOfWeek = now.getDay();

      const triggeringPlan = plans.find(plan => {
        if (!plan.isReminderEnabled) return false;
        
        // Determine if plan should run today
        let isToday = false;
        if (plan.baseDate.startsWith(todayISO)) {
          isToday = true;
        } else if (plan.recurrence === 'daily') {
          isToday = true;
        } else if (plan.recurrence === 'specific_days' && plan.recurrenceDays?.includes(currentDayOfWeek)) {
          isToday = true;
        }

        const isTimeMatch = plan.startMinutes === currentMinutes;
        const isNotified = notifiedPlanIds.has(`${plan.id}-${todayISO}`);

        return isToday && isTimeMatch && !isNotified;
      });

      if (triggeringPlan) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setActiveAlert(triggeringPlan);
        setNotifiedPlanIds(prev => new Set(prev).add(`${triggeringPlan.id}-${todayISO}`));
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [plans, activeAlert, notifiedPlanIds]);

  if (!activeAlert) return null;

  const handleStartFocus = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const timerStore = useTimerStore.getState();
    
    // Set timer settings based on the plan
    timerStore.stopTimer(); // Reset if running
    timerStore.setTitle(activeAlert.title);
    timerStore.setMode('timer');
    timerStore.setDuration(activeAlert.durationMinutes * 60);
    
    // Route to timer tab and start
    router.push('/(tabs)/timer');
    
    // Give it a tiny delay to allow navigation to mount
    setTimeout(() => {
      timerStore.startTimer();
    }, 300);

    setActiveAlert(null);
  };

  const handleDismiss = () => {
    setActiveAlert(null);
  };

  return (
    <Modal visible={!!activeAlert} animationType="fade" transparent>
      <View className="flex-1 bg-black/60 justify-center px-6">
        <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl items-center border border-gray-100 dark:border-gray-800">
          <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full items-center justify-center mb-4">
            <Text className="text-3xl">🎯</Text>
          </View>
          
          <Text className="text-xl font-black text-gray-900 dark:text-white mb-2 text-center">
            Time to Execute!
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center font-medium mb-1">
            Your planned block is starting now:
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 text-lg font-black text-center mb-8">
            {activeAlert.title}
          </Text>

          <View className="w-full gap-3">
            <Pressable 
              onPress={handleStartFocus}
              className="w-full bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-500/30"
            >
              <Text className="text-white font-black uppercase tracking-widest text-sm">GASS! (Start Timer)</Text>
            </Pressable>
            
            <Pressable 
              onPress={handleDismiss}
              className="w-full py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center"
            >
              <Text className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-xs">Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

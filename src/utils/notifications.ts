import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Plan } from '@/store/usePlanStore';
import { Milestone } from '@/store/useTaskStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { translations, Language } from '@/constants/translations';

export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return false;
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
}

export async function schedulePlanNotification(plan: Plan) {
  if (Platform.OS === 'web') return;
  
  // Always cancel any existing notifications for this plan first
  await cancelPlanNotification(plan.id);
  
  if (!plan.isReminderEnabled) return;

  const permissionGranted = await requestNotificationPermissions();
  if (!permissionGranted) return;

  // Calculate the time
  const [y, m, dstr] = plan.baseDate.split('T')[0].split('-');
  const triggerDate = new Date(Number(y), Number(m) - 1, Number(dstr), Math.floor(plan.startMinutes / 60), plan.startMinutes % 60, 0, 0);

  const lang = useSettingsStore.getState().language as Language || 'en';
  const t = translations[lang].notifications;

  const content = {
    title: t.planTitle,
    body: t.planBody.replace('%{plan}', plan.title),
    data: { planId: plan.id, action: 'start_timer', durationMinutes: plan.durationMinutes },
    sound: true,
  };

  const hour = Math.floor(plan.startMinutes / 60);
  const minute = plan.startMinutes % 60;

  try {
    if (plan.recurrence === 'none') {
      if (triggerDate.getTime() > Date.now()) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
          identifier: plan.id,
        });
      }
    } else if (plan.recurrence === 'daily') {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute } as Notifications.DailyTriggerInput,
        identifier: plan.id,
      });
    } else if (plan.recurrence === 'weekdays') {
      // 2 = Monday, 3 = Tuesday, 4 = Wednesday, 5 = Thursday, 6 = Friday (Expo weekday is 1-indexed starting Sunday)
      for (let i = 2; i <= 6; i++) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: i, hour, minute } as Notifications.WeeklyTriggerInput,
          identifier: `${plan.id}-${i}`,
        });
      }
    } else if (plan.recurrence === 'weekly') {
      // getDay() is 0 (Sunday) to 6 (Saturday). Expo expects 1 (Sunday) to 7 (Saturday).
      const weekday = triggerDate.getDay() + 1;
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute } as Notifications.WeeklyTriggerInput,
        identifier: plan.id,
      });
    } else if (plan.recurrence === 'monthly') {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: triggerDate.getDate(), hour, minute } as Notifications.MonthlyTriggerInput,
        identifier: plan.id,
      });
    } else if (plan.recurrence === 'annually') {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: { type: Notifications.SchedulableTriggerInputTypes.YEARLY, month: triggerDate.getMonth(), day: triggerDate.getDate(), hour, minute } as Notifications.YearlyTriggerInput,
        identifier: plan.id,
      });
    } else if (plan.recurrence === 'specific_days' && plan.recurrenceDays) {
      for (const day of plan.recurrenceDays) {
        // plan.recurrenceDays is likely 0-6 (Sun-Sat), Expo expects 1-7
        const expoWeekday = day + 1;
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: { type: Notifications.SchedulableTriggerInputTypes.WEEKLY, weekday: expoWeekday, hour, minute } as Notifications.WeeklyTriggerInput,
          identifier: `${plan.id}-${expoWeekday}`,
        });
      }
    }
  } catch (err) {
    console.error('Failed to schedule plan notification', err);
  }
}

export async function cancelPlanNotification(planId: string) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(planId);
    // Also cancel any sub-identifiers for multi-day recurrences (weekdays, specific_days)
    for (let i = 1; i <= 7; i++) {
      await Notifications.cancelScheduledNotificationAsync(`${planId}-${i}`);
    }
  } catch (error) {
    // Ignore if not found
  }
}

export async function scheduleMilestoneNotification(milestone: Milestone) {
  if (Platform.OS === 'web') return;
  
  await cancelMilestoneNotification(milestone.id);
  
  if (!milestone.isReminderEnabled) return;

  const permissionGranted = await requestNotificationPermissions();
  if (!permissionGranted) return;

  const targetDateStr = milestone.startDate || milestone.date;
  const [y, m, dstr] = targetDateStr.split('T')[0].split('-');
  const triggerDate = new Date(Number(y), Number(m) - 1, Number(dstr), 9, 0, 0, 0);

  if (triggerDate.getTime() <= Date.now()) {
    return;
  }

  const lang = useSettingsStore.getState().language as Language || 'en';
  const t = translations[lang].notifications;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: t.milestoneTitle,
      body: t.milestoneBody.replace('%{milestone}', milestone.title),
      data: { milestoneId: milestone.id },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
    identifier: `milestone-${milestone.id}`, 
  });
}

export async function cancelMilestoneNotification(milestoneId: string) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`milestone-${milestoneId}`);
  } catch (error) {}
}

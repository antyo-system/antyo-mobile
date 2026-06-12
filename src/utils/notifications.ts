import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Plan } from '@/store/usePlanStore';
import { Milestone } from '@/store/useTaskStore';

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
  
  // Always cancel any existing notification for this plan first
  await cancelPlanNotification(plan.id);
  
  if (!plan.isReminderEnabled) return;

  const permissionGranted = await requestNotificationPermissions();
  if (!permissionGranted) return;

  // Calculate the exact trigger time
  const [y, m, dstr] = plan.baseDate.split('T')[0].split('-');
  const triggerDate = new Date(Number(y), Number(m) - 1, Number(dstr), Math.floor(plan.startMinutes / 60), plan.startMinutes % 60, 0, 0);

  // If the plan is recurring, we could advance the date.
  // For MVP, if the trigger is in the past, we don't schedule it.
  if (triggerDate.getTime() <= Date.now()) {
    // Future enhancement: Handle recurring dates to schedule for the next occurrence.
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Waktunya Fokus! 🎯',
      body: `Plan "${plan.title}" akan segera dimulai. Tap untuk mulai timer!`,
      data: { planId: plan.id, action: 'start_timer', durationMinutes: plan.durationMinutes },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
    identifier: plan.id, // Using plan.id allows easy cancellation
  });
}

export async function cancelPlanNotification(planId: string) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(planId);
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

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Timeline Dimulai! 🚀',
      body: `Timeline "${milestone.title}" dijadwalkan mulai hari ini.`,
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

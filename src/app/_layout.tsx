import '../global.css';

import { Stack } from 'expo-router';
import { useColorScheme, LogBox, Appearance, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { GlobalReminderOverlay } from '@/components/GlobalReminderOverlay';
import * as Notifications from 'expo-notifications';
import { useTimerStore } from '@/store/useTimerStore';
import { usePlanStore } from '@/store/usePlanStore';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Ignore harmless strict-mode warnings from Reanimated triggered by NativeWind's internal Pressable CSS interop.
LogBox.ignoreLogs([
  '[Reanimated] Reading from `value` during component render',
  '[Reanimated] Writing to `value` during component render',
]);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appearanceSetting = useSettingsStore(s => s.appearance);

  useEffect(() => {
    SplashScreen.hideAsync();

    // Setup Notification Tap Listener
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.action === 'start_timer' && data?.planId) {
        const plans = usePlanStore.getState().plans;
        const plan = plans.find(p => p.id === data.planId);
        
        if (plan) {
          const timerStore = useTimerStore.getState();
          timerStore.setDuration(plan.durationMinutes * 60);
          if (plan.title) timerStore.setTitle(plan.title);
          if (plan.skillId) timerStore.setSelectedSkillId(plan.skillId);
          if (plan.pillarId) timerStore.setSelectedPillarId(plan.pillarId);
          
          timerStore.startTimer();
          
          // Small delay to ensure stores are updated before routing
          setTimeout(() => {
            router.replace('/');
          }, 100);
        }
      }
    });

    return () => subscription.remove();
  }, []);

  // Enforce Theme based on settings
  useEffect(() => {
    if (Platform.OS !== 'web') {
      if (appearanceSetting === 'system') {
        Appearance.setColorScheme(null); // Reset to system
      } else {
        Appearance.setColorScheme(appearanceSetting);
      }
    }
  }, [appearanceSetting]);

  return (
    <GestureHandlerRootView style={{ flex: 1, overflow: 'hidden' }}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
      </Stack>
      <GlobalReminderOverlay />
    </GestureHandlerRootView>
  );
}

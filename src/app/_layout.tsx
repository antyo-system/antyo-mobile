import '../global.css';

import { Stack, ErrorBoundaryProps } from 'expo-router';
import { useColorScheme, LogBox, Appearance, Platform, View, Text, Pressable, SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import * as Notifications from 'expo-notifications';
import { useTimerStore } from '@/store/useTimerStore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Sentry from '@sentry/react-native';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/lib/posthog';
import * as Haptics from 'expo-haptics';

Sentry.init({
  dsn: '__YOUR_DSN__',
  debug: false,
  tracesSampleRate: 1.0,
});

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

function RootLayout() {
  const colorScheme = useColorScheme();
  const appearanceSetting = useSettingsStore(s => s.appearance);

  const hasHydrated = useAppStore(s => s._hasHydrated);

  // Keep splash screen visible while loading
  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync().catch(() => {});
    }

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
          
          const isHapticsEnabled = useSettingsStore.getState().hapticsEnabled;
          if (isHapticsEnabled) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          }
          
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

  if (!hasHydrated) {
    return null; // Or a minimal loading view, but splash screen is covering it
  }

  return (
    <PostHogProvider client={posthog}>
      <GestureHandlerRootView style={{ flex: 1, overflow: 'hidden' }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
        </Stack>
      </GestureHandlerRootView>
    </PostHogProvider>
  );
}

export default Sentry.wrap(RootLayout);

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950">
      <View className="flex-1 justify-center items-center p-6">
        <View className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 items-center">
          <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 justify-center items-center mb-6">
            <Ionicons name="warning" size={32} color="#EF4444" />
          </View>
          <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
            Something went wrong
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
            {error.message || "An unexpected error occurred. Please try again."}
          </Text>
          <Pressable 
            onPress={retry}
            className="w-full bg-blue-600 active:bg-blue-700 py-4 rounded-xl items-center mb-3"
          >
            <Text className="text-white font-semibold text-base">Try Again</Text>
          </Pressable>
          <Pressable 
            onPress={() => router.replace('/')}
            className="w-full py-4 rounded-xl items-center"
          >
            <Text className="text-gray-500 dark:text-gray-400 font-semibold text-base">Return Home</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

import '../global.css';

import { Stack } from 'expo-router';
import { useColorScheme, LogBox, Appearance, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { GlobalReminderOverlay } from '@/components/GlobalReminderOverlay';

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
    <GestureHandlerRootView style={{ flex: 1 }}>
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

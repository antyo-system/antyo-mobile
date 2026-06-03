import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function Index() {
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Avoid hydration mismatch by waiting for first render
    setIsReady(true);
  }, []);

  if (!isReady) return <View className="flex-1 bg-black" />;

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

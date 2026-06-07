import { Redirect } from 'expo-router';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useState } from 'react';
import { View, Image } from 'react-native';

export default function Index() {
  const hasSeenOnboarding = useAppStore(state => state.hasSeenOnboarding);
  const _hasHydrated = useAppStore(state => state._hasHydrated);

  if (!_hasHydrated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <Image 
          // @ts-ignore
          source={require('../assets/images/logo.png')} 
          style={{ width: 120, height: 120 }} 
          resizeMode="contain" 
        />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

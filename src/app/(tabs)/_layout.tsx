import { View, Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTimerStore } from '@/store/useTimerStore';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const status = useTimerStore(s => s.status);

  // Hide Navbar when timer is active
  if (status !== 'idle') return null;

  return (
    <View className="absolute bottom-6 left-12 right-12 bg-white dark:bg-gray-900 rounded-full shadow-2xl flex-row items-center justify-between px-4 py-2 border border-gray-100 dark:border-gray-800">
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate(route.name);
          }
        };

        // Icon Mapping based on route name
        let icon = '⏱️';
        if (route.name === 'calendar') icon = '📅';
        if (route.name === 'stats') icon = '📊';

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className={`flex-row items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              isFocused ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-transparent'
            }`}
          >
            <Text className="text-lg">{icon}</Text>
            {isFocused && (
              <Text className="text-blue-600 dark:text-blue-400 font-bold text-xs tracking-wide">
                {options.title}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Focus' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats' }} />
    </Tabs>
  );
}

import { View, Pressable, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimerStore } from '@/store/useTimerStore';
import { useTranslation } from '@/hooks/useTranslation';

function CustomTabBar({ state, descriptors, navigation }: any) {
  const status = useTimerStore(s => s.status);
  const insets = useSafeAreaInsets();

  const focusedRoute = state.routes[state.index];
  const focusedOptions = descriptors[focusedRoute.key].options;

  // Hide Navbar when timer is active or when explicitly hidden (e.g. during tutorial)
  if (status !== 'idle' || focusedOptions.tabBarStyle?.display === 'none') return null;

  return (
    <View 
      className="absolute left-12 right-12 bg-white dark:bg-gray-900 rounded-full shadow-2xl flex-row items-center justify-between px-4 py-2 border border-gray-100 dark:border-gray-800"
      style={{ bottom: Math.max(insets.bottom + 12, 24) }}
    >
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
        let IconComponent = <Feather name="clock" size={24} color={isFocused ? "#2563eb" : "#64748b"} />;
        if (route.name === 'calendar') IconComponent = <Feather name="calendar" size={24} color={isFocused ? "#2563eb" : "#64748b"} />;
        if (route.name === 'stats') IconComponent = <Feather name="bar-chart-2" size={24} color={isFocused ? "#2563eb" : "#64748b"} />;
        if (route.name === 'mastery') IconComponent = <Feather name="award" size={24} color={isFocused ? "#2563eb" : "#64748b"} />;

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className={`flex-row items-center gap-2 px-3 py-2 rounded-full transition-colors ${
              isFocused ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-transparent'
            }`}
          >
            {IconComponent}
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
  const { t } = useTranslation();

  return (
    <Tabs 
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.focus') }} />
      <Tabs.Screen name="calendar" options={{ title: t('tabs.calendar') }} />
      <Tabs.Screen name="mastery" options={{ title: t('tabs.mastery') }} />
      <Tabs.Screen name="stats" options={{ title: t('tabs.stats') }} />
    </Tabs>
  );
}

import { View, Text, ScrollView, Pressable, Animated, Image, useColorScheme, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '@/store/useAppStore';
import { router } from 'expo-router';
import { useRef, useState } from 'react';


const SLIDES = [
  {
    id: '0',
    title: 'ANTYO Focus',
    subtitle: 'Reclaim your time. Master your focus.',
    isLogo: true,
    bg: 'bg-transparent',
  },
  {
    id: '1',
    title: 'Plan vs. Reality',
    subtitle: 'Bridge the gap between what you plan and what you actually do.',
    icon: 'calendar',
    color: 'text-gray-900 dark:text-white',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    id: '2',
    title: 'Deep Work, Tracked.',
    subtitle: 'Our AI camera detects when you look away and pauses the timer automatically.',
    icon: 'eye',
    color: 'text-gray-900 dark:text-white',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    id: '3',
    title: 'Know Your Habits',
    subtitle: 'Daily, weekly, and monthly insights to help you build unshakeable focus.',
    icon: 'bar-chart-2',
    color: 'text-gray-900 dark:text-white',
    bg: 'bg-gray-100 dark:bg-gray-800',
  }
];

export default function OnboardingScreen() {
  const { width, height } = useWindowDimensions();
  const setHasSeenOnboarding = useAppStore(s => s.setHasSeenOnboarding);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme();

  const handleFinish = () => {
    setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      scrollViewRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    } else {
      handleFinish();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, index) => {
          return (
            <View key={slide.id} style={{ width, height: height * 0.75 }} className="items-center justify-center px-8">
              {slide.isLogo ? (
                <View className="w-48 h-48 mb-10 items-center justify-center">
                  <Image 
                    // @ts-ignore
                    source={require('../assets/images/logo.png')} 
                    style={{ width: 160, height: 160 }} 
                    resizeMode="contain" 
                  />
                </View>
              ) : (
                <View className={`w-32 h-32 rounded-full items-center justify-center mb-10 ${slide.bg}`}>
                  <Feather name={slide.icon as any} size={48} className={slide.color} />
                </View>
              )}
              
              <Text className="text-3xl font-black text-gray-900 dark:text-white text-center mb-4 tracking-tight">
                {slide.title}
              </Text>
              
              <Text className="text-base font-medium text-gray-500 dark:text-gray-400 text-center leading-relaxed px-4">
                {slide.subtitle}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination & Controls */}
      <View className="absolute bottom-12 left-0 right-0 px-8">
        
        {/* Dots */}
        <View className="flex-row justify-center items-center mb-10 space-x-2">
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={i}
                style={{ width: dotWidth, opacity }}
                className="h-2 rounded-full bg-gray-900 dark:bg-gray-100 mx-1"
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View className="flex-row justify-between items-center">
          <Pressable 
            onPress={handleFinish}
            className="px-4 py-3"
          >
            <Text className="text-gray-500 dark:text-gray-400 font-bold tracking-wider uppercase text-xs">Skip</Text>
          </Pressable>

          <Pressable 
            onPress={handleNext}
            className="bg-gray-900 dark:bg-white px-8 py-4 rounded-full active:opacity-80 shadow-sm"
          >
            <Text className="text-white dark:text-black font-black uppercase tracking-wider text-xs">
              {currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
}

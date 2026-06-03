import { useState } from 'react';
import { Pressable, Text, View, Modal } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTimerStore } from '@/store/useTimerStore';
import { useSessionStore } from '@/store/useSessionStore';

function AnimatedButton({ onPress, className, children }: { onPress: () => void, className: string, children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 200 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
        className={className}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

export function TimerControls() {
  const { status, startTimer, pauseTimer, stopTimer, isSmartMode } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      startTimer: s.startTimer,
      pauseTimer: s.pauseTimer,
      stopTimer: s.stopTimer,
      isSmartMode: s.isSmartMode,
    }))
  );

  const [modalVisible, setModalVisible] = useState(false);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimer();
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    pauseTimer();
  };

  const handleGiveUpPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setModalVisible(true);
  };

  const confirmGiveUp = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setModalVisible(false);
    stopTimer(); // Abandon without saving
  };

  return (
    <View className="items-center justify-center w-full px-8 mt-4 h-24">
      {status === 'idle' && (
        <AnimatedButton 
          onPress={handleStart} 
          className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center shadow-lg"
        >
          <Text className="text-white text-3xl ml-1">▶</Text>
        </AnimatedButton>
      )}

      {status === 'running' && !isSmartMode && (
        <AnimatedButton 
          onPress={handlePause} 
          className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-full items-center justify-center"
        >
          <Text className="text-blue-600 dark:text-blue-400 text-3xl font-bold">⏸</Text>
        </AnimatedButton>
      )}

      {status === 'running' && isSmartMode && (
        <AnimatedButton 
          onPress={handleGiveUpPress} 
          className="flex-row items-center justify-center gap-2 px-8 py-4 bg-transparent border border-red-200 dark:border-red-800 rounded-full"
        >
          <Text className="text-red-500 font-bold text-lg mb-0.5">✕</Text>
          <Text className="text-red-600 dark:text-red-500 font-bold text-lg">Give Up</Text>
        </AnimatedButton>
      )}

      {status === 'paused' && (
        <View className="flex-row items-center gap-6">
          <AnimatedButton 
            onPress={handleStart} 
            className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center shadow-lg"
          >
            <Text className="text-white text-3xl ml-1">▶</Text>
          </AnimatedButton>
          
          <AnimatedButton 
            onPress={handleGiveUpPress} 
            className="w-20 h-20 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-full items-center justify-center"
          >
            <Text className="text-red-600 dark:text-red-400 text-2xl font-bold">⏹</Text>
          </AnimatedButton>
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/30 px-6">
          <View className="bg-white dark:bg-gray-800 w-full rounded-3xl p-6 shadow-xl">
            <View className="flex-row items-center gap-3 mb-4">
              <Text className="text-red-500 text-2xl">⚠️</Text>
              <Text className="text-gray-900 dark:text-gray-100 text-xl font-bold">Abandon Session?</Text>
            </View>
            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-8 text-base leading-relaxed">
              Are you sure you want to give up this session? Your progress will be lost.
            </Text>
            <View className="gap-3 w-full">
              <Pressable 
                onPress={confirmGiveUp}
                className="bg-red-500 w-full py-4 rounded-2xl items-center"
              >
                <Text className="text-white font-bold text-lg">Give Up</Text>
              </Pressable>
              <Pressable 
                onPress={() => setModalVisible(false)}
                className="bg-transparent border border-gray-300 dark:border-gray-600 w-full py-4 rounded-2xl items-center"
              >
                <Text className="text-gray-700 dark:text-gray-300 font-bold text-lg">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

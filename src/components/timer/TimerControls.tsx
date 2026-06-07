import { useState } from 'react';
import { Pressable, Text, View, Modal, useColorScheme } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTimerStore } from '@/store/useTimerStore';
import { Ionicons } from '@expo/vector-icons';

function AnimatedButton({ onPress, className, children }: { onPress: () => void, className: string, children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.9, { damping: 15, stiffness: 200 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 200 }); }}
        className={className}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

interface TimerControlsProps {
  onSaveAndStop: () => void;
  playButtonRef?: React.Ref<View>;
}

export function TimerControls({ onSaveAndStop, playButtonRef }: TimerControlsProps) {
  const { status, startTimer, pauseTimer, stopTimer, mode, sessionType } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      startTimer: s.startTimer,
      pauseTimer: s.pauseTimer,
      stopTimer: s.stopTimer,
      mode: s.mode,
      sessionType: s.sessionType,
    }))
  );

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const [stopConfirmVisible, setStopConfirmVisible] = useState(false);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startTimer();
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    pauseTimer();
  };

  const handleStopPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setStopConfirmVisible(true);
  };

  return (
    <View className="items-center justify-center w-full px-8 mt-4 min-h-[120px]">
      {status === 'idle' && (
        <View ref={playButtonRef} collapsable={false}>
          <AnimatedButton 
            onPress={handleStart} 
            className="items-center justify-center p-4"
          >
            <Ionicons name="play" size={72} color={iconColor} />
          </AnimatedButton>
        </View>
      )}

      {status === 'running' && (
        <View className="flex-row items-center gap-12">
          <AnimatedButton 
            onPress={handlePause} 
            className="items-center justify-center p-4"
          >
            <Ionicons name="pause" size={72} color={iconColor} />
          </AnimatedButton>
          <AnimatedButton 
            onPress={handleStopPress} 
            className="items-center justify-center p-4"
          >
            <Ionicons name="stop" size={72} color={iconColor} />
          </AnimatedButton>
        </View>
      )}

      {status === 'paused' && (
        <View className="flex-row items-center gap-12">
          <AnimatedButton 
            onPress={handleStart} 
            className="items-center justify-center p-4"
          >
            <Ionicons name="play" size={72} color={iconColor} />
          </AnimatedButton>
          
          <AnimatedButton 
            onPress={handleStopPress} 
            className="items-center justify-center p-4"
          >
            <Ionicons name="stop" size={72} color={iconColor} />
          </AnimatedButton>
        </View>
      )}

      {/* Confirmation Modal */}
      <Modal visible={stopConfirmVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl items-center border border-gray-100 dark:border-gray-800">
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${sessionType === 'break' ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
              <Text className="text-3xl">{sessionType === 'break' ? '⏭️' : '⚠️'}</Text>
            </View>
            <Text className="text-xl font-black text-gray-900 dark:text-white mb-2 text-center">
              {sessionType === 'break' ? 'Skip Break?' : 'End Session?'}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center font-medium mb-8">
              {sessionType === 'break' 
                ? 'Are you sure you want to skip the rest of your break?' 
                : 'Are you sure you want to stop this focus session? Your current progress will be saved.'}
            </Text>
            
            <View className="flex-row gap-3 w-full">
              <Pressable 
                onPress={() => setStopConfirmVisible(false)}
                className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 rounded-2xl items-center"
              >
                <Text className="font-bold text-gray-600 dark:text-gray-300">Cancel</Text>
              </Pressable>
              
              <Pressable 
                onPress={() => {
                  setStopConfirmVisible(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  onSaveAndStop();
                }}
                className={`flex-1 py-4 rounded-2xl items-center shadow-lg ${sessionType === 'break' ? 'bg-orange-600 shadow-orange-500/30' : 'bg-red-600 shadow-red-500/30'}`}
              >
                <Text className="font-bold text-white">
                  {sessionType === 'break' ? 'Skip' : 'End'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

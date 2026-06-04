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
}

export function TimerControls({ onSaveAndStop }: TimerControlsProps) {
  const { status, startTimer, pauseTimer, stopTimer, mode } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      startTimer: s.startTimer,
      pauseTimer: s.pauseTimer,
      stopTimer: s.stopTimer,
      mode: s.mode,
    }))
  );

  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#FFFFFF' : '#000000';

  const [modalVisible, setModalVisible] = useState(false);

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
    // Directly finish and save when they hit stop
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaveAndStop();
  };

  return (
    <View className="items-center justify-center w-full px-8 mt-4 h-24">
      {status === 'idle' && (
        <AnimatedButton 
          onPress={handleStart} 
          className="items-center justify-center p-4"
        >
          <Ionicons name="play" size={72} color={iconColor} />
        </AnimatedButton>
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
    </View>
  );
}

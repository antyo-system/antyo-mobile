import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get('window');
// Cap the maximum width to 280px so it has elegant breathing room
const containerWidth = Math.min(width * 0.7, 280); 
const CIRCLE_RADIUS = containerWidth / 2;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
const STROKE_WIDTH = 6;
const CENTER = CIRCLE_RADIUS + STROKE_WIDTH;
const SVG_SIZE = CIRCLE_RADIUS * 2 + STROKE_WIDTH * 2;

export function CircularTimer({ children }: { children: React.ReactNode }) {
  const { mode, status, timeLeft, duration, timeElapsed } = useTimerStore(
    useShallow((s) => ({
      mode: s.mode,
      status: s.status,
      timeLeft: s.timeLeft,
      duration: s.duration,
      timeElapsed: s.timeElapsed,
    }))
  );

  const progress = useSharedValue(1);

  useEffect(() => {
    if (mode === 'timer') {
      // Calculate how much of the circle should be filled (1 = full, 0 = empty)
      const currentProgress = timeLeft / duration;
      
      // If the timer is actively running, animate the stroke linearly to the exact second
      if (status === 'running') {
        progress.value = withTiming(currentProgress, { 
          duration: 1000, 
          easing: Easing.linear 
        });
      } else {
        // If paused, idle, or stopped, snap to the exact value
        progress.value = withTiming(currentProgress, { 
          duration: 300, 
          easing: Easing.out(Easing.ease) 
        });
      }
    } else {
      // Stopwatch mode: Circle is always full, or we could make it pulsate
      progress.value = withTiming(1, { duration: 500 });
    }
  }, [timeLeft, duration, status, mode, progress]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: CIRCLE_CIRCUMFERENCE * (1 - progress.value)
    };
  });

  return (
    <View className="items-center justify-center relative" pointerEvents="box-none">
      <Svg 
        width={SVG_SIZE} 
        height={SVG_SIZE}
        pointerEvents="none"
        style={{ opacity: status === 'running' ? 0 : 1 }}
      >
        {/* Rotate the group instead of the SVG to fix mobile rendering bugs */}
        <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
          {/* Background Track Circle */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            stroke="rgba(156, 163, 175, 0.15)" // Tailwind gray-400 with 15% opacity
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
          />
          
          {/* Animated Progress Circle */}
          <AnimatedCircle
            cx={CENTER}
            cy={CENTER}
            r={CIRCLE_RADIUS}
            stroke="#2563eb" // Tailwind blue-600
            strokeWidth={STROKE_WIDTH}
            fill="transparent"
            strokeDasharray={`${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      
      {/* Absolute positioning to place the children (Timer Text + Input) exactly in the center */}
      <View className="absolute items-center justify-center top-0 bottom-0 left-0 right-0" pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
}

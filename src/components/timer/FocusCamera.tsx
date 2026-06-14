import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import SmartCameraView from '../../../modules/expo-smart-camera/src/SmartCameraView';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';
import { formatTime } from '@/utils/time';
import { Feather } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

interface Props {
  isVisible: boolean; // Managed by parent (index.tsx)
  onClose?: () => void;
  onMaximize?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PIP_WIDTH = 120;
const PIP_HEIGHT = 160;

export function FocusCamera({ isVisible, onClose, onMaximize }: Props) {
  const { 
    status, isSmartMode, setCurrentlyDistracted,
    timeLeft, focusTimeElapsed, distractedTimeElapsed, isCurrentlyDistracted 
  } = useTimerStore(
    useShallow((s) => ({
      status: s.status,
      isSmartMode: s.isSmartMode,
      setCurrentlyDistracted: s.setCurrentlyDistracted,
      timeLeft: s.timeLeft,
      focusTimeElapsed: s.focusTimeElapsed,
      distractedTimeElapsed: s.distractedTimeElapsed,
      isCurrentlyDistracted: s.isCurrentlyDistracted
    }))
  );

  const [isMinimized, setIsMinimized] = useState(false);

  const faceX = useSharedValue(0);
  const faceY = useSharedValue(0);
  const faceW = useSharedValue(0);
  const faceH = useSharedValue(0);
  const isFaceVisible = useSharedValue(false);
  const isFaceFocused = useSharedValue(false);

  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Handle restoring to full screen when parent makes it visible again
  useEffect(() => {
    if (isVisible && isMinimized) {
      setIsMinimized(false);
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  }, [isVisible]);
  const handleStatusChanged = (event: any) => {
    const isDistracted = event.nativeEvent.isDistracted;
    runOnJS(setCurrentlyDistracted)(isDistracted);
    isFaceFocused.value = !isDistracted;
    isFaceVisible.value = true;
  };

  const handleFacesDetected = (event: any) => {
    const { x, y, width, height } = event.nativeEvent;
    if (width > 0 && height > 0) {
      isFaceVisible.value = true;
      faceX.value = x * SCREEN_WIDTH;
      faceY.value = y * SCREEN_HEIGHT;
      faceW.value = width * SCREEN_WIDTH;
      faceH.value = height * SCREEN_HEIGHT;
    } else {
      isFaceVisible.value = true;
      faceW.value = 200;
      faceH.value = 200;
      faceX.value = (SCREEN_WIDTH / 2) - 100;
      faceY.value = (SCREEN_HEIGHT / 2) - 100;
    }
  };

  // Floating Window Gestures
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const contextX = useSharedValue(0);
  const contextY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(isMinimized)
    .onStart(() => {
      contextX.value = translateX.value;
      contextY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (!isMinimized) return;
      translateX.value = contextX.value + event.translationX;
      translateY.value = contextY.value + event.translationY;
    })
    .onEnd(() => {
      if (!isMinimized) return;
      // Keep it within screen bounds roughly
      const maxX = SCREEN_WIDTH - PIP_WIDTH - 20;
      const maxY = SCREEN_HEIGHT - PIP_HEIGHT - 100;
      
      let finalX = translateX.value;
      let finalY = translateY.value;
      
      if (finalX < 20) finalX = 20;
      if (finalX > maxX) finalX = maxX;
      if (finalY < 40) finalY = 40;
      if (finalY > maxY) finalY = maxY;
      
      translateX.value = withSpring(finalX);
      translateY.value = withSpring(finalY);
    });

  const containerStyle = useAnimatedStyle(() => {
    if (!isMinimized) {
      return {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 100,
        borderRadius: 0,
        transform: [{ translateX: 0 }, { translateY: 0 }]
      };
    }
    return {
      position: 'absolute',
      width: PIP_WIDTH,
      height: PIP_HEIGHT,
      zIndex: 100,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: isCurrentlyDistracted ? '#ef4444' : '#22c55e',
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value }
      ]
    };
  });

  const boundingBoxStyle = useAnimatedStyle(() => {
    // Bounding Box (Kaku, tanpa animasi, responsif)
    const isVisible = isFaceVisible.value && !isMinimized;
    return {
      position: 'absolute',
      left: faceX.value,
      top: faceY.value,
      width: faceW.value,
      height: faceH.value,
      borderWidth: 3,
      borderColor: isFaceFocused.value ? '#22c55e' : '#ef4444', // Hijau jika fokus, Merah jika distraksi
      display: isVisible ? 'flex' : 'none',
      zIndex: 999
    };
  });

  const shouldRun = isSmartMode && status === 'running';

  if (!shouldRun || !hasPermission) {
    return null;
  }

  // If we are completely hidden via the top level, return nothing.
  if (!isVisible && !isMinimized) {
    return (
      <View style={styles.hiddenContainer} pointerEvents="none">
        <SmartCameraView 
          style={StyleSheet.absoluteFill} 
          onStatusChanged={handleStatusChanged}
          onFacesDetected={handleFacesDetected}
        />
      </View>
    );
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.visibleContainer, containerStyle]}>
        <SmartCameraView 
          style={StyleSheet.absoluteFill} 
          onStatusChanged={handleStatusChanged}
          onFacesDetected={handleFacesDetected}
        />
        
        {/* Zero-Delay Face Bounding Box */}
        <Animated.View style={boundingBoxStyle} />

        {/* HUD Overlay - OpenCV Style */}
        {!isMinimized && (
          <View className="absolute inset-0 pointer-events-box-none">
            {/* STATUS TEXT */}
            <View className="absolute top-[60px] left-[30px]">
              <Text style={{
                fontFamily: 'monospace',
                fontSize: 32,
                fontWeight: 'bold',
                color: isCurrentlyDistracted ? '#ef4444' : '#22c55e',
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 2
              }}>
                {isCurrentlyDistracted ? 'DISTRAKSI' : 'FOKUS'}
              </Text>
            </View>

            {/* SECONDS */}
            <View className="absolute top-[100px] left-[30px]">
              <Text style={{
                fontFamily: 'monospace',
                fontSize: 32,
                fontWeight: 'bold',
                color: isCurrentlyDistracted ? '#ef4444' : '#ffffff',
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 2
              }}>
                {isCurrentlyDistracted ? distractedTimeElapsed : focusTimeElapsed}s
              </Text>
            </View>

            {/* TOTAL WAKTU */}
            <View className="absolute bottom-[40px] right-[20px]">
              <Text style={{
                fontFamily: 'monospace',
                fontSize: 16,
                color: '#d1d5db',
                textShadowColor: 'rgba(0,0,0,0.8)',
                textShadowOffset: {width: 1, height: 1},
                textShadowRadius: 2
              }}>
                Total Waktu: {focusTimeElapsed + distractedTimeElapsed}s
              </Text>
            </View>

            {/* Controls (Close & Minimize) */}
            <View className="absolute top-[50px] right-[20px] flex-row gap-4 pointer-events-auto">
              <Pressable 
                onPress={() => {
                  setIsMinimized(true);
                  translateX.value = SCREEN_WIDTH - PIP_WIDTH - 20;
                  translateY.value = SCREEN_HEIGHT - PIP_HEIGHT - 120;
                  onClose?.(); 
                }}
                className="bg-black/30 p-2 rounded-full"
              >
                <Feather name="minimize-2" size={20} color="white" />
              </Pressable>
              <Pressable onPress={() => onClose?.()} className="bg-black/30 p-2 rounded-full">
                <Feather name="x" size={20} color="white" />
              </Pressable>
            </View>
          </View>
        )}

        {/* PiP Overlay */}
        {isMinimized && (
          <Pressable 
            onPress={() => {
              setIsMinimized(false);
              onMaximize?.();
            }}
            className="absolute inset-0 justify-center items-center bg-black/20"
          >
            <Feather name="maximize-2" size={24} color="white" style={{ opacity: 0.5 }} />
          </Pressable>
        )}

      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  visibleContainer: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  hiddenContainer: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0.01,
    zIndex: -1,
  }
});

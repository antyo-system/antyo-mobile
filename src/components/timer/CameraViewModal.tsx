import { View, Text, Modal, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Camera, Face } from 'react-native-vision-camera-face-detector';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';
import { useCallback, useEffect } from 'react';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function CameraViewModal({ visible, onClose }: Props) {
  const { isDistracted, setDistracted } = useTimerStore(
    useShallow((s) => ({
      isDistracted: s.isDistracted,
      setDistracted: s.setDistracted,
    }))
  );

  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (visible && !hasPermission) {
      requestPermission();
    }
  }, [visible, hasPermission, requestPermission]);

  const handleFacesDetected = useCallback((faces: Face[]) => {
    if (faces.length === 0) {
      if (!isDistracted) setDistracted(true);
    } else {
      if (isDistracted) setDistracted(false);
    }
  }, [isDistracted, setDistracted]);

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }} edges={['top', 'bottom']}>
        <View className="flex-1 relative overflow-hidden rounded-b-3xl">
          {!hasPermission && (
            <View className="flex-1 items-center justify-center bg-black">
              <ActivityIndicator size="large" color="white" />
              <Text className="text-white mt-4 font-bold">Requesting Camera Permission...</Text>
            </View>
          )}

          {!!device && hasPermission && (
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={visible}
              performanceMode="fast"
              onFacesDetected={handleFacesDetected}
              onError={(error) => console.error('Camera Error:', error)}
            />
          )}
          
          {/* Overlay UI */}
          <View className="absolute top-0 bottom-0 left-0 right-0 justify-between p-6" pointerEvents="box-none">
            
            {/* Top Controls */}
            <View className="flex-row justify-between items-center w-full" pointerEvents="box-none">
              <Pressable 
                onPress={onClose}
                className="w-12 h-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
              >
                <Text className="text-white text-xl">👁️‍🗨️</Text>
              </Pressable>

              <View className={`px-4 py-2 rounded-full backdrop-blur-md border border-white/20 ${isDistracted ? 'bg-red-500/80' : 'bg-green-500/80'}`}>
                <Text className="text-white font-bold tracking-widest text-sm uppercase">
                  {isDistracted ? 'Distracted' : 'Focused'}
                </Text>
              </View>

              <Pressable 
                onPress={onClose}
                className="w-12 h-12 bg-black/40 rounded-full items-center justify-center backdrop-blur-md"
              >
                <Text className="text-white text-xl font-bold">×</Text>
              </Pressable>
            </View>

            {/* Status Indicator for Testing */}
            <View className="bg-black/60 p-6 rounded-2xl backdrop-blur-md border border-white/10 items-center">
              <Text className="text-white font-bold text-center mb-2">
                Live Face Detection Active
              </Text>
              <Text className="text-gray-400 text-xs text-center">
                Look away from the screen to see the status change to "Distracted" and automatically pause the timer.
              </Text>
            </View>

          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

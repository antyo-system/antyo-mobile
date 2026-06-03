import { View, Text, Switch, Pressable, Platform, LayoutAnimation } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTimerStore } from '@/store/useTimerStore';
import { useShallow } from 'zustand/react/shallow';
import { useCameraPermission } from 'react-native-vision-camera';
import * as Haptics from 'expo-haptics';

interface Props {
  onViewPress: () => void;
}

export function SmartModeToggle({ onViewPress }: Props) {
  const { isSmartMode, setSmartMode, cameraPermissionStatus, setCameraPermission } = useTimerStore(
    useShallow((s) => ({
      isSmartMode: s.isSmartMode,
      setSmartMode: s.setSmartMode,
      cameraPermissionStatus: s.cameraPermissionStatus,
      setCameraPermission: s.setCameraPermission,
    }))
  );

  const { hasPermission, requestPermission } = useCameraPermission();

  const handleToggle = async (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (value) {
      // User wants to turn on Smart Mode
      if (!hasPermission) {
        const granted = await requestPermission();
        setCameraPermission(granted ? 'granted' : 'denied');
        if (granted) {
          setSmartMode(true);
        } else {
          setSmartMode(false);
        }
      } else {
        setCameraPermission('granted');
        setSmartMode(true);
      }
    } else {
      setSmartMode(false);
    }
  };

  return (
    <View className="items-center w-full">
      <View className="flex-row items-center justify-center gap-4">
        {/* Toggle Container */}
        <View className="flex-row items-center gap-2">
          <Switch
            value={isSmartMode}
            onValueChange={handleToggle}
            trackColor={{ false: '#d1d5db', true: '#6366f1' }} // Tailwind indigo-500
            thumbColor={isSmartMode ? '#ffffff' : '#f3f4f6'}
            ios_backgroundColor="#d1d5db"
            style={{ transform: [{ scale: 0.8 }] }}
          />
          <Text className="text-gray-500 dark:text-gray-400 font-medium text-sm">
            Smart Mode
          </Text>
        </View>

        {/* View Button (Only visible if Smart Mode is ON) */}
        {isSmartMode && (
          <Pressable 
            onPress={onViewPress}
            className="flex-row items-center gap-1.5 active:opacity-60 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full"
          >
            <Feather name="video" size={16} color="#0f172a" />
            <Text className="text-gray-700 dark:text-gray-300 font-bold text-xs">View</Text>
          </Pressable>
        )}
      </View>

      {/* Permission Warning */}
      {cameraPermissionStatus === 'denied' && (
        <Text className="text-red-500 text-xs mt-2 font-medium">
          Camera permission denied
        </Text>
      )}
    </View>
  );
}

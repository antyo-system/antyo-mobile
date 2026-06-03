import { useState, useRef, useEffect } from 'react';
import { View, Text, PanResponder, Pressable } from 'react-native';
import { Plan } from '@/store/usePlanStore';

interface Props {
  plan: Plan;
  pixelsPerMinute: number;
  onUpdatePlan: (id: string, updates: Partial<Plan>) => void;
  onEditPress: (plan: Plan) => void;
  setScrollEnabled: (enabled: boolean) => void;
}

export function InteractivePlanBlock({ plan, pixelsPerMinute, onUpdatePlan, onEditPress, setScrollEnabled }: Props) {
  const [tempStart, setTempStart] = useState(plan.startMinutes);
  const [tempDuration, setTempDuration] = useState(plan.durationMinutes);

  // Sync state if store updates externally
  useEffect(() => {
    setTempStart(plan.startMinutes);
    setTempDuration(plan.durationMinutes);
  }, [plan.startMinutes, plan.durationMinutes]);

  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => setScrollEnabled(false),
      onPanResponderMove: (evt, gestureState) => {
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newStart = plan.startMinutes + minuteDelta;
        // Track perfectly with finger, no snap during move
        if (newStart < 0) newStart = 0;
        if (newStart > 24 * 60 - tempDuration) newStart = 24 * 60 - tempDuration;
        setTempStart(newStart);
      },
      onPanResponderRelease: (evt, gestureState) => {
        setScrollEnabled(true);
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newStart = plan.startMinutes + minuteDelta;
        newStart = Math.round(newStart / 15) * 15;
        if (newStart < 0) newStart = 0;
        onUpdatePlan(plan.id, { startMinutes: newStart });
      },
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setScrollEnabled(false),
      onPanResponderMove: (evt, gestureState) => {
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newDuration = plan.durationMinutes + minuteDelta;
        // Track perfectly with finger, no snap during move
        if (newDuration < 15) newDuration = 15; // Minimum 15 minutes
        setTempDuration(newDuration);
      },
      onPanResponderRelease: (evt, gestureState) => {
        setScrollEnabled(true);
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newDuration = plan.durationMinutes + minuteDelta;
        newDuration = Math.round(newDuration / 15) * 15;
        if (newDuration < 15) newDuration = 15;
        onUpdatePlan(plan.id, { durationMinutes: newDuration });
      },
    })
  ).current;

  const top = tempStart * pixelsPerMinute;
  const height = tempDuration * pixelsPerMinute;

  return (
    <View 
      className="absolute right-4 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 rounded-md shadow-sm left-16 z-10 flex-col"
      style={{ top, height: Math.max(height, 30) }}
    >
      <View {...moveResponder.panHandlers} className="flex-1">
        <Pressable onPress={() => onEditPress(plan)} className="flex-1 px-2 pt-1.5 pb-4">
          <Text className="text-xs font-bold text-yellow-900 dark:text-yellow-100 pr-4" numberOfLines={1}>
            {plan.title}
          </Text>
          {height > 30 && (
            <Text className="text-[10px] text-yellow-800 dark:text-yellow-200 mt-0.5 font-medium">
              {tempDuration} min
            </Text>
          )}
        </Pressable>
      </View>

      {/* Resize Handle (Bottom Center) */}
      <View 
        {...resizeResponder.panHandlers}
        className="absolute bottom-0 w-full h-5 items-center justify-center bg-yellow-200/20 dark:bg-yellow-800/20 rounded-b-md z-20"
      >
        <View className="w-8 h-1 bg-yellow-500 rounded-full opacity-60" />
      </View>
    </View>
  );
}

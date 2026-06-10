import { useState, useRef, useEffect, memo } from 'react';
import { View, Text, PanResponder, Pressable } from 'react-native';
import { Plan } from '@/store/usePlanStore';

interface Props {
  plan: Plan;
  pixelsPerMinute: number;
  onUpdatePlan: (id: string, updates: Partial<Plan>) => void;
  onEditPress: (plan: Plan) => void;
  setScrollEnabled: (enabled: boolean) => void;
  width?: number;
  isLocked?: boolean;
}

export const InteractivePlanBlock = memo(function InteractivePlanBlock({ plan, pixelsPerMinute, onUpdatePlan, onEditPress, setScrollEnabled, width, isLocked }: Props) {
  const latestProps = useRef({ isLocked, pixelsPerMinute, plan, onUpdatePlan, setScrollEnabled });
  
  useEffect(() => {
    latestProps.current = { isLocked, pixelsPerMinute, plan, onUpdatePlan, setScrollEnabled };
  }, [isLocked, pixelsPerMinute, plan, onUpdatePlan, setScrollEnabled]);
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
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => !latestProps.current.isLocked && Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => latestProps.current.setScrollEnabled(false),
      onPanResponderMove: (evt, gestureState) => {
        const { pixelsPerMinute, plan } = latestProps.current;
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newStart = plan.startMinutes + minuteDelta;
        if (newStart < 0) newStart = 0;
        if (newStart > 24 * 60 - tempDuration) newStart = 24 * 60 - tempDuration;
        setTempStart(newStart);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { pixelsPerMinute, plan, onUpdatePlan, setScrollEnabled } = latestProps.current;
        setScrollEnabled(true);
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newStart = plan.startMinutes + minuteDelta;
        newStart = Math.round(newStart / 15) * 15;
        if (newStart < 0) newStart = 0;
        onUpdatePlan(plan.id, { startMinutes: newStart });
      },
      onPanResponderTerminate: () => latestProps.current.setScrollEnabled(true),
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !latestProps.current.isLocked,
      onPanResponderGrant: () => latestProps.current.setScrollEnabled(false),
      onPanResponderMove: (evt, gestureState) => {
        const { pixelsPerMinute, plan } = latestProps.current;
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newDuration = plan.durationMinutes + minuteDelta;
        if (newDuration < 15) newDuration = 15;
        setTempDuration(newDuration);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { pixelsPerMinute, plan, onUpdatePlan, setScrollEnabled } = latestProps.current;
        setScrollEnabled(true);
        const minuteDelta = Math.round(gestureState.dy / pixelsPerMinute);
        let newDuration = plan.durationMinutes + minuteDelta;
        newDuration = Math.round(newDuration / 15) * 15;
        if (newDuration < 15) newDuration = 15;
        onUpdatePlan(plan.id, { durationMinutes: newDuration });
      },
      onPanResponderTerminate: () => latestProps.current.setScrollEnabled(true),
    })
  ).current;

  const top = tempStart * pixelsPerMinute;
  const height = tempDuration * pixelsPerMinute;
  const color = plan.color || '#FBBF24'; // default yellow-400

  return (
    <View 
      className="absolute bg-white dark:bg-gray-900 border-l-4 rounded-md shadow-sm z-10 flex-col"
      style={{ 
        top, 
        height: Math.max(height, 30), 
        width: '100%',
        borderLeftColor: color,
        backgroundColor: `${color}20` // 20% opacity for background
      }}
    >
      <View {...moveResponder.panHandlers} className="flex-1">
        <Pressable onPress={() => onEditPress(plan)} className="flex-1 px-2 pt-1.5 pb-4">
          <Text className="text-xs font-bold dark:text-gray-100 pr-4" style={{ color }} numberOfLines={1}>
            {plan.title}
          </Text>
          {height > 30 && width !== undefined && width > 30 && (
            <Text className="text-[10px] opacity-80 mt-0.5 font-medium" style={{ color }}>
              {tempDuration} min
            </Text>
          )}
        </Pressable>
      </View>

      {/* Resize Handle (Bottom Center) */}
      {!isLocked && (
        <View 
          {...resizeResponder.panHandlers}
          className="absolute bottom-0 w-full h-5 items-center justify-center rounded-b-md z-20"
        >
          <View className="w-8 h-1 rounded-full opacity-60" style={{ backgroundColor: color }} />
        </View>
      )}
    </View>
  );
});

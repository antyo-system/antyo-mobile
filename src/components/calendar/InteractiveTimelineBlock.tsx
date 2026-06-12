import { useState, useRef, useEffect, memo } from 'react';
import { View, Text, PanResponder, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TimelineRenderedPlan } from './TimelineQuickActionModal';

interface Props {
  plan: TimelineRenderedPlan;
  pixelsPerDay: number;
  onUpdateDates: (id: string, type: 'milestone' | 'allday', dayDeltaStart: number, dayDeltaEnd: number) => void;
  onEditPress: (plan: TimelineRenderedPlan) => void;
  setScrollEnabled: (enabled: boolean) => void;
  width?: number;
  isLocked?: boolean;
}

export const InteractiveTimelineBlock = memo(function InteractiveTimelineBlock({ 
  plan, pixelsPerDay, onUpdateDates, onEditPress, setScrollEnabled, width, isLocked 
}: Props) {
  const latestProps = useRef({ isLocked, pixelsPerDay, plan, onUpdateDates, setScrollEnabled });
  
  useEffect(() => {
    latestProps.current = { isLocked, pixelsPerDay, plan, onUpdateDates, setScrollEnabled };
  }, [isLocked, pixelsPerDay, plan, onUpdateDates, setScrollEnabled]);
  
  const [tempTop, setTempTop] = useState(plan.top);
  const [tempHeight, setTempHeight] = useState(plan.height);

  // Sync state if store updates externally
  useEffect(() => {
    setTempTop(plan.top);
    setTempHeight(plan.height);
  }, [plan.top, plan.height]);

  const moveResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => !latestProps.current.isLocked && evt.nativeEvent.touches.length === 1,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => !latestProps.current.isLocked && evt.nativeEvent.touches.length === 1 && Math.abs(gestureState.dy) > 5,
      onPanResponderGrant: () => latestProps.current.setScrollEnabled(false),
      onPanResponderMove: (evt, gestureState) => {
        const { plan } = latestProps.current;
        let newTop = plan.top + gestureState.dy;
        if (newTop < 0) newTop = 0;
        setTempTop(newTop);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { pixelsPerDay, plan, onUpdateDates, setScrollEnabled } = latestProps.current;
        setScrollEnabled(true);
        const dayDelta = Math.round(gestureState.dy / pixelsPerDay);
        // snap to grid visually until parent updates
        setTempTop(plan.top + dayDelta * pixelsPerDay); 
        onUpdateDates(plan.id, plan.type, dayDelta, dayDelta);
      },
      onPanResponderTerminate: () => latestProps.current.setScrollEnabled(true),
    })
  ).current;

  const resizeResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => !latestProps.current.isLocked && evt.nativeEvent.touches.length === 1,
      onPanResponderGrant: () => latestProps.current.setScrollEnabled(false),
      onPanResponderMove: (evt, gestureState) => {
        const { plan, pixelsPerDay } = latestProps.current;
        let newHeight = plan.height + gestureState.dy;
        if (newHeight < pixelsPerDay) newHeight = pixelsPerDay; // min 1 day
        setTempHeight(newHeight);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const { pixelsPerDay, plan, onUpdateDates, setScrollEnabled } = latestProps.current;
        setScrollEnabled(true);
        const dayDeltaEnd = Math.round(gestureState.dy / pixelsPerDay);
        let newHeight = plan.height + dayDeltaEnd * pixelsPerDay;
        if (newHeight < pixelsPerDay) {
          newHeight = pixelsPerDay;
        }
        setTempHeight(newHeight);
        
        const finalDeltaEnd = Math.round((newHeight - plan.height) / pixelsPerDay);
        onUpdateDates(plan.id, plan.type, 0, finalDeltaEnd);
      },
      onPanResponderTerminate: () => latestProps.current.setScrollEnabled(true),
    })
  ).current;

  const color = plan.color || '#3B82F6';

  const isPriority = plan.isPriority;

  return (
    <View 
      className="absolute bg-white dark:bg-gray-900 border-l-4 rounded-md z-10 flex-col"
      style={{ 
        top: tempTop, 
        height: Math.max(tempHeight, pixelsPerDay), 
        width: '100%',
        borderLeftColor: isPriority ? '#F59E0B' : color,
        backgroundColor: `${isPriority ? '#F59E0B' : color}20`,
        ...(isPriority ? {
          borderWidth: 1,
          borderColor: '#F59E0B',
          shadowColor: "#F59E0B",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 5,
        } : {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        })
      }}
    >
      <View {...moveResponder.panHandlers} className="flex-1">
        <Pressable onPress={() => onEditPress(plan)} className="flex-1 px-2 pt-2 pb-4">
          <View className="flex-row items-center pr-2">
            {isPriority && <Feather name="star" size={10} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />}
            <Text 
              className="text-xs font-bold dark:text-gray-100" 
              style={{ color: isPriority ? '#F59E0B' : color, textDecorationLine: plan.isCompleted ? 'line-through' : 'none' }} 
              numberOfLines={1}
            >
              {plan.title}
            </Text>
          </View>
          {plan.type === 'allday' && (
            <Text style={{ fontSize: 9, fontWeight: '700', color: plan.color, opacity: 0.8, marginTop: 2 }}>
              ALL DAY
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

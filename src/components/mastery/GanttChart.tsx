import { Milestone, Project } from '@/store/useTaskStore';
import { Feather } from '@expo/vector-icons';
import {
  addDays,
  differenceInCalendarDays,
  format,
  isToday,
  parseISO,
  startOfDay,
  subDays,
} from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  Text,
  UIManager,
  useColorScheme,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Constants ───────────────────────────────────────────────────────────────

type ZoomLevel = '2W' | '1M' | '3M';

const ZOOM_CONFIG: Record<ZoomLevel, { days: number; colWidth: number; label: string }> = {
  '2W': { days: 14, colWidth: 40, label: '2 Weeks' },
  '1M': { days: 30, colWidth: 24, label: '1 Month' },
  '3M': { days: 90, colWidth: 10, label: '3 Months' },
};

const TASK_LABEL_WIDTH = 110;
const ROW_HEIGHT = 52;
const BAR_HEIGHT = 28;
const HEADER_HEIGHT = 40;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getMilestoneRange(milestone: Milestone): { start: Date; end: Date } {
  const end = startOfDay(parseISO(milestone.date));
  const start = milestone.startDate
    ? startOfDay(parseISO(milestone.startDate))
    : subDays(end, 3);
  // Ensure start is always before end
  return start < end ? { start, end } : { start: subDays(end, 1), end };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ZoomToggle({
  zoom,
  onZoomChange,
}: {
  zoom: ZoomLevel;
  onZoomChange: (z: ZoomLevel) => void;
}) {
  const isDark = useColorScheme() === 'dark';
  const levels: ZoomLevel[] = ['2W', '1M', '3M'];

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: isDark ? '#1F2937' : '#F3F4F6',
        borderRadius: 10,
        padding: 3,
      }}
    >
      {levels.map((level) => {
        const isActive = zoom === level;
        return (
          <Pressable
            key={level}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              onZoomChange(level);
            }}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 7,
              backgroundColor: isActive ? (isDark ? '#374151' : '#FFFFFF') : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: isActive
                  ? isDark
                    ? '#FFFFFF'
                    : '#111827'
                  : isDark
                  ? '#6B7280'
                  : '#9CA3AF',
              }}
            >
              {level}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DateHeader({
  startDate,
  zoom,
  colWidth,
}: {
  startDate: Date;
  zoom: ZoomLevel;
  colWidth: number;
}) {
  const isDark = useColorScheme() === 'dark';
  const { days } = ZOOM_CONFIG[zoom];
  const today = startOfDay(new Date());

  return (
    <View style={{ flexDirection: 'row', height: HEADER_HEIGHT, alignItems: 'flex-end' }}>
      {Array.from({ length: days }).map((_, i) => {
        const day = addDays(startDate, i);
        const dayNum = format(day, 'd');
        const isFirstOfMonth = dayNum === '1';
        const isTodayCol = isToday(day);

        return (
          <View
            key={i}
            style={{
              width: colWidth,
              alignItems: 'center',
              paddingBottom: 6,
            }}
          >
            {isFirstOfMonth && (
              <Text
                style={{
                  fontSize: 8,
                  fontWeight: '900',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  marginBottom: 1,
                }}
              >
                {format(day, 'MMM')}
              </Text>
            )}
            <Text
              style={{
                fontSize: zoom === '3M' ? 7 : 9,
                fontWeight: isTodayCol ? '900' : '600',
                color: isTodayCol
                  ? '#3B82F6'
                  : isDark
                  ? '#4B5563'
                  : '#9CA3AF',
              }}
            >
              {zoom === '3M' && !isFirstOfMonth ? '' : dayNum}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function TodayLine({
  startDate,
  colWidth,
  totalHeight,
}: {
  startDate: Date;
  colWidth: number;
  totalHeight: number;
}) {
  const todayOffset = differenceInCalendarDays(startOfDay(new Date()), startDate);
  if (todayOffset < 0) return null;

  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const x = todayOffset * colWidth + colWidth / 2;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: HEADER_HEIGHT,
        left: x,
        width: 1.5,
        height: totalHeight - HEADER_HEIGHT,
        backgroundColor: '#3B82F6',
        opacity: glowAnim,
      }}
      pointerEvents="none"
    />
  );
}

function GanttBar({
  milestone,
  startDate,
  colWidth,
  projectColor,
  onPress,
}: {
  milestone: Milestone;
  startDate: Date;
  colWidth: number;
  projectColor: string;
  onPress: () => void;
}) {
  const isDark = useColorScheme() === 'dark';
  const { start, end } = getMilestoneRange(milestone);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, []);

  const startOffset = differenceInCalendarDays(start, startDate);
  const durationDays = Math.max(1, differenceInCalendarDays(end, start) + 1);

  const barLeft = startOffset * colWidth;
  const barWidth = durationDays * colWidth;

  const isCompleted = milestone.isCompleted;
  const isOverdue =
    !isCompleted && differenceInCalendarDays(startOfDay(new Date()), end) > 0;

  // Color logic
  const barColor = isOverdue ? '#EF4444' : projectColor;
  const bgOpacity = isDark ? '33' : '22'; // hex opacity

  return (
    <View
      style={{
        height: ROW_HEIGHT,
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: Math.max(0, barLeft),
          width: barWidth,
          transform: [{ scaleX: scaleAnim }],
          transformOrigin: 'left center',
        }}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => ({
            height: BAR_HEIGHT,
            borderRadius: 99,
            backgroundColor: barColor + bgOpacity,
            borderWidth: 1,
            borderColor: barColor + '60',
            overflow: 'hidden',
            opacity: isCompleted ? 0.45 : pressed ? 0.75 : 1,
            flexDirection: 'row',
            alignItems: 'center',
          })}
        >
          {/* Progress fill */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: isCompleted ? '100%' : '0%',
              backgroundColor: barColor + '50',
              borderRadius: 99,
            }}
          />

          {/* Status dot */}
          <View
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              backgroundColor: barColor,
              marginLeft: 7,
              flexShrink: 0,
            }}
          />

          {/* Title — only show if bar is wide enough */}
          {barWidth > 50 && (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 9,
                fontWeight: '800',
                color: barColor,
                marginLeft: 4,
                marginRight: 6,
                flexShrink: 1,
              }}
            >
              {milestone.title}
            </Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

interface GanttChartProps {
  project: Project;
  milestones: Milestone[];
  onMilestonePress: (milestone: Milestone) => void;
}

export function GanttChart({ project, milestones, onMilestonePress }: GanttChartProps) {
  const isDark = useColorScheme() === 'dark';
  const [zoom, setZoom] = useState<ZoomLevel>('1M');
  const scrollViewRef = useRef<ScrollView>(null);

  const { days, colWidth } = ZOOM_CONFIG[zoom];
  const timelineWidth = days * colWidth;

  // Start timeline from some days before today for context
  const timelineStart = subDays(startOfDay(new Date()), Math.floor(days * 0.2));

  const totalHeight = HEADER_HEIGHT + milestones.length * ROW_HEIGHT;

  // Auto-scroll to today on mount / zoom change
  useEffect(() => {
    const todayOffset = differenceInCalendarDays(startOfDay(new Date()), timelineStart);
    const scrollX = Math.max(0, todayOffset * colWidth - Dimensions.get('window').width / 3);
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: scrollX, animated: false });
    }, 100);
  }, [zoom]);

  if (milestones.length === 0) {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 32,
          opacity: 0.5,
        }}
      >
        <Feather
          name="bar-chart-2"
          size={32}
          color={isDark ? '#6B7280' : '#9CA3AF'}
        />
        <Text
          style={{
            marginTop: 8,
            fontSize: 12,
            fontWeight: '700',
            color: isDark ? '#6B7280' : '#9CA3AF',
          }}
        >
          Add milestones to see the Gantt view
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Zoom Toggle */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          marginBottom: 10,
        }}
      >
        <ZoomToggle zoom={zoom} onZoomChange={setZoom} />
      </View>

      {/* Chart Body — Outside Pattern */}
      <View
        style={{
          flexDirection: 'row',
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? '#1F2937' : '#F3F4F6',
        }}
      >
        {/* ── LEFT COLUMN (Sticky task labels) ── */}
        <View
          style={{
            width: TASK_LABEL_WIDTH,
            backgroundColor: isDark ? '#111827' : '#FAFAFA',
            borderRightWidth: 1,
            borderRightColor: isDark ? '#1F2937' : '#F3F4F6',
            zIndex: 10,
          }}
        >
          {/* Header spacer */}
          <View style={{ height: HEADER_HEIGHT }} />

          {/* Row labels */}
          {milestones.map((milestone) => {
            const isCompleted = milestone.isCompleted;
            const { end } = getMilestoneRange(milestone);
            const isOverdue =
              !isCompleted && differenceInCalendarDays(startOfDay(new Date()), end) > 0;

            return (
              <View
                key={milestone.id}
                style={{
                  height: ROW_HEIGHT,
                  justifyContent: 'center',
                  paddingHorizontal: 10,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? '#1F2937' : '#F9FAFB',
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    color: isCompleted
                      ? isDark
                        ? '#4B5563'
                        : '#9CA3AF'
                      : isOverdue
                      ? '#EF4444'
                      : isDark
                      ? '#E5E7EB'
                      : '#111827',
                    textDecorationLine: isCompleted ? 'line-through' : 'none',
                  }}
                >
                  {milestone.title}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    fontWeight: '600',
                    color: isOverdue
                      ? '#EF4444'
                      : isDark
                      ? '#6B7280'
                      : '#9CA3AF',
                    marginTop: 2,
                  }}
                >
                  {isCompleted
                    ? '✓ Done'
                    : isOverdue
                    ? `Due ${format(end, 'MMM d')}`
                    : `→ ${format(end, 'MMM d')}`}
                </Text>
              </View>
            );
          })}
        </View>

        {/* ── RIGHT AREA (Horizontal Scroll Timeline) ── */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ width: timelineWidth }}
        >
          <View style={{ width: timelineWidth, position: 'relative' }}>
            {/* Date Header */}
            <DateHeader startDate={timelineStart} zoom={zoom} colWidth={colWidth} />

            {/* Today Line */}
            <TodayLine
              startDate={timelineStart}
              colWidth={colWidth}
              totalHeight={totalHeight}
            />

            {/* Milestone Rows */}
            {milestones.map((milestone, rowIndex) => (
              <View
                key={milestone.id}
                style={{
                  borderTopWidth: 1,
                  borderTopColor: isDark ? '#111827' : '#F9FAFB',
                }}
              >
                {/* Alternating row background */}
                {rowIndex % 2 === 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: isDark ? '#FFFFFF08' : '#00000004',
                    }}
                    pointerEvents="none"
                  />
                )}
                <GanttBar
                  milestone={milestone}
                  startDate={timelineStart}
                  colWidth={colWidth}
                  projectColor={project.color}
                  onPress={() => onMilestonePress(milestone)}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

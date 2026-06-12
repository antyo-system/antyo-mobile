import { Milestone, useTaskStore } from '@/store/useTaskStore';
import { Feather } from '@expo/vector-icons';
import { differenceInCalendarDays, format, parseISO, startOfDay, subDays } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 340;

interface MilestoneDetailSheetProps {
  milestone: Milestone | null;
  projectColor: string;
  onClose: () => void;
}

export function MilestoneDetailSheet({
  milestone,
  projectColor,
  onClose,
}: MilestoneDetailSheetProps) {
  const isDark = useColorScheme() === 'dark';
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const toggleMilestone = useTaskStore((s) => s.toggleMilestone);
  const deleteMilestone = useTaskStore((s) => s.deleteMilestone);
  const updateMilestone = useTaskStore((s) => s.updateMilestone);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');

  // Animate in/out
  useEffect(() => {
    if (milestone) {
      setEditTitle(milestone.title);
      setIsEditing(false);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 70,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SHEET_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [milestone]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const handleDelete = () => {
    if (!milestone) return;
    deleteMilestone(milestone.id);
    handleClose();
  };

  const handleToggle = () => {
    if (!milestone) return;
    toggleMilestone(milestone.id);
    handleClose();
  };

  const handleSaveEdit = () => {
    if (!milestone || !editTitle.trim()) return;
    updateMilestone(milestone.id, { title: editTitle.trim() });
    setIsEditing(false);
  };

  if (!milestone) return null;

  const endDate = startOfDay(parseISO(milestone.date));
  const startDate = milestone.startDate
    ? startOfDay(parseISO(milestone.startDate))
    : subDays(endDate, 3);
  const durationDays = differenceInCalendarDays(endDate, startDate) + 1;
  const daysUntilDue = differenceInCalendarDays(endDate, startOfDay(new Date()));
  const isOverdue = !milestone.isCompleted && daysUntilDue < 0;

  let dueLabel = '';
  if (milestone.isCompleted) dueLabel = 'Completed ✓';
  else if (daysUntilDue === 0) dueLabel = 'Due today!';
  else if (daysUntilDue === 1) dueLabel = 'Due tomorrow';
  else if (daysUntilDue < 0) dueLabel = `${Math.abs(daysUntilDue)} days overdue`;
  else dueLabel = `${daysUntilDue} days left`;

  const accentColor = isOverdue ? '#EF4444' : projectColor;

  return (
    <Modal transparent visible animationType="none" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <Animated.View
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000000',
            opacity: backdropOpacity.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.55],
            }),
          }}
        >
          <Pressable style={{ flex: 1 }} onPress={handleClose} />
        </Animated.View>

        {/* Bottom Sheet */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            transform: [{ translateY }],
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#111827' : '#FFFFFF',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'ios' ? 40 : 24,
              paddingHorizontal: 24,
              minHeight: SHEET_HEIGHT,
              // Shadow
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.15,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Handle Bar */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 99,
                backgroundColor: isDark ? '#374151' : '#E5E7EB',
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            {/* Color accent bar */}
            <View
              style={{
                height: 3,
                borderRadius: 99,
                backgroundColor: accentColor,
                width: 48,
                marginBottom: 20,
              }}
            />

            {/* Title */}
            {isEditing ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <TextInput
                  value={editTitle}
                  onChangeText={setEditTitle}
                  autoFocus
                  style={{
                    flex: 1,
                    fontSize: 20,
                    fontWeight: '800',
                    color: isDark ? '#FFFFFF' : '#111827',
                    borderBottomWidth: 2,
                    borderBottomColor: accentColor,
                    paddingBottom: 4,
                  }}
                  onSubmitEditing={handleSaveEdit}
                />
                <Pressable onPress={handleSaveEdit}>
                  <View
                    style={{
                      backgroundColor: accentColor,
                      borderRadius: 10,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '800', color: '#FFFFFF' }}>Save</Text>
                  </View>
                </Pressable>
                <Pressable onPress={() => setIsEditing(false)}>
                  <Feather name="x" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setIsEditing(true)}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: isDark ? '#FFFFFF' : '#111827',
                    marginBottom: 8,
                    textDecorationLine: milestone.isCompleted ? 'line-through' : 'none',
                    opacity: milestone.isCompleted ? 0.5 : 1,
                  }}
                >
                  {milestone.title}
                </Text>
              </Pressable>
            )}

            {/* Date Range Info */}
            <View
              style={{
                flexDirection: 'row',
                gap: 16,
                marginBottom: 20,
                flexWrap: 'wrap',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="calendar" size={13} color={accentColor} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }}
                >
                  {format(startDate, 'MMM d')} → {format(endDate, 'MMM d')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="clock" size={13} color={accentColor} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                  }}
                >
                  {durationDays} day{durationDays !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>

            {/* Status Chip */}
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: accentColor + '20',
                borderRadius: 99,
                paddingHorizontal: 12,
                paddingVertical: 5,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: accentColor + '40',
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '800',
                  color: accentColor,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {dueLabel}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {/* Mark Complete / Undo */}
              <Pressable
                onPress={handleToggle}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingVertical: 13,
                  borderRadius: 16,
                  backgroundColor: milestone.isCompleted
                    ? isDark
                      ? '#1F2937'
                      : '#F9FAFB'
                    : accentColor,
                  borderWidth: milestone.isCompleted ? 1 : 0,
                  borderColor: isDark ? '#374151' : '#E5E7EB',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Feather
                  name={milestone.isCompleted ? 'rotate-ccw' : 'check-circle'}
                  size={16}
                  color={milestone.isCompleted ? (isDark ? '#9CA3AF' : '#6B7280') : '#FFFFFF'}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: milestone.isCompleted
                      ? isDark
                        ? '#9CA3AF'
                        : '#6B7280'
                      : '#FFFFFF',
                  }}
                >
                  {milestone.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                </Text>
              </Pressable>

              {/* Delete */}
              <Pressable
                onPress={handleDelete}
                style={({ pressed }) => ({
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 14,
                  backgroundColor: isDark ? '#1F2937' : '#FEF2F2',
                  borderWidth: 1,
                  borderColor: isDark ? '#374151' : '#FECACA',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Feather name="trash-2" size={18} color="#EF4444" />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

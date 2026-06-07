import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  type: 'session_complete' | 'level_up' | null;
  durationMinutes: number;
  skillName?: string;
  newLevelName?: string;
  onAnimationEnd: () => void;
}

const { width, height } = Dimensions.get('window');

export const SessionCompleteOverlay = ({
  visible,
  type,
  durationMinutes,
  skillName,
  newLevelName,
  onAnimationEnd,
}: Props) => {
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  const confettiY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible && type) {
      // Trigger Haptics
      if (type === 'level_up') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success), 200);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Animation Sequence
      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(scaleValue, {
            toValue: 1,
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(confettiY, {
            toValue: 0,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(2500),
        Animated.parallel([
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ]).start(() => {
        onAnimationEnd();
        // Reset values
        scaleValue.setValue(0);
        opacityValue.setValue(0);
        confettiY.setValue(height);
      });
    }
  }, [visible, type]);

  if (!visible || !type) return null;

  const isLevelUp = type === 'level_up';

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, { opacity: opacityValue }]} pointerEvents="none">
      
      {/* Decorative Background Elements */}
      <Animated.View style={[styles.glow, { transform: [{ scale: scaleValue }], backgroundColor: isLevelUp ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)' }]} />

      <Animated.View style={[styles.card, { transform: [{ scale: scaleValue }] }]}>
        <View style={[styles.iconContainer, { backgroundColor: isLevelUp ? '#FEF08A' : '#DBEAFE' }]}>
          <Feather name={isLevelUp ? 'award' : 'check'} size={48} color={isLevelUp ? '#CA8A04' : '#2563EB'} />
        </View>

        <Text style={[styles.title, { color: isLevelUp ? '#CA8A04' : '#1D4ED8' }]}>
          {isLevelUp ? 'LEVEL UP!' : 'SESSION COMPLETE'}
        </Text>

        {isLevelUp ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.skillText}>{skillName} is now</Text>
            <Text style={styles.levelText}>{newLevelName}</Text>
          </View>
        ) : (
          <View style={styles.detailsContainer}>
            <Text style={styles.durationText}>+{durationMinutes} Minutes</Text>
            {skillName && <Text style={styles.skillSubtitle}>added to {skillName}</Text>}
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  glow: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width,
  },
  card: {
    backgroundColor: 'white',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    width: '80%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  detailsContainer: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: '100%',
  },
  durationText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
  },
  skillSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 4,
  },
  skillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  levelText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
  },
});

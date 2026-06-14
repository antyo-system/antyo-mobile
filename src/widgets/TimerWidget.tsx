import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface TimerWidgetProps {
  planTitle: string;
  timeRemaining: string;
  isActive: boolean;
}

export function TimerWidget({ planTitle, timeRemaining, isActive }: TimerWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#030712', // gray-950
        borderRadius: 24,
      }}
    >
      <TextWidget
        text={planTitle || "NO ACTIVE PLAN"}
        style={{
          fontSize: 14,
          fontFamily: 'sans-serif-medium',
          color: '#9CA3AF', // gray-400
        }}
      />
      <TextWidget
        text={timeRemaining}
        style={{
          fontSize: 36,
          fontFamily: 'sans-serif-black',
          color: isActive ? '#3B82F6' : '#F3F4F6', // blue-500 or gray-100
          marginTop: 8,
        }}
      />
      <TextWidget
        text={isActive ? "FOCUSING" : "PAUSED"}
        style={{
          fontSize: 10,
          fontFamily: 'sans-serif-medium',
          color: isActive ? '#60A5FA' : '#6B7280', // blue-400 or gray-500
          marginTop: 8,
        }}
      />
    </FlexWidget>
  );
}

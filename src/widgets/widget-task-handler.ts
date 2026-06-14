import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { TimerWidget } from './TimerWidget';
import { useTimerStore } from '@/store/useTimerStore';
import { formatTime } from '@/utils/time';

export async function updateTimerWidget() {
  const timerState = useTimerStore.getState();
  
  const planTitle = timerState.currentTitle || 'FOCUS SESSION';
  
  const timeRemaining = formatTime(timerState.timeLeft);
  const isActive = timerState.status === 'running';

  try {
    await requestWidgetUpdate({
      widgetName: 'TimerWidget',
      renderWidget: () => React.createElement(TimerWidget, { 
        planTitle, 
        timeRemaining, 
        isActive 
      }),
      widgetNotFound: () => {
        // Called if widget hasn't been added to home screen yet
      }
    });
  } catch (error) {
    console.error('Failed to update Android widget:', error);
  }
}

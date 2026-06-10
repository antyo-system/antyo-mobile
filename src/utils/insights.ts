import { Plan } from '@/store/usePlanStore';
import { Session } from '@/types';
import { isSameWeek, isToday, startOfWeek, endOfWeek, differenceInMinutes, parseISO } from 'date-fns';

export type InsightType = 'overplanning' | 'underplanning' | 'distraction' | 'momentum' | 'primeTime' | 'empty';

export interface Insight {
  type: InsightType;
  titleKey: string;
  descKey: string;
  icon: string;
  color: string;
  value?: string;
}

export function generateInsights(sessions: Session[], plans: Plan[]): Insight[] {
  const insights: Insight[] = [];
  const now = new Date();
  
  // 1. Analyze Distraction (Past 7 days)
  const recentSessions = sessions.filter(s => new Date(s.startTime).getTime() > now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const totalDistractedMins = Math.round(recentSessions.reduce((acc, curr) => acc + (curr.distractedDurationSeconds || 0), 0) / 60);
  
  if (totalDistractedMins > 30) {
    insights.push({
      type: 'distraction',
      titleKey: 'insights.distraction.title',
      descKey: 'insights.distraction.desc',
      icon: 'alert-triangle',
      color: 'red',
      value: totalDistractedMins.toString(),
    });
  }

  // 2. Analyze Planning vs Reality (Current Week)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  const thisWeekPlans = plans.filter(p => {
    // We only consider single plans or daily routines mapped to today for simplicity in this MVP
    // Let's approximate: total planned duration today vs total real duration today
    return isToday(new Date(p.baseDate || Date.now())); 
  });
  
  // Let's do a simple Today metric: Overplanning vs Underplanning
  const todaySessions = sessions.filter(s => isToday(new Date(s.startTime)));
  const todayRealMins = Math.round(todaySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0) / 60);
  
  // Simple approximation for today's planned minutes
  let todayPlannedMins = 0;
  plans.forEach(p => {
    if (p.recurrence === 'none' && p.baseDate && isToday(parseISO(p.baseDate))) {
      todayPlannedMins += p.durationMinutes;
    } else if (p.recurrence === 'daily') {
      todayPlannedMins += p.durationMinutes;
    } else if (p.recurrence === 'weekdays' && now.getDay() >= 1 && now.getDay() <= 5) {
      todayPlannedMins += p.durationMinutes;
    } else if (p.recurrence === 'specific_days' && p.recurrenceDays?.includes(now.getDay())) {
      todayPlannedMins += p.durationMinutes;
    }
  });

  if (todayPlannedMins > 0) {
    if (todayPlannedMins > todayRealMins + 60 && todayRealMins > 0) {
      // Planned way more than executed (overplanning)
      insights.push({
        type: 'overplanning',
        titleKey: 'insights.overplanning.title',
        descKey: 'insights.overplanning.desc',
        icon: 'trending-down',
        color: 'orange',
        value: Math.round((todayRealMins / todayPlannedMins) * 100).toString(),
      });
    } else if (todayRealMins > todayPlannedMins + 60) {
      // Executed way more than planned (underplanning)
      insights.push({
        type: 'underplanning',
        titleKey: 'insights.underplanning.title',
        descKey: 'insights.underplanning.desc',
        icon: 'trending-up',
        color: 'blue',
      });
    }
  }

  // 3. Prime Time Analysis
  if (recentSessions.length > 5) {
    const morningMins = recentSessions.filter(s => new Date(s.startTime).getHours() < 12).reduce((a, b) => a + b.durationSeconds, 0);
    const afternoonMins = recentSessions.filter(s => { const h = new Date(s.startTime).getHours(); return h >= 12 && h < 18; }).reduce((a, b) => a + b.durationSeconds, 0);
    const eveningMins = recentSessions.filter(s => new Date(s.startTime).getHours() >= 18).reduce((a, b) => a + b.durationSeconds, 0);
    
    let prime = 'Morning';
    let max = morningMins;
    if (afternoonMins > max) { prime = 'Afternoon'; max = afternoonMins; }
    if (eveningMins > max) { prime = 'Evening'; max = eveningMins; }

    if (max > 60 * 60) { // At least 1 hour of focus
      insights.push({
        type: 'primeTime',
        titleKey: 'insights.primeTime.title',
        descKey: `insights.primeTime.desc${prime}`,
        icon: 'sun',
        color: 'indigo',
      });
    }
  }

  // 4. Momentum / Consistency
  const daysWithSessions = new Set(recentSessions.map(s => new Date(s.startTime).toDateString())).size;
  if (daysWithSessions >= 3) {
    insights.push({
      type: 'momentum',
      titleKey: 'insights.momentum.title',
      descKey: 'insights.momentum.desc',
      icon: 'zap',
      color: 'emerald',
      value: daysWithSessions.toString(),
    });
  }

  // If no insights, return empty
  if (insights.length === 0) {
    insights.push({
      type: 'empty',
      titleKey: 'insights.empty.title',
      descKey: 'insights.empty.desc',
      icon: 'inbox',
      color: 'gray',
    });
  }

  // Return max 2 insights to avoid clutter
  return insights.slice(0, 2);
}

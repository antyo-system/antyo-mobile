import { View, Text } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Session } from '@/types';
import { useMemo } from 'react';
import { subDays, startOfDay, isSameDay } from 'date-fns';
import { formatLongTime, formatDate } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  sessions: Session[];
  daysCount?: number;
}

export function MonthlyLineChart({ sessions, daysCount = 30 }: Props) {
  const { t } = useTranslation();
  const chartHeight = 160;
  const chartWidth = 320; // Logical width, will scale with viewBox

  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const days = [];
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dailySessions = sessions.filter(s => isSameDay(new Date(s.startTime), date));
      const totalSeconds = dailySessions.reduce((acc, curr) => acc + curr.durationSeconds, 0);
      const totalHours = totalSeconds / 3600;
      
      days.push({
        date,
        totalHours,
        totalSeconds
      });
    }
    return days;
  }, [sessions, daysCount]);

  const maxHours = Math.max(...data.map(d => d.totalHours), 1);
  const totalSeconds = data.reduce((acc, curr) => acc + curr.totalSeconds, 0);
  
  if (totalSeconds === 0) {
    return (
      <View className="h-48 items-center justify-center">
        <Text className="text-gray-400 font-bold tracking-widest uppercase text-xs">
          {t('statsComp.noDataThisMonth') || 'NO DATA THIS MONTH'}
        </Text>
      </View>
    );
  }

  let pathStr = '';
  let areaStr = '';
  const points: {x: number, y: number}[] = [];

  // padding bottom for labels
  const paddingBottom = 20;
  const paddingTop = 10;
  const usableHeight = chartHeight - paddingBottom - paddingTop;

  data.forEach((day, index) => {
    const x = (index / (daysCount - 1)) * chartWidth;
    const y = paddingTop + usableHeight - ((day.totalHours / maxHours) * usableHeight);
    points.push({ x, y });

    if (index === 0) {
      pathStr += `M ${x} ${y} `;
      areaStr += `M ${x} ${chartHeight - paddingBottom} L ${x} ${y} `;
    } else {
      const prevX = points[index - 1].x;
      const prevY = points[index - 1].y;
      const cpX = prevX + (x - prevX) / 2;
      
      // Cubic bezier for smooth curves without overshooting
      pathStr += `C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y} `;
      areaStr += `C ${cpX} ${prevY}, ${cpX} ${y}, ${x} ${y} `;
    }
  });

  areaStr += `L ${chartWidth} ${chartHeight - paddingBottom} Z`;

  return (
    <View className="h-48 w-full justify-end">
      <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#3B82F6" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>
        
        {/* Area fill */}
        <Path d={areaStr} fill="url(#gradient)" />
        
        {/* Main Line */}
        <Path d={pathStr} fill="none" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Grid Lines (Horizontal) */}
        <Path d={`M 0 ${paddingTop} L ${chartWidth} ${paddingTop}`} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
        <Path d={`M 0 ${paddingTop + usableHeight/2} L ${chartWidth} ${paddingTop + usableHeight/2}`} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
        <Path d={`M 0 ${paddingTop + usableHeight} L ${chartWidth} ${paddingTop + usableHeight}`} stroke="#E5E7EB" strokeWidth="1" />
      </Svg>

      {/* X-Axis Labels */}
      <View className="flex-row justify-between px-2 mt-2 absolute bottom-0 w-full">
        <Text className="text-[10px] font-bold text-gray-400">{formatDate(data[0].date, 'MMM d')}</Text>
        <Text className="text-[10px] font-bold text-gray-400">{formatDate(data[Math.floor(daysCount/2)].date, 'MMM d')}</Text>
        <Text className="text-[10px] font-bold text-blue-500">{t('calendarComp.today') || 'Today'}</Text>
      </View>
    </View>
  );
}

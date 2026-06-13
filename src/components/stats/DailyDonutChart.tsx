import { View, Text, Dimensions } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { Session } from '@/types';
import { useMemo } from 'react';
import { formatLongTime } from '@/utils/time';
import { useTranslation } from '@/hooks/useTranslation';
import { Feather } from '@expo/vector-icons';

interface Props {
  sessions: Session[];
}

// Utility to group sessions (shared between chart and legend)
function useGroupedData(sessions: Session[]) {
  return useMemo(() => {
    const grouped = sessions.reduce((acc, curr) => {
      const key = curr.title || 'Focus';
      if (!acc[key]) {
        acc[key] = {
          title: key,
          color: curr.color || '#2563EB',
          duration: 0
        };
      }
      acc[key].duration += curr.durationSeconds;
      return acc;
    }, {} as Record<string, { title: string, color: string, duration: number }>);
    
    return Object.values(grouped).sort((a, b) => b.duration - a.duration);
  }, [sessions]);
}

export function DailyDonutChart({ sessions }: Props) {
  const { t } = useTranslation();
  const data = useGroupedData(sessions);
  const totalDuration = data.reduce((acc, curr) => acc + curr.duration, 0);
  
  const screenWidth = Dimensions.get('window').width;
  // 48 for padding (24 on each side), max size 300
  const svgSize = Math.min(300, screenWidth - 48);
  const center = svgSize / 2;
  const strokeWidth = 20;
  const radius = center - strokeWidth;
  
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;

  if (totalDuration === 0) {
    return (
      <View className="items-center justify-end h-56 pt-2 pb-2 opacity-60">
        <View className="relative items-center justify-end overflow-hidden" style={{ width: svgSize, height: center + strokeWidth }}>
          <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="absolute top-0">
            <G rotation={180} originX={center} originY={center}>
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke="#E5E7EB" // gray-200
                strokeWidth={strokeWidth}
                strokeDasharray={[halfCircumference, circumference]}
                strokeLinecap="round"
                fill="none"
              />
            </G>
          </Svg>
          
          <View className="absolute items-center justify-end bottom-0 pb-6" style={{ width: svgSize }}>
            <Feather name="moon" size={20} color="#D1D5DB" className="mb-2" />
            <Text className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-center">
              {t('statsComp.noDataToday') === 'statsComp.noDataToday' ? 'NO FOCUS YET' : t('statsComp.noDataToday')}
            </Text>
          </View>
        </View>
      </View>
    );
  }


  
  let currentAngle = 0;

  return (
    <View className="items-center justify-end h-56 pt-2 pb-2">
      <View className="relative items-center justify-end overflow-hidden" style={{ width: svgSize, height: center + strokeWidth }}>
        <Svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="absolute top-0">
          <G rotation={180} originX={center} originY={center}>
            {/* Background half circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E5E7EB" // gray-200
              strokeWidth={strokeWidth}
              strokeDasharray={[halfCircumference, circumference]}
              strokeLinecap="round"
              fill="none"
            />
            {data.map((item, index) => {
              const strokeLength = (item.duration / totalDuration) * halfCircumference;
              const angle = currentAngle;
              currentAngle += (item.duration / totalDuration) * 180;
              
              // Add a small gap between segments, ensure it doesn't go below 0
              const gap = data.length > 1 ? 6 : 0; 
              const adjustedLength = Math.max(0.1, strokeLength - gap);
              
              return (
                <Circle
                  key={index}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={[adjustedLength, circumference]}
                  strokeDashoffset={0}
                  fill="none"
                  strokeLinecap="round"
                  transform={`rotate(${angle} ${center} ${center})`}
                />
              );
            })}
          </G>
        </Svg>
        
        {/* Center Text */}
        <View className="absolute items-center justify-end bottom-0 pb-1" style={{ width: 160 }}>
           <Text className="text-xs font-black uppercase tracking-widest text-gray-400 mb-0.5">TOTAL</Text>
           <Text className="text-4xl font-black text-gray-900 dark:text-white" numberOfLines={1} adjustsFontSizeToFit>
             {formatLongTime(totalDuration)}
           </Text>
        </View>
      </View>
    </View>
  );
}

export function DailyLegend({ sessions }: Props) {
  const data = useGroupedData(sessions);
  const totalDuration = data.reduce((acc, curr) => acc + curr.duration, 0);

  if (totalDuration === 0) return null;

  return (
    <View className="mt-2 mb-6">
      {data.map((item, index) => {
        const percentage = Math.round((item.duration / totalDuration) * 100);
        return (
          <View 
            key={index} 
            className="flex-row items-center bg-white dark:bg-gray-900 rounded-2xl p-4 mb-3 shadow-sm shadow-gray-200 dark:shadow-none"
          >
            <View className="w-4 h-4 rounded-full mr-4" style={{ backgroundColor: item.color }} />
            <View className="flex-1">
              <Text className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</Text>
              <Text className="text-xs font-bold text-gray-400 mt-1">{formatLongTime(item.duration)}</Text>
            </View>
            <Text className="text-lg font-black text-gray-300 dark:text-gray-700">{percentage}%</Text>
          </View>
        );
      })}
    </View>
  );
}

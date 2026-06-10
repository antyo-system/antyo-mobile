import React from 'react';
import { View, Text, useColorScheme, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from '@/hooks/useTranslation';
import { Insight } from '@/utils/insights';

interface SmartInsightsProps {
  insights: Insight[];
}

export function SmartInsights({ insights }: SmartInsightsProps) {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';

  if (!insights || insights.length === 0) return null;

  const getColorConfig = (colorName: string) => {
    switch (colorName) {
      case 'red':
        return {
          bg: isDark ? 'bg-red-950/30' : 'bg-red-50',
          border: isDark ? 'border-red-900/50' : 'border-red-100',
          iconBg: isDark ? 'bg-red-900/50' : 'bg-red-100',
          iconColor: '#EF4444',
          title: isDark ? 'text-red-400' : 'text-red-700',
        };
      case 'orange':
        return {
          bg: isDark ? 'bg-orange-950/30' : 'bg-orange-50',
          border: isDark ? 'border-orange-900/50' : 'border-orange-100',
          iconBg: isDark ? 'bg-orange-900/50' : 'bg-orange-100',
          iconColor: '#F97316',
          title: isDark ? 'text-orange-400' : 'text-orange-700',
        };
      case 'emerald':
        return {
          bg: isDark ? 'bg-emerald-950/30' : 'bg-emerald-50',
          border: isDark ? 'border-emerald-900/50' : 'border-emerald-100',
          iconBg: isDark ? 'bg-emerald-900/50' : 'bg-emerald-100',
          iconColor: '#10B981',
          title: isDark ? 'text-emerald-400' : 'text-emerald-700',
        };
      case 'indigo':
        return {
          bg: isDark ? 'bg-indigo-950/30' : 'bg-indigo-50',
          border: isDark ? 'border-indigo-900/50' : 'border-indigo-100',
          iconBg: isDark ? 'bg-indigo-900/50' : 'bg-indigo-100',
          iconColor: '#6366F1',
          title: isDark ? 'text-indigo-400' : 'text-indigo-700',
        };
      case 'blue':
        return {
          bg: isDark ? 'bg-blue-950/30' : 'bg-blue-50',
          border: isDark ? 'border-blue-900/50' : 'border-blue-100',
          iconBg: isDark ? 'bg-blue-900/50' : 'bg-blue-100',
          iconColor: '#3B82F6',
          title: isDark ? 'text-blue-400' : 'text-blue-700',
        };
      default:
        return {
          bg: isDark ? 'bg-gray-800/50' : 'bg-gray-50',
          border: isDark ? 'border-gray-700' : 'border-gray-200',
          iconBg: isDark ? 'bg-gray-700' : 'bg-gray-200',
          iconColor: isDark ? '#9CA3AF' : '#6B7280',
          title: isDark ? 'text-gray-300' : 'text-gray-700',
        };
    }
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-2 mb-3">
        <Feather name="cpu" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          Smart Insights
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {insights.map((insight, index) => {
          const config = getColorConfig(insight.color);
          
          let desc = t(insight.descKey as any);
          if (insight.value) {
            desc = desc.replace('{{value}}', insight.value);
          }

          return (
            <View 
              key={index}
              className={`rounded-3xl p-5 border ${config.bg} ${config.border}`}
              style={{ width: 280 }}
            >
              <View className="flex-row items-center gap-3 mb-3">
                <View className={`w-10 h-10 rounded-2xl items-center justify-center ${config.iconBg}`}>
                  <Feather name={insight.icon as any} size={18} color={config.iconColor} />
                </View>
                <Text className={`flex-1 text-sm font-bold ${config.title}`} numberOfLines={2}>
                  {t(insight.titleKey as any)}
                </Text>
              </View>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                {desc}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

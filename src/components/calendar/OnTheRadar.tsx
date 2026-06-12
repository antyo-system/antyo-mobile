import { View, Text, ScrollView, Pressable, useColorScheme } from 'react-native';
import { useTaskStore } from '@/store/useTaskStore';
import { differenceInDays, isPast, isToday, format } from 'date-fns';
import { Feather } from '@expo/vector-icons';

export function OnTheRadar() {
  const milestones = useTaskStore(s => s.milestones);
  const toggleMilestone = useTaskStore(s => s.toggleMilestone);
  const isDark = useColorScheme() === 'dark';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMilestones = milestones
    .filter(m => !m.isCompleted)
    .filter(m => {
      const d = new Date(m.date);
      d.setHours(0, 0, 0, 0);
      const diff = differenceInDays(d, today);
      return diff <= 14 && diff >= -30;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (upcomingMilestones.length === 0) return null;

  return (
    <View className="mb-5 -mx-5 px-5">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 20 }}
      >
        {upcomingMilestones.map(milestone => {
          const mDate = new Date(milestone.date);
          mDate.setHours(0, 0, 0, 0);
          const diff = differenceInDays(mDate, today);

          // Label
          let label = `${diff}d`;
          if (isToday(mDate)) label = 'Today';
          else if (diff === 1) label = 'Tmrw';
          else if (diff < 0) label = `${Math.abs(diff)}d over`;

          // Colors by urgency
          const isCritical = diff <= 1 || isPast(mDate) || isToday(mDate);
          const isApproaching = !isCritical && diff <= 7;

          let chipBg: string;
          let labelColor: string;
          let titleColor: string;
          let iconColor: string;

          if (isCritical) {
            chipBg    = isDark ? '#450a0a' : '#FEF2F2';
            labelColor = isDark ? '#F87171' : '#DC2626';
            titleColor = isDark ? '#FCA5A5' : '#991B1B';
            iconColor  = isDark ? '#F87171' : '#EF4444';
          } else if (isApproaching) {
            chipBg    = isDark ? '#431407' : '#FFFBEB';
            labelColor = isDark ? '#FCD34D' : '#D97706';
            titleColor = isDark ? '#FDE68A' : '#92400E';
            iconColor  = isDark ? '#FBBF24' : '#F59E0B';
          } else {
            chipBg    = isDark ? '#1F2937' : '#F9FAFB';
            labelColor = isDark ? '#9CA3AF' : '#6B7280';
            titleColor = isDark ? '#E5E7EB' : '#374151';
            iconColor  = isDark ? '#6B7280' : '#9CA3AF';
          }

          return (
            <Pressable
              key={milestone.id}
              onPress={() => toggleMilestone(milestone.id)}
              style={{ backgroundColor: chipBg }}
              className="flex-row items-center gap-2 px-3 py-2 rounded-full"
            >
              <Feather
                name={isCritical ? 'alert-circle' : 'flag'}
                size={11}
                color={iconColor}
              />
              <Text
                numberOfLines={1}
                style={{ color: titleColor, maxWidth: 130 }}
                className="text-xs font-bold"
              >
                {milestone.title}
              </Text>
              <Text style={{ color: labelColor }} className="text-[10px] font-black">
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

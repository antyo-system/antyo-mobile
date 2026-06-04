import { View, Text } from 'react-native';
import { useMemo, useEffect, useState } from 'react';
import { differenceInDays, differenceInWeeks, startOfDay } from 'date-fns';
import { useSettingsStore } from '@/store/useSettingsStore';

export function LifetimeCountdown() {
  const { birthYear, retirementAge } = useSettingsStore();
  const [now, setNow] = useState(new Date());

  // Update exactly at midnight to flip the days correctly
  useEffect(() => {
    // Instead of interval every second, this only needs to update once a day.
    // However, to keep it simple and handle app resuming from background, we check every minute.
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); 
    return () => clearInterval(interval);
  }, []);

  const { daysLeft, weeksLeft } = useMemo(() => {
    const today = startOfDay(now);
    // Retirement date is assumed to be January 1st of the retirement year
    const retirementYear = birthYear + retirementAge;
    const retirementDate = new Date(retirementYear, 0, 1);

    const diffDays = differenceInDays(retirementDate, today);
    const diffWeeks = differenceInWeeks(retirementDate, today);

    return {
      daysLeft: Math.max(0, diffDays),
      weeksLeft: Math.max(0, diffWeeks),
    };
  }, [birthYear, retirementAge, now]);

  return (
    <View className="flex-1 bg-gray-900 dark:bg-black rounded-3xl p-5 shadow-sm border border-gray-800 justify-center">
      <Text className="font-black tracking-widest uppercase text-[9px] mb-2 text-emerald-500">
        Lifetime
      </Text>
      
      <View className="items-start">
        <Text 
          className="text-2xl font-black tabular-nums text-white leading-none w-full"
          adjustsFontSizeToFit
          numberOfLines={1}
        >
          {daysLeft.toLocaleString()}
        </Text>
        <Text className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
          Days Left
        </Text>
      </View>

      <View className="mt-3 bg-emerald-500/10 px-2 py-1 rounded-md self-start">
        <Text className="text-[9px] font-bold text-emerald-400">
          ≈ {weeksLeft.toLocaleString()} WEEKS
        </Text>
      </View>
    </View>
  );
}

import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, useColorScheme } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMasteryStore, Skill } from '@/store/useMasteryStore';
import { useTimerStore } from '@/store/useTimerStore';
import { getMasteryProgress } from '@/utils/mastery';

export function SkillSelector() {
  const isDark = useColorScheme() === 'dark';
  const skills = useMasteryStore(s => s.skills);
  const selectedSkillId = useTimerStore(s => s.selectedSkillId);
  const selectedPillarId = useTimerStore(s => s.selectedPillarId);
  const setSelectedSkillId = useTimerStore(s => s.setSelectedSkillId);
  const setSelectedPillarId = useTimerStore(s => s.setSelectedPillarId);
  
  const [modalVisible, setModalVisible] = useState(false);

  const selectedSkill = skills.find(s => s.id === selectedSkillId);
  const selectedPillar = selectedSkill?.pillars?.find(p => p.id === selectedPillarId);

  const renderBadge = () => {
    if (selectedSkill) {
      return (
        <View className="flex-row items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800">
          <Feather name={selectedSkill.icon as any} size={12} color={isDark ? '#60A5FA' : '#3B82F6'} />
          <Text className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {selectedSkill.name}{selectedPillar ? ` • ${selectedPillar.name}` : ''}
          </Text>
        </View>
      );
    }
    return (
      <View className="flex-row items-center gap-1.5 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded-full border border-dashed border-gray-300 dark:border-gray-700">
        <Feather name="target" size={12} color={isDark ? '#9CA3AF' : '#6B7280'} />
        <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Assign Skill
        </Text>
      </View>
    );
  };

  return (
    <>
      <Pressable 
        onPress={() => setModalVisible(true)}
        className="mt-2 active:opacity-70"
      >
        {renderBadge()}
      </Pressable>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[60%]">
            <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <Text className="text-xl font-black text-gray-900 dark:text-white">Assign Skill</Text>
              <Pressable onPress={() => setModalVisible(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Feather name="x" size={16} color={isDark ? 'white' : 'black'} />
              </Pressable>
            </View>
            
            <ScrollView className="p-6">
              <Pressable
                onPress={() => {
                  setSelectedSkillId(null);
                  setModalVisible(false);
                }}
                className={`flex-row items-center p-4 rounded-2xl mb-3 border ${
                  selectedSkillId === null
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                }`}
              >
                <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mr-4">
                  <Feather name="slash" size={16} color="#9CA3AF" />
                </View>
                <Text className={`text-base font-bold ${
                  selectedSkillId === null ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                }`}>
                  No Skill (General Focus)
                </Text>
              </Pressable>

              {skills.map(skill => {
                const progress = getMasteryProgress(skill.totalSeconds);
                const isSelected = selectedSkillId === skill.id;
                
                return (
                  <View key={skill.id} className="mb-3">
                    <Pressable
                      onPress={() => {
                        if (isSelected) {
                          setSelectedSkillId(null); // toggle off
                        } else {
                          setSelectedSkillId(skill.id);
                        }
                      }}
                      className={`flex-row items-center p-4 rounded-2xl border ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                      }`}
                    >
                      <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-4">
                        <Feather name={skill.icon as any} size={18} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Text className={`text-base font-bold ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {skill.name}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {progress.currentLevel.level} • {progress.currentLevel.icon}
                        </Text>
                      </View>
                      {isSelected && (
                        <Feather name="check-circle" size={20} color="#3B82F6" />
                      )}
                    </Pressable>
                    
                    {/* Pillars Sub-list */}
                    {isSelected && skill.pillars && skill.pillars.length > 0 && (
                      <View className="ml-8 mt-2 gap-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4 py-2">
                        {skill.pillars.map(pillar => {
                          const isPillarSelected = selectedPillarId === pillar.id;
                          return (
                            <Pressable
                              key={pillar.id}
                              onPress={() => {
                                setSelectedPillarId(isPillarSelected ? null : pillar.id);
                                setModalVisible(false);
                              }}
                              className={`flex-row items-center justify-between p-3 rounded-xl border ${
                                isPillarSelected
                                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/40'
                                  : 'border-transparent bg-gray-50 dark:bg-gray-800'
                              }`}
                            >
                              <Text className={`text-sm font-semibold ${
                                isPillarSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {pillar.name}
                              </Text>
                              {isPillarSelected && <Feather name="check" size={16} color="#3B82F6" />}
                            </Pressable>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              })}
              
              {/* Optional: Add Skill button could go here later */}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

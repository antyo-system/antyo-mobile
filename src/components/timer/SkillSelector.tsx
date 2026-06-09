import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, useColorScheme, Alert, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useMasteryStore, Skill } from '@/store/useMasteryStore';
import { useTimerStore } from '@/store/useTimerStore';
import { getMasteryProgress } from '@/utils/mastery';
import { useTranslation } from '@/hooks/useTranslation';

export function SkillSelector() {
  const { t } = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const { skills, addSkill, updateSkill, deleteSkill } = useMasteryStore();
  const selectedSkillId = useTimerStore(s => s.selectedSkillId);
  const selectedPillarId = useTimerStore(s => s.selectedPillarId);
  const setSelectedSkillId = useTimerStore(s => s.setSelectedSkillId);
  const setSelectedPillarId = useTimerStore(s => s.setSelectedPillarId);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [isManageMode, setIsManageMode] = useState(false);
  
  // States for inline adding/editing
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [draftName, setDraftName] = useState('');

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
          {t('timer.assignSkill')}
        </Text>
      </View>
    );
  };

  const handleSaveDraft = () => {
    if (!draftName.trim()) {
      setIsAddingNew(false);
      setEditingSkillId(null);
      setDraftName('');
      return;
    }

    if (isAddingNew) {
      addSkill({
        name: draftName.trim(),
        icon: 'star', // Default icon for quick add
        color: 'blue'
      });
    } else if (editingSkillId) {
      updateSkill(editingSkillId, { name: draftName.trim() });
    }
    
    setIsAddingNew(false);
    setEditingSkillId(null);
    setDraftName('');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      "Delete Skill",
      `Are you sure you want to delete "${name}"? This will also delete all its pillars and time progress.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            if (selectedSkillId === id) {
              setSelectedSkillId(null);
              setSelectedPillarId(null);
            }
            deleteSkill(id);
          }
        }
      ]
    );
  };

  const resetModals = () => {
    setModalVisible(false);
    setIsManageMode(false);
    setIsAddingNew(false);
    setEditingSkillId(null);
    setDraftName('');
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
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end bg-black/50"
        >
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl h-[75%]">
            {/* Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <Text className="text-xl font-black text-gray-900 dark:text-white">{t('timer.assignSkill')}</Text>
              <View className="flex-row items-center gap-3">
                <Pressable 
                  onPress={() => {
                    setIsManageMode(!isManageMode);
                    setIsAddingNew(false);
                    setEditingSkillId(null);
                  }}
                  className={`p-2 rounded-full ${isManageMode ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  <Feather name={isManageMode ? 'check' : 'edit-2'} size={16} color={isManageMode ? '#3B82F6' : (isDark ? '#D1D5DB' : '#4B5563')} />
                </Pressable>
                <Pressable onPress={resetModals} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Feather name="x" size={16} color={isDark ? 'white' : 'black'} />
                </Pressable>
              </View>
            </View>
            
            <ScrollView className="p-6" keyboardShouldPersistTaps="handled">
              {!isManageMode && (
                <Pressable
                  onPress={() => {
                    setSelectedSkillId(null);
                    setSelectedPillarId(null);
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
                    {t('timer.noSkill')}
                  </Text>
                </Pressable>
              )}

              {skills.map(skill => {
                const progress = getMasteryProgress(skill.totalSeconds);
                const isSelected = selectedSkillId === skill.id;
                const isEditingThis = editingSkillId === skill.id;
                
                // Inline Edit Form
                if (isEditingThis) {
                  return (
                    <View key={`edit-${skill.id}`} className="flex-row items-center p-3 rounded-2xl border border-blue-500 bg-white dark:bg-gray-900 mb-3 shadow-sm">
                      <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-3">
                        <Feather name={skill.icon as any} size={18} color="#3B82F6" />
                      </View>
                      <TextInput 
                        value={draftName}
                        onChangeText={setDraftName}
                        style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: isDark ? 'white' : '#111827', padding: 0 }}
                        placeholder="Skill name..."
                        placeholderTextColor="#9CA3AF"
                        onSubmitEditing={handleSaveDraft}
                        returnKeyType="done"
                      />
                      <Pressable onPress={handleSaveDraft} className="p-2.5 bg-blue-500 rounded-full ml-2">
                        <Feather name="check" size={16} color="white" />
                      </Pressable>
                    </View>
                  );
                }

                return (
                  <View key={`view-${skill.id}`} className="mb-3">
                    <Pressable
                      onPress={() => {
                        if (isManageMode) return; // Prevent selecting while managing
                        if (isSelected) {
                          setSelectedSkillId(null);
                          setSelectedPillarId(null);
                        } else {
                          setSelectedSkillId(skill.id);
                          setSelectedPillarId(null); // Reset pillar when changing skill
                        }
                      }}
                      className={`flex-row items-center p-4 rounded-2xl border ${
                        isSelected && !isManageMode
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
                      }`}
                    >
                      <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-4">
                        <Feather name={skill.icon as any} size={18} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Text className={`text-base font-bold ${
                          isSelected && !isManageMode ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          {skill.name}
                        </Text>
                        {!isManageMode && (
                          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {t(`levels.${progress.currentLevel.level.toLowerCase()}` as any)} • {progress.currentLevel.icon}
                          </Text>
                        )}
                      </View>
                      
                      {/* Manage Actions vs Selection Checkmark */}
                      {isManageMode ? (
                        <View className="flex-row items-center gap-2">
                          <Pressable 
                            onPress={() => {
                              setDraftName(skill.name);
                              setEditingSkillId(skill.id);
                            }}
                            className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full"
                          >
                            <Feather name="edit-2" size={16} color={isDark ? '#D1D5DB' : '#4B5563'} />
                          </Pressable>
                          <Pressable 
                            onPress={() => handleDelete(skill.id, skill.name)}
                            className="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-full"
                          >
                            <Feather name="trash-2" size={16} color="#EF4444" />
                          </Pressable>
                        </View>
                      ) : (
                        isSelected && <Feather name="check-circle" size={20} color="#3B82F6" />
                      )}
                    </Pressable>
                    
                    {/* Pillars Sub-list (Hide during Manage mode) */}
                    {isSelected && !isManageMode && skill.pillars && skill.pillars.length > 0 && (
                      <View className="ml-8 mt-2 gap-2 border-l-2 border-gray-100 dark:border-gray-800 pl-4 py-2">
                        {skill.pillars.map(pillar => {
                          const isPillarSelected = selectedPillarId === pillar.id;
                          return (
                            <Pressable
                              key={pillar.id}
                              onPress={() => {
                                setSelectedPillarId(isPillarSelected ? null : pillar.id);
                                setModalVisible(false); // Auto close after selecting a pillar
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

              {/* Inline Add New Form */}
              {isAddingNew ? (
                <View className="flex-row items-center p-3 rounded-2xl border border-blue-500 bg-white dark:bg-gray-900 mb-8 shadow-sm">
                  <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 items-center justify-center mr-3">
                    <Feather name="star" size={18} color="#3B82F6" />
                  </View>
                  <TextInput 
                    value={draftName}
                    onChangeText={setDraftName}
                    style={{ flex: 1, fontSize: 16, fontWeight: 'bold', color: isDark ? 'white' : '#111827', padding: 0 }}
                    placeholder="New skill name..."
                    placeholderTextColor="#9CA3AF"
                    onSubmitEditing={handleSaveDraft}
                    returnKeyType="done"
                  />
                  <Pressable onPress={handleSaveDraft} className="p-2.5 bg-blue-500 rounded-full ml-2">
                    <Feather name="check" size={16} color="white" />
                  </Pressable>
                </View>
              ) : (
                <Pressable 
                  onPress={() => {
                    setDraftName('');
                    setIsAddingNew(true);
                    setIsManageMode(true); // Automatically enter manage mode so they see Edit options too
                  }}
                  className="flex-row items-center justify-center p-4 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 mb-8"
                >
                  <Feather name="plus" size={18} color={isDark ? '#9CA3AF' : '#6B7280'} />
                  <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-2">{t('timer.addNewSkill')}</Text>
                </Pressable>
              )}
              
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

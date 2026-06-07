import { useMasteryStore } from '@/store/useMasteryStore';
import { getMasteryProgress } from '@/utils/mastery';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SkillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isDark = useColorScheme() === 'dark';
  const skill = useMasteryStore(s => s.skills.find(sk => sk.id === id));
  const addPillar = useMasteryStore(s => s.addPillar);
  const deletePillar = useMasteryStore(s => s.deletePillar);
  const deleteSkill = useMasteryStore(s => s.deleteSkill);
  const updatePillar = useMasteryStore(s => s.updatePillar);

  const [modalVisible, setModalVisible] = useState(false);
  const [newPillarName, setNewPillarName] = useState('');

  // Edit State
  const [editSkillVisible, setEditSkillVisible] = useState(false);
  const [editSkillName, setEditSkillName] = useState('');
  const [editSkillHours, setEditSkillHours] = useState('');

  const [editPillarVisible, setEditPillarVisible] = useState(false);
  const [editingPillarId, setEditingPillarId] = useState<string | null>(null);
  const [editPillarName, setEditPillarName] = useState('');
  const [editPillarHours, setEditPillarHours] = useState('');

  const updateSkill = useMasteryStore(s => s.updateSkill);

  if (!skill) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-950 items-center justify-center">
        <Text className="text-gray-500">Skill not found.</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <Text className="text-gray-900 dark:text-white">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const progress = getMasteryProgress(skill.totalSeconds);

  const handleAddPillar = () => {
    if (newPillarName.trim()) {
      addPillar(skill.id, newPillarName.trim());
      setNewPillarName('');
      setModalVisible(false);
    }
  };

  const handleDeleteSkill = () => {
    Alert.alert(
      "Delete Skill",
      `Are you sure you want to delete "${skill.name}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSkill(skill.id);
            router.back();
          }
        }
      ]
    );
  };

  const handleSaveEditSkill = () => {
    const hours = parseFloat(editSkillHours);
    updateSkill(skill.id, {
      name: editSkillName.trim() || skill.name,
      totalSeconds: isNaN(hours) ? skill.totalSeconds : hours * 3600,
    });
    setEditSkillVisible(false);
  };

  const handleSaveEditPillar = () => {
    if (editingPillarId) {
      const hours = parseFloat(editPillarHours);
      const targetPillar = skill.pillars?.find(p => p.id === editingPillarId);
      updatePillar(skill.id, editingPillarId, {
        name: editPillarName.trim() || targetPillar?.name,
        totalSeconds: isNaN(hours) ? targetPillar?.totalSeconds : hours * 3600,
      });
      setEditPillarVisible(false);
      setEditingPillarId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4">
        <Pressable onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full">
          <Feather name="arrow-left" size={20} color={isDark ? "white" : "black"} />
        </Pressable>
        <Text className="text-lg font-black text-gray-900 dark:text-white">Skill Details</Text>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => {
              setEditSkillName(skill.name);
              setEditSkillHours((skill.totalSeconds / 3600).toFixed(1));
              setEditSkillVisible(true);
            }}
            className="w-10 h-10 items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-full"
          >
            <Feather name="edit-2" size={16} color="#3B82F6" />
          </Pressable>
          <Pressable onPress={handleDeleteSkill} className="w-10 h-10 items-center justify-center bg-red-100 dark:bg-red-900/30 rounded-full">
            <Feather name="trash-2" size={16} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {/* Main Skill Progress */}
        <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 mb-8 shadow-sm border border-gray-100 dark:border-gray-800 items-center">
          <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }}>
            <Feather name={skill.icon as any} size={28} color="#3B82F6" />
          </View>
          <Text className="text-2xl font-black text-gray-900 dark:text-white mb-1">{skill.name}</Text>
          <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">
            {progress.currentLevel.icon} {progress.currentLevel.level} Level
          </Text>

          <View className="w-full bg-gray-100 dark:bg-gray-800 h-4 rounded-full overflow-hidden mb-2">
            <View className="h-full bg-blue-500 rounded-full" style={{ width: `${progress.progressPercentage}%` }} />
          </View>
          <View className="w-full flex-row justify-between">
            <Text className="text-xs font-bold text-gray-400">{Math.floor(progress.totalHours)}h Total</Text>
            <Text className="text-xs font-bold text-blue-500">10,000h Goal</Text>
          </View>
        </View>

        {/* Pillars (Skill Tree) */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-xl font-black text-gray-900 dark:text-white">Pillars</Text>
            <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">Your core sub-skills</Text>
          </View>
          <Pressable
            onPress={() => setModalVisible(true)}
            className="flex-row items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-800"
          >
            <Feather name="plus" size={14} color="#3B82F6" />
            <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">Add</Text>
          </Pressable>
        </View>

        <View className="ml-4 border-l-2 border-gray-200 dark:border-gray-800 pl-6 pb-4">
          {skill.pillars?.map((pillar, index) => (
            <View key={pillar.id} className="relative mb-6">
              {/* Connector dot */}
              <View className="absolute -left-[31px] top-4 w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-950" />

              <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-base font-bold text-gray-900 dark:text-white flex-1">{pillar.name}</Text>
                  <View className="flex-row items-center gap-2">
                    <Pressable
                      onPress={() => {
                        setEditingPillarId(pillar.id);
                        setEditPillarName(pillar.name);
                        setEditPillarHours((pillar.totalSeconds / 3600).toFixed(1));
                        setEditPillarVisible(true);
                      }}
                      className="p-1.5"
                    >
                      <Feather name="edit-2" size={14} color="#3B82F6" />
                    </Pressable>
                    <Pressable onPress={() => deletePillar(skill.id, pillar.id)} className="p-1.5">
                      <Feather name="trash-2" size={14} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>
                <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {Math.floor(pillar.totalSeconds / 3600)} Hours
                </Text>
              </View>
            </View>
          ))}

          {(!skill.pillars || skill.pillars.length === 0) && (
            <View className="py-4">
              <Text className="text-gray-500 font-bold">No pillars created yet. Add one to start tracking sub-skills.</Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Add Pillar Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-black/50 p-6">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-black text-gray-900 dark:text-white">New Pillar</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Feather name="x" size={20} color={isDark ? "white" : "black"} />
              </Pressable>
            </View>
            <TextInput
              value={newPillarName}
              onChangeText={setNewPillarName}
              placeholder="e.g., React Native, Typography..."
              placeholderTextColor="#9CA3AF"
              style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', fontWeight: '600', marginBottom: 24 }}
            />
            <Pressable
              onPress={handleAddPillar}
              className="bg-blue-600 py-4 rounded-xl items-center"
            >
              <Text className="text-white font-black">Create Pillar</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Skill Modal */}
      <Modal visible={editSkillVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-black/50 p-6">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-gray-900 dark:text-white">Edit Skill</Text>
              <Pressable onPress={() => setEditSkillVisible(false)}>
                <Feather name="x" size={20} color={isDark ? "white" : "black"} />
              </Pressable>
            </View>
            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Skill Name</Text>
            <TextInput
              value={editSkillName}
              onChangeText={setEditSkillName}
              style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', fontWeight: '600', marginBottom: 16 }}
            />
            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Total Hours (Progress)</Text>
            <TextInput
              value={editSkillHours}
              onChangeText={setEditSkillHours}
              keyboardType="decimal-pad"
              style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', fontWeight: '600', marginBottom: 24 }}
            />
            <Pressable onPress={handleSaveEditSkill} className="bg-blue-600 py-4 rounded-xl items-center">
              <Text className="text-white font-black">Save Changes</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Edit Pillar Modal */}
      <Modal visible={editPillarVisible} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1 justify-center bg-black/50 p-6">
          <View className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-lg font-black text-gray-900 dark:text-white">Edit Pillar</Text>
              <Pressable onPress={() => { setEditPillarVisible(false); setEditingPillarId(null); }}>
                <Feather name="x" size={20} color={isDark ? "white" : "black"} />
              </Pressable>
            </View>
            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Pillar Name</Text>
            <TextInput
              value={editPillarName}
              onChangeText={setEditPillarName}
              style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', fontWeight: '600', marginBottom: 16 }}
            />
            <Text className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Total Hours</Text>
            <TextInput
              value={editPillarHours}
              onChangeText={setEditPillarHours}
              keyboardType="decimal-pad"
              style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', borderRadius: 12, padding: 16, color: isDark ? 'white' : '#111827', fontWeight: '600', marginBottom: 24 }}
            />
            <Pressable onPress={handleSaveEditPillar} className="bg-blue-600 py-4 rounded-xl items-center">
              <Text className="text-white font-black">Save Changes</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

import { Modal, View, Text, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CHANGELOG, APP_VERSION } from '@/constants/changelog';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function ChangelogModal({ visible, onClose }: Props) {
  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white dark:bg-gray-950 rounded-t-3xl h-[80%]">
          <View className="flex-row items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <View>
              <Text className="text-2xl font-black text-gray-900 dark:text-white">Update Notes</Text>
              <Text className="text-sm font-bold text-gray-500 mt-1">Current Version: v{APP_VERSION}</Text>
            </View>
            <Pressable onPress={onClose} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
              <Feather name="x" size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
            {CHANGELOG.map((release, i) => (
              <View key={release.version} className={`mb-8 ${i !== CHANGELOG.length - 1 ? 'border-b border-gray-100 dark:border-gray-800 pb-8' : ''}`}>
                <View className="flex-row items-end gap-3 mb-4">
                  <Text className="text-xl font-black text-blue-600 dark:text-blue-500">v{release.version}</Text>
                  <Text className="text-sm font-bold text-gray-400 pb-0.5">{release.date}</Text>
                </View>

                {release.features.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs font-black uppercase tracking-wider text-green-600 dark:text-green-500 mb-2">✨ New Features</Text>
                    {release.features.map((feature, j) => (
                      <View key={j} className="flex-row items-start gap-2 mb-2">
                        <Text className="text-gray-400 mt-1">•</Text>
                        <Text className="text-gray-700 dark:text-gray-300 font-medium flex-1 leading-5">{feature}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {release.fixes.length > 0 && (
                  <View>
                    <Text className="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-500 mb-2">🐛 Bug Fixes & Improvements</Text>
                    {release.fixes.map((fix, j) => (
                      <View key={j} className="flex-row items-start gap-2 mb-2">
                        <Text className="text-gray-400 mt-1">•</Text>
                        <Text className="text-gray-700 dark:text-gray-300 font-medium flex-1 leading-5">{fix}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

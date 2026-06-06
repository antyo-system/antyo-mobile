import { documentDirectory, writeAsStringAsync, getInfoAsync, readAsStringAsync, deleteAsync } from 'expo-file-system/legacy';
import { StateStorage } from 'zustand/middleware';

const getFilePath = (name: string) => {
  return `${documentDirectory}${name}.json`;
};

export const zustandStorage: StateStorage = {
  setItem: async (name, value) => {
    try {
      await writeAsStringAsync(getFilePath(name), value);
    } catch (e) {
      console.error('File storage setItem error:', e);
    }
  },
  getItem: async (name) => {
    try {
      const path = getFilePath(name);
      const info = await getInfoAsync(path);
      if (!info.exists) {
        return null;
      }
      return await readAsStringAsync(path);
    } catch (e) {
      console.error('File storage getItem error:', e);
      return null;
    }
  },
  removeItem: async (name) => {
    try {
      const path = getFilePath(name);
      const info = await getInfoAsync(path);
      if (info.exists) {
        await deleteAsync(path);
      }
    } catch (e) {
      console.error('FileSystem removeItem error:', e);
    }
  },
};

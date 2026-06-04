import { StateStorage } from 'zustand/middleware';

let storage: {
  set: (key: string, value: string | boolean | number) => void;
  getString: (key: string) => string | undefined;
  remove: (key: string) => void;
};

try {
  const { createMMKV } = require('react-native-mmkv');
  storage = createMMKV({ id: 'antyo-storage' });
} catch (e) {
  console.warn('[mmkv] Native module unavailable, using in-memory fallback:', e);
  const memStore = new Map<string, string>();
  storage = {
    set: (key: string, value: string | boolean | number) => { memStore.set(key, String(value)); },
    getString: (key: string) => memStore.get(key),
    remove: (key: string) => { memStore.delete(key); },
  };
}

export { storage };

export const zustandStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    storage.remove(name);
  },
};

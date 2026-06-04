import { StateStorage } from 'zustand/middleware';

// Web-only storage adapter using localStorage (no react-native-mmkv)
export const storage = {
  set: (key: string, value: string | boolean | number) => {
    try { localStorage.setItem(key, String(value)); } catch(e) {}
  },
  getString: (key: string): string | undefined => {
    try { return localStorage.getItem(key) || undefined; } catch(e) { return undefined; }
  },
  remove: (key: string) => {
    try { localStorage.removeItem(key); } catch(e) {}
  },
};

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

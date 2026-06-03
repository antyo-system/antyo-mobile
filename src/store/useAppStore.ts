import { create } from 'zustand';
import { MMKV, createMMKV } from 'react-native-mmkv';

// In-memory fallback when NitroModules/MMKV native module is unavailable (e.g. certain emulator configs)
const memoryStore = new Map<string, string | boolean | number>();

const createFallbackStorage = () => ({
  set: (key: string, value: string | boolean | number) => { memoryStore.set(key, value); },
  getString: (key: string) => memoryStore.get(key) as string | undefined,
  getBoolean: (key: string) => memoryStore.get(key) as boolean | undefined,
  getNumber: (key: string) => memoryStore.get(key) as number | undefined,
  contains: (key: string) => memoryStore.has(key),
  getAllKeys: () => Array.from(memoryStore.keys()),
  clearAll: () => { memoryStore.clear(); },
  remove: (key: string) => { 
    const has = memoryStore.has(key);
    memoryStore.delete(key); 
    return has;
  },
});

import { Platform } from 'react-native';

let storage: any;

if (Platform.OS === 'web') {
  storage = {
    set: (key: string, value: string | boolean | number) => { 
      try { localStorage.setItem(key, String(value)); } catch(e) {}
    },
    getString: (key: string) => { 
      try { return localStorage.getItem(key) || undefined; } catch(e) { return undefined; }
    },
    getBoolean: (key: string) => { 
      try { 
        const val = localStorage.getItem(key);
        if (val === null) return undefined;
        return val === 'true';
      } catch(e) { return undefined; }
    },
    getNumber: (key: string) => { 
      try { 
        const val = localStorage.getItem(key);
        if (val === null) return undefined;
        return Number(val);
      } catch(e) { return undefined; }
    },
    contains: (key: string) => {
      try { return localStorage.getItem(key) !== null; } catch(e) { return false; }
    },
    getAllKeys: () => [],
    clearAll: () => { try { localStorage.clear(); } catch(e) {} },
    remove: (key: string) => { try { localStorage.removeItem(key); return true; } catch(e) { return false; } },
  };
} else {
  try {
    storage = createMMKV();
  } catch (e) {
    console.warn('[useAppStore] MMKV native module unavailable, using in-memory fallback:', e);
    storage = createFallbackStorage();
  }
}

export { storage };

interface AppState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (value: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  hasSeenOnboarding: storage.getBoolean('hasSeenOnboarding') ?? false,
  setHasSeenOnboarding: (value) => {
    storage.set('hasSeenOnboarding', value);
    set({ hasSeenOnboarding: value });
  },
}));

import { useSettingsStore } from '@/store/useSettingsStore';
import { translations, Language } from '@/constants/translations';
import { useCallback } from 'react';

export const useTranslation = () => {
  const language = useSettingsStore((state) => state.language) as Language;

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    const getString = (langObj: any): any => {
      let current = langObj;
      for (const k of keys) {
        if (current && current[k] !== undefined) {
          current = current[k];
        } else {
          return null;
        }
      }
      return current;
    };

    let result = getString(translations[language]);
    
    if (!result) {
      result = getString(translations['en']);
    }

    let finalString = typeof result === 'string' ? result : key;

    if (params && typeof finalString === 'string') {
      Object.keys(params).forEach(paramKey => {
        finalString = finalString.replace(new RegExp(`%{${paramKey}}`, 'g'), String(params[paramKey]));
      });
    }

    return finalString;
  }, [language]);

  return { t, language };
};

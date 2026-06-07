import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bloom_user_data';
const REFLECTIONS_KEY = '@bloom_reflections';

export interface BloomUser {
  name: string;
  lmp: string;
  dueDate?: string;
  isFirstPregnancy: boolean | null;
  hasCompletedOnboarding: boolean;
  lastMoodDate?: string;
  lastMood?: string;
}

const defaultUser: BloomUser = {
  name: '',
  lmp: '',
  dueDate: '',
  isFirstPregnancy: null,
  hasCompletedOnboarding: false,
};

interface BloomContextValue {
  user: BloomUser;
  isLoading: boolean;
  updateUser: (updates: Partial<BloomUser>) => Promise<void>;
  completeOnboarding: (data: Partial<BloomUser>) => Promise<void>;
  clearJourney: () => Promise<void>;
  pregnancyWeek: number;
  daysAlong: number;
}

const BloomContext = createContext<BloomContextValue | null>(null);

/**
 * Parse a YYYY-MM-DD string as a LOCAL date (not UTC).
 * new Date("2024-05-15") parses as UTC midnight and shifts by timezone offset.
 * new Date(2024, 4, 15) uses local time and is timezone-safe.
 */
function parseLMPString(lmp: string): Date | null {
  if (!lmp) return null;
  const parts = lmp.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [y, m, d] = parts;
  if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return null;
  const date = new Date(y, m - 1, d);
  // Validate the date rolled correctly (e.g. Feb 31 would shift month)
  if (date.getFullYear() !== y || date.getMonth() !== m - 1 || date.getDate() !== d) {
    return null;
  }
  return date;
}

/**
 * Validate that a parsed object looks like a BloomUser before trusting it.
 * Merges with defaults so any missing or new fields are always present.
 */
function sanitizeStoredUser(raw: unknown): BloomUser {
  if (!raw || typeof raw !== 'object') return { ...defaultUser };
  const obj = raw as Record<string, unknown>;
  return {
    name: typeof obj.name === 'string' ? obj.name : defaultUser.name,
    lmp: typeof obj.lmp === 'string' ? obj.lmp : defaultUser.lmp,
    dueDate: typeof obj.dueDate === 'string' ? obj.dueDate : defaultUser.dueDate,
    isFirstPregnancy:
      typeof obj.isFirstPregnancy === 'boolean' ? obj.isFirstPregnancy : defaultUser.isFirstPregnancy,
    hasCompletedOnboarding:
      typeof obj.hasCompletedOnboarding === 'boolean'
        ? obj.hasCompletedOnboarding
        : defaultUser.hasCompletedOnboarding,
    lastMoodDate: typeof obj.lastMoodDate === 'string' ? obj.lastMoodDate : undefined,
    lastMood: typeof obj.lastMood === 'string' ? obj.lastMood : undefined,
  };
}

export function BloomProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BloomUser>(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(stored);
        } catch {
          // Storage is corrupted — fall through to defaults, don't overwrite yet
          parsed = null;
        }
        setUser(sanitizeStoredUser(parsed));
      }
    } catch {
      // Storage unavailable — use defaults silently
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Functional setState to avoid stale closure when multiple updates fire rapidly.
   * Writes to storage after the state update settles.
   */
  const updateUser = useCallback(async (updates: Partial<BloomUser>) => {
    setUser((prev) => {
      const merged = { ...prev, ...updates };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  }, []);

  /**
   * Write to storage FIRST, then update state — prevents navigation race where
   * the router fires before the disk write is acknowledged.
   */
  const completeOnboarding = useCallback(async (data: Partial<BloomUser>) => {
    setUser((prev) => {
      const updated: BloomUser = { ...prev, ...data, hasCompletedOnboarding: true };
      // Synchronous reference capture for the storage write
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    // Give storage write a moment to settle before navigation fires
    await new Promise<void>((r) => setTimeout(r, 80));
  }, []);

  /**
   * Clear ALL journey data — both user profile and reflections.
   */
  const clearJourney = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([STORAGE_KEY, REFLECTIONS_KEY]);
    } catch {
      // Try individually if multiRemove fails
      try {
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem(REFLECTIONS_KEY);
      } catch {}
    }
    setUser({ ...defaultUser });
  }, []);

  const { pregnancyWeek, daysAlong } = useMemo(() => {
    const lmpDate = parseLMPString(user.lmp);
    if (!lmpDate) return { pregnancyWeek: 0, daysAlong: 0 };

    // Compare start-of-day local dates to avoid partial-day drift
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const diffMs = todayStart.getTime() - lmpDate.getTime();
    if (diffMs < 0) {
      // LMP is in the future — clamp to week 1, day 0
      return { pregnancyWeek: 1, daysAlong: 0 };
    }

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    return {
      pregnancyWeek: Math.max(1, Math.min(42, week)),
      daysAlong: Math.max(0, days),
    };
  }, [user.lmp]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      updateUser,
      completeOnboarding,
      clearJourney,
      pregnancyWeek,
      daysAlong,
    }),
    [user, isLoading, updateUser, completeOnboarding, clearJourney, pregnancyWeek, daysAlong],
  );

  return <BloomContext.Provider value={value}>{children}</BloomContext.Provider>;
}

export function useBloom() {
  const context = useContext(BloomContext);
  if (!context) throw new Error('useBloom must be used within a BloomProvider');
  return context;
}

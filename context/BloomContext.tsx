import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bloom_user_data';

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
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      // use defaults
    } finally {
      setIsLoading(false);
    }
  }

  async function updateUser(updates: Partial<BloomUser>) {
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  }

  async function completeOnboarding(data: Partial<BloomUser>) {
    const updated: BloomUser = { ...user, ...data, hasCompletedOnboarding: true };
    setUser(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  }

  async function clearJourney() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setUser({ ...defaultUser });
  }

  const { pregnancyWeek, daysAlong } = useMemo(() => {
    if (!user.lmp) return { pregnancyWeek: 0, daysAlong: 0 };
    const lmpDate = new Date(user.lmp);
    const today = new Date();
    const diffMs = today.getTime() - lmpDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const week = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return { pregnancyWeek: Math.max(1, Math.min(42, week)), daysAlong: days };
  }, [user.lmp]);

  const value = useMemo(() => ({
    user,
    isLoading,
    updateUser,
    completeOnboarding,
    clearJourney,
    pregnancyWeek,
    daysAlong,
  }), [user, isLoading, pregnancyWeek, daysAlong]);

  return (
    <BloomContext.Provider value={value}>
      {children}
    </BloomContext.Provider>
  );
}

export function useBloom() {
  const context = useContext(BloomContext);
  if (!context) throw new Error('useBloom must be used within a BloomProvider');
  return context;
}

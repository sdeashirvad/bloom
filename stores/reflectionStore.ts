import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReflectionEntry } from '@/types/reflection';

const STORAGE_KEY = '@bloom_reflections';

function todayString(): string {
  return new Date().toDateString();
}

export async function addReflection(entry: ReflectionEntry): Promise<void> {
  try {
    const existing = await getAllReflections();
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (_) {}
}

export async function getAllReflections(): Promise<ReflectionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReflectionEntry[];
  } catch (_) {
    return [];
  }
}

export async function getTodaysReflection(): Promise<ReflectionEntry | null> {
  try {
    const all = await getAllReflections();
    const today = todayString();
    return all.find((e) => new Date(e.createdAt).toDateString() === today) ?? null;
  } catch (_) {
    return null;
  }
}

export async function hasCheckedInToday(): Promise<boolean> {
  const entry = await getTodaysReflection();
  return entry !== null;
}

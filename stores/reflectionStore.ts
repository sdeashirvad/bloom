import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReflectionEntry, ReflectionMood } from '@/types/reflection';

const STORAGE_KEY = '@bloom_reflections';

const VALID_MOODS = new Set<ReflectionMood>(['calm', 'tired', 'emotional', 'anxious', 'happy']);

function todayString(): string {
  return new Date().toDateString();
}

/**
 * Validate that a raw object looks like a ReflectionEntry.
 * Rejects entries with missing required fields or invalid mood values.
 */
function isValidEntry(raw: unknown): raw is ReflectionEntry {
  if (!raw || typeof raw !== 'object') return false;
  const obj = raw as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    obj.id.length > 0 &&
    typeof obj.createdAt === 'string' &&
    typeof obj.pregnancyWeek === 'number' &&
    (obj.trimester === 1 || obj.trimester === 2 || obj.trimester === 3) &&
    typeof obj.mood === 'string' &&
    VALID_MOODS.has(obj.mood as ReflectionMood) &&
    typeof obj.bloomReply === 'string'
  );
}

/**
 * Read and parse all reflections from storage.
 * Returns [] on any error — never throws.
 * Silently filters out any malformed entries so one corrupt entry
 * cannot cause the entire list to be lost.
 */
export async function getAllReflections(): Promise<ReflectionEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidEntry);
  } catch {
    return [];
  }
}

/**
 * Append a new entry to the front of the list.
 * Deduplicates by entry.id to prevent double-saves from rapid taps
 * or React Strict Mode double-invocations.
 */
export async function addReflection(entry: ReflectionEntry): Promise<void> {
  try {
    const existing = await getAllReflections();
    // Deduplication: skip if an entry with this id already exists
    if (existing.some((e) => e.id === entry.id)) return;
    const updated = [entry, ...existing];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export async function getTodaysReflection(): Promise<ReflectionEntry | null> {
  try {
    const all = await getAllReflections();
    const today = todayString();
    return all.find((e) => new Date(e.createdAt).toDateString() === today) ?? null;
  } catch {
    return null;
  }
}

export async function hasCheckedInToday(): Promise<boolean> {
  const entry = await getTodaysReflection();
  return entry !== null;
}

export type ReflectionGroup = {
  key: string;
  label: string;
  entries: ReflectionEntry[];
};

/**
 * Group an already-fetched list of entries by calendar month.
 * Assumes entries are sorted newest-first (as stored by addReflection).
 */
export function groupReflectionsByMonth(entries: ReflectionEntry[]): ReflectionGroup[] {
  const groupMap = new Map<string, ReflectionEntry[]>();
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key)!.push(entry);
  }
  return Array.from(groupMap.entries()).map(([key, grpEntries]) => {
    const date = new Date(grpEntries[0].createdAt);
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return { key, label, entries: grpEntries };
  });
}

export async function getReflectionCount(): Promise<number> {
  const all = await getAllReflections();
  return all.length;
}

export async function getReflectionsByWeek(week: number): Promise<ReflectionEntry[]> {
  const all = await getAllReflections();
  return all.filter((e) => e.pregnancyWeek === week);
}

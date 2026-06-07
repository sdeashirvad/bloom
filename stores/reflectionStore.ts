import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReflectionEntry, ReflectionMood, MilestoneTag } from '@/types/reflection';

const STORAGE_KEY = '@bloom_reflections';
const SCHEMA_VERSION_KEY = '@bloom_schema_version';
const CURRENT_SCHEMA_VERSION = 2;

const VALID_MOODS = new Set<ReflectionMood>(['calm', 'tired', 'emotional', 'anxious', 'happy']);

// Module-level flag — migration only runs once per session
let migrationChecked = false;

function todayString(): string {
  return new Date().toDateString();
}

/**
 * Validate that a raw object looks like a ReflectionEntry.
 * Accepts both v1 (no optional fields) and v2 (with keptClose, milestoneTag, phase).
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
 * Migrate entries from v1 to v2 schema.
 * Adds default values for new optional fields without touching existing data.
 * Safe to run multiple times — idempotent.
 */
function migrateEntriesToV2(entries: ReflectionEntry[]): ReflectionEntry[] {
  return entries.map((entry) => ({
    phase: 'pregnancy' as const,
    keptClose: false,
    ...entry,
  }));
}

/**
 * Run schema migration if the stored version is behind CURRENT_SCHEMA_VERSION.
 * Called once per session before any reads/writes.
 * Silent on all errors — never disrupts the user experience.
 */
async function runMigrationIfNeeded(): Promise<void> {
  if (migrationChecked) return;
  migrationChecked = true;

  try {
    const storedVersion = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);
    const version = storedVersion ? parseInt(storedVersion, 10) : 1;

    if (version >= CURRENT_SCHEMA_VERSION) return;

    // v1 → v2: add keptClose, milestoneTag, phase defaults
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      let parsed: unknown;
      try { parsed = JSON.parse(raw); } catch { parsed = null; }
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(isValidEntry);
        const migrated = migrateEntriesToV2(valid);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
    }

    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, String(CURRENT_SCHEMA_VERSION));
  } catch {
    // Migration failure is non-fatal — app continues with existing data
  }
}

/**
 * Read and parse all reflections from storage.
 * Returns [] on any error — never throws.
 * Silently filters out any malformed entries so one corrupt entry
 * cannot cause the entire list to be lost.
 */
export async function getAllReflections(): Promise<ReflectionEntry[]> {
  await runMigrationIfNeeded();
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
 * New entries always get phase: 'pregnancy' and keptClose: false.
 */
export async function addReflection(entry: ReflectionEntry): Promise<void> {
  try {
    const existing = await getAllReflections();
    if (existing.some((e) => e.id === entry.id)) return;
    const enriched: ReflectionEntry = {
      phase: 'pregnancy',
      keptClose: false,
      ...entry,
    };
    const updated = [enriched, ...existing];
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

/**
 * Toggle the "Hold onto this" / keptClose state for a single entry.
 * Gentle, quiet — no notifications, no counts.
 */
export async function toggleKeptClose(id: string): Promise<boolean> {
  try {
    const all = await getAllReflections();
    let newState = false;
    const updated = all.map((e) => {
      if (e.id !== id) return e;
      newState = !e.keptClose;
      return { ...e, keptClose: newState };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newState;
  } catch {
    return false;
  }
}

/**
 * Return all entries the user has quietly held close.
 * Ordered newest-first (same as storage order).
 */
export async function getKeptCloseReflections(): Promise<ReflectionEntry[]> {
  const all = await getAllReflections();
  return all.filter((e) => e.keptClose === true);
}

/**
 * Set or clear a milestone tag on a reflection.
 * Pass null to remove an existing tag.
 */
export async function setMilestoneTag(id: string, tag: MilestoneTag | null): Promise<void> {
  try {
    const all = await getAllReflections();
    const updated = all.map((e) => {
      if (e.id !== id) return e;
      if (tag === null) {
        const { milestoneTag: _, ...rest } = e;
        return rest as ReflectionEntry;
      }
      return { ...e, milestoneTag: tag };
    });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
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

/**
 * Export snapshot — structured metadata for future memory book / PDF pipeline.
 * Returns a clean, serializable snapshot of the full reflection history.
 * NOT wired to any UI yet. Call this when the export feature is built.
 */
export async function exportSnapshot(): Promise<{
  exportedAt: string;
  schemaVersion: number;
  totalEntries: number;
  keptCloseCount: number;
  milestoneCount: number;
  entries: ReflectionEntry[];
}> {
  const entries = await getAllReflections();
  return {
    exportedAt: new Date().toISOString(),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    totalEntries: entries.length,
    keptCloseCount: entries.filter((e) => e.keptClose).length,
    milestoneCount: entries.filter((e) => e.milestoneTag).length,
    entries,
  };
}

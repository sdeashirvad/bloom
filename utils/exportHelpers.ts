/**
 * Export helpers — Memory Book / PDF pipeline foundation.
 *
 * These utilities organize and format reflection data for a future
 * printable pregnancy memory book or PDF export.
 *
 * NOT wired to any UI in v1. The architecture is ready; the output
 * surface (PDF renderer, share sheet) will be added in a future release.
 */

import { ReflectionEntry } from '@/types/reflection';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ExportEntry = {
  date: string;
  week: number;
  trimester: 1 | 2 | 3;
  mood: string;
  userReflection: string | null;
  bloomReply: string;
  milestoneTag: string | null;
  keptClose: boolean;
};

export type MemoryBookSection = {
  trimester: 1 | 2 | 3;
  label: string;
  description: string;
  entries: ExportEntry[];
  milestones: ExportEntry[];
  keptClose: ExportEntry[];
};

export type MemoryBookMetadata = {
  generatedAt: string;
  totalReflections: number;
  weeksJourneyed: number;
  firstEntryDate: string | null;
  lastEntryDate: string | null;
  sections: MemoryBookSection[];
};

// ─── Formatters ───────────────────────────────────────────────────────────────

const TRIMESTER_LABELS: Record<1 | 2 | 3, { label: string; description: string }> = {
  1: {
    label: 'First Trimester',
    description: 'The quiet beginning — weeks 1 through 13.',
  },
  2: {
    label: 'Second Trimester',
    description: 'Coming alive — weeks 14 through 27.',
  },
  3: {
    label: 'Third Trimester',
    description: 'The final chapter — weeks 28 through 40.',
  },
};

/**
 * Format a single ReflectionEntry into a clean, export-ready structure.
 * Strips internal IDs and normalises optional fields to null.
 */
export function formatEntryForExport(entry: ReflectionEntry): ExportEntry {
  const date = new Date(entry.createdAt);
  return {
    date: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    week: entry.pregnancyWeek,
    trimester: entry.trimester,
    mood: entry.mood,
    userReflection: entry.userReflection ?? null,
    bloomReply: entry.bloomReply,
    milestoneTag: entry.milestoneTag ?? null,
    keptClose: entry.keptClose ?? false,
  };
}

/**
 * Group and format entries into trimester-based memory book sections.
 * Each section includes all entries, plus quick-access lists for
 * milestones and kept-close moments.
 */
export function groupEntriesForMemoryBook(entries: ReflectionEntry[]): MemoryBookSection[] {
  const sectionMap = new Map<1 | 2 | 3, ReflectionEntry[]>([
    [1, []],
    [2, []],
    [3, []],
  ]);

  for (const entry of entries) {
    const t = entry.trimester;
    if (t === 1 || t === 2 || t === 3) {
      sectionMap.get(t)!.push(entry);
    }
  }

  return ([1, 2, 3] as const).map((trimester) => {
    const sectionEntries = sectionMap.get(trimester)!;
    const formatted = sectionEntries.map(formatEntryForExport);
    return {
      trimester,
      label: TRIMESTER_LABELS[trimester].label,
      description: TRIMESTER_LABELS[trimester].description,
      entries: formatted,
      milestones: formatted.filter((e) => e.milestoneTag !== null),
      keptClose: formatted.filter((e) => e.keptClose),
    };
  });
}

/**
 * Build the full memory book metadata structure.
 * This is the top-level object that a future PDF renderer would consume.
 *
 * @param userName  - The user's name from BloomContext
 * @param entries   - All reflections from the store
 */
export function buildMemoryBookMetadata(
  userName: string,
  entries: ReflectionEntry[]
): MemoryBookMetadata {
  if (entries.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      totalReflections: 0,
      weeksJourneyed: 0,
      firstEntryDate: null,
      lastEntryDate: null,
      sections: groupEntriesForMemoryBook([]),
    };
  }

  // Entries are stored newest-first
  const oldest = entries[entries.length - 1];
  const newest = entries[0];
  const weeks = new Set(entries.map((e) => e.pregnancyWeek));

  return {
    generatedAt: new Date().toISOString(),
    totalReflections: entries.length,
    weeksJourneyed: weeks.size,
    firstEntryDate: oldest.createdAt,
    lastEntryDate: newest.createdAt,
    sections: groupEntriesForMemoryBook(entries),
  };
}

/**
 * Format a single entry as a plain-text block for simple text export or sharing.
 * Suitable for clipboard, SMS, or a simple share sheet.
 */
export function formatEntryAsPlainText(entry: ReflectionEntry): string {
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const lines: string[] = [
    `${date} — Week ${entry.pregnancyWeek}`,
  ];

  if (entry.milestoneTag) {
    lines.push(`✦ ${entry.milestoneTag}`);
  }

  if (entry.userReflection) {
    lines.push(`"${entry.userReflection}"`);
  }

  lines.push(entry.bloomReply);

  return lines.join('\n');
}

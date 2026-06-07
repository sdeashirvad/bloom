export type ReflectionMood = 'calm' | 'tired' | 'emotional' | 'anxious' | 'happy';

/**
 * The phase of life this reflection belongs to.
 * 'pregnancy' is the current default.
 * 'postpartum' is reserved for future emotional continuity support.
 */
export type ReflectionPhase = 'pregnancy' | 'postpartum';

/**
 * Preset milestone tags a user can attach to a reflection.
 * These are personal, sentimental — not achievement-based.
 */
export const MILESTONE_TAGS = [
  'First kick',
  'Heartbeat heard',
  'Ultrasound day',
  'Nursery ready',
  'Name decided',
  'Emotional breakthrough',
  'Special day',
  'Doctor\'s visit',
] as const;

export type MilestoneTag = typeof MILESTONE_TAGS[number];

export type ReflectionEntry = {
  id: string;
  createdAt: string;
  pregnancyWeek: number;
  trimester: 1 | 2 | 3;
  mood: ReflectionMood;
  prompt?: string;
  userReflection?: string;
  bloomReply: string;

  /**
   * "Hold onto this" — user has quietly marked this moment as meaningful.
   * No counts. No collections. Just a gentle flag.
   */
  keptClose?: boolean;

  /**
   * Optional personal milestone tag (e.g. "First kick", "Heartbeat heard").
   * Reflective and sentimental, never achievement-based.
   */
  milestoneTag?: MilestoneTag;

  /**
   * Phase of life. Currently always 'pregnancy'.
   * Reserved for future postpartum emotional continuity support.
   */
  phase?: ReflectionPhase;
};

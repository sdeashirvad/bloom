export type ReflectionMood = 'calm' | 'tired' | 'emotional' | 'anxious' | 'happy';

export type ReflectionEntry = {
  id: string;
  createdAt: string;
  pregnancyWeek: number;
  trimester: 1 | 2 | 3;
  mood: ReflectionMood;
  prompt?: string;
  userReflection?: string;
  bloomReply: string;
};

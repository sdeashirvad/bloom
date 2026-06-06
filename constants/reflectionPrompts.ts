import { ReflectionMood } from '@/types/reflection';

const PROMPTS_BY_MOOD: Record<ReflectionMood, string[]> = {
  calm: [
    'What helped you feel grounded today?',
    'What brought you a sense of ease today?',
    'What does this stillness feel like in your body?',
    'Is there something you want to remember about today?',
  ],
  tired: [
    'What are you needing most right now?',
    'What has felt heavy today?',
    'What would feel like genuine rest for you?',
    'What can you put down, just for today?',
  ],
  emotional: [
    'What brought you comfort today?',
    'What feelings are moving through you right now?',
    'Is there something your heart is trying to say?',
    'What do you wish someone understood about how you feel?',
  ],
  anxious: [
    'What are you needing emotionally lately?',
    'What is one small thing that felt okay today?',
    'What would help you feel a little safer right now?',
    'What worry can you gently set aside, just for this moment?',
  ],
  happy: [
    'What made today feel good?',
    'What are you grateful for right now?',
    'What do you want to carry with you from today?',
    'What brought you the most joy today?',
  ],
};

const FALLBACK_PROMPTS = [
  'What are you feeling most right now?',
  'What brought you comfort today?',
  'What helped you feel grounded today?',
  'What do you want to remember about today?',
];

export function getReflectionPrompt(mood: ReflectionMood, seed: number): string {
  const pool = PROMPTS_BY_MOOD[mood] ?? FALLBACK_PROMPTS;
  return pool[seed % pool.length];
}

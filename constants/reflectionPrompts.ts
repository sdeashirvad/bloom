import { ReflectionMood } from '@/types/reflection';

const PROMPTS_BY_MOOD: Record<ReflectionMood, string[]> = {
  calm: [
    'What helped you feel grounded today?',
    'What brought you a sense of ease today?',
    'What does this stillness feel like in your body?',
    'Is there something you want to remember about today?',
    'When did you last feel truly unhurried?',
    'What are you noticing right now that you might usually overlook?',
    'What part of today felt like it was entirely yours?',
    'What would you say to yourself right now, from a place of warmth?',
  ],
  tired: [
    'What are you needing most right now?',
    'What has felt heavy today?',
    'What would feel like genuine rest for you?',
    'What can you put down, just for today?',
    'What did your body ask for today — and did you listen?',
    'Who or what has been carrying you lately?',
    'What is one thing you didn\'t have to do today, and didn\'t?',
    'What does rest look like for you, if you\'re honest with yourself?',
  ],
  emotional: [
    'What brought you comfort today?',
    'What feelings are moving through you right now?',
    'Is there something your heart is trying to say?',
    'What do you wish someone understood about how you feel?',
    'What felt unexpectedly difficult today?',
    'What are you carrying emotionally lately?',
    'What feeling has been visiting you most this week?',
    'If you could say one thing to yourself right now, what would it be?',
  ],
  anxious: [
    'What are you needing emotionally lately?',
    'What is one small thing that felt okay today?',
    'What would help you feel a little safer right now?',
    'What worry can you gently set aside, just for this moment?',
    'What is one thing that is within your reach today?',
    'What does your body feel like right now, in this moment?',
    'What would it feel like to soften around this feeling, just a little?',
    'What has been weighing on you — and how much of it is actually yours to carry?',
  ],
  happy: [
    'What made today feel good?',
    'What are you grateful for right now?',
    'What do you want to carry with you from today?',
    'What brought you the most joy today?',
    'What would you want to remember about this moment?',
    'Who or what made today feel lighter?',
    'What made you smile today, even quietly?',
    'What are you allowing yourself to feel good about?',
  ],
};

const FALLBACK_PROMPTS = [
  'What are you feeling most right now?',
  'What brought you comfort today?',
  'What helped you feel grounded today?',
  'What do you want to remember about today?',
  'What is here with you today?',
  'What feels true right now?',
];

export function getReflectionPrompt(mood: ReflectionMood, seed: number): string {
  const pool = PROMPTS_BY_MOOD[mood] ?? FALLBACK_PROMPTS;
  return pool[seed % pool.length];
}

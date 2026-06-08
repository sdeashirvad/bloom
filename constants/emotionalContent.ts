export type MoodKey = 'calm' | 'tired' | 'emotional' | 'anxious' | 'happy' | 'overwhelmed' | 'grateful';

export interface MoodResponse {
  title: string;
  message: string;
  color: string;
  gradient: readonly [string, string];
}

const MOOD_POOLS: Record<MoodKey, MoodResponse[]> = {
  calm: [
    {
      title: 'Something settled today.',
      message: 'Carry this calmness gently through your day. Your peace is a quiet gift to both you and your baby.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'This stillness is worth noticing.',
      message: 'In a season that can feel so overwhelming, calm is rare. Breathe it in. You\'ve earned this quiet.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'Your baby feels what you feel.',
      message: 'Your peacefulness matters. Right now, without doing anything at all, you\'re giving them something real.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'Let this feeling settle in.',
      message: 'Calmness during pregnancy is a quiet gift to your nervous system, your body, and your growing little one. Stay here as long as you like.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'Peace finds you today.',
      message: 'There\'s something worth savoring about feeling at ease. Notice it. Name it. Let it remind you what you\'re capable of.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'Stillness is its own kind of strength.',
      message: 'Not every moment of pregnancy needs to feel enormous. Some of the most meaningful ones are the gentle, ordinary ones — like this.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'Your whole body is a little quieter today.',
      message: 'When you feel calm, your cortisol lowers, your heart rate steadies, and your baby\'s world becomes more peaceful too.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
    {
      title: 'A soft day deserves a soft welcome.',
      message: 'Some days just flow easily. Today seems to be one of them. Let yourself receive it — without waiting for something to go wrong.',
      color: '#5A9E88',
      gradient: ['#E8F5F0', '#D5EDE6'],
    },
  ],
  tired: [
    {
      title: 'Rest is the work you can\'t see.',
      message: 'Your body is building a person. There is nothing passive about being this tired. Slow down and let yourself rest without guilt.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'Tired is not weakness. It\'s evidence.',
      message: 'Everything your body is doing right now — building organs, creating life — is genuinely exhausting. You\'re allowed to feel all of it.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'You don\'t have to do everything today.',
      message: 'The dishes can wait. The emails can wait. The most important thing right now is that you rest when your body asks you to.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'Your body is doing more than it looks like.',
      message: 'From the outside, you might look like you\'re resting. Inside, there\'s an entire universe being constructed. That takes everything.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'Slowness is allowed here.',
      message: 'Pregnancy doesn\'t ask you to perform. It asks you to surrender — to your body\'s pace, to rest, to the quiet rhythm of growing a life.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'Lie down. Really.',
      message: 'Put the phone away. Let your body do what it\'s asking. You\'re not behind. You\'re not weak. You\'re exactly where you\'re supposed to be.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'You don\'t have to keep moving to prove anything.',
      message: 'Your value right now isn\'t measured by how much you accomplish. It\'s measured by the extraordinary thing you\'re quietly doing.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
    {
      title: 'Let the world carry itself today.',
      message: 'Everything outside can wait. Your only job right now is to take care of yourself — because taking care of yourself is taking care of your baby.',
      color: '#9E8A78',
      gradient: ['#F5EDE5', '#EDE0D5'],
    },
  ],
  emotional: [
    {
      title: 'All of it is allowed.',
      message: 'Pregnancy opens you in ways you didn\'t expect. Let whatever you feel move through you. You are not too much.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'You can hold more than one feeling at once.',
      message: 'Joy and grief can exist in the same breath during pregnancy. You don\'t have to choose. Hold it all — it\'s yours.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'Your feelings are not a problem to fix.',
      message: 'They\'re signals. Information. Signs that you\'re deeply present in this experience. Let them come without needing to explain them.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'Tender isn\'t fragile.',
      message: 'The emotional openness of pregnancy is real. You\'re more perceptive, more present, more alive to what matters. That\'s not weakness — it\'s depth.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'Cry if you need to.',
      message: 'There\'s no performance required here. If you need to cry — please, cry. Let it move through you. The other side of it is usually a kind of relief.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'You\'re not the first to feel undone by this.',
      message: 'Countless women before you have felt exactly this — overwhelmed, cracked open by the magnitude of what\'s happening. You are in good company.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'The bigger the love, the bigger the feeling.',
      message: 'Your emotional depth right now is directly connected to how much you already care for your baby. The tenderness is the love.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
    {
      title: 'You don\'t have to understand it.',
      message: 'You don\'t have to explain it. You just have to be with it, gently — the way you\'d sit with a dear friend who couldn\'t find the words.',
      color: '#8A6AA8',
      gradient: ['#F0E8F8', '#E8D8F5'],
    },
  ],
  anxious: [
    {
      title: 'Right here, right now, you\'re okay.',
      message: 'Take one breath. Then another. Anxiety during pregnancy is so common and so human. You don\'t have to have everything figured out.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'This feeling will pass.',
      message: 'Anxiety feels permanent when it arrives. But it never is. It comes in waves, and you have ridden waves before. You\'ll ride this one too.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'Worry often means love.',
      message: 'The anxiety you feel about your pregnancy is, in many ways, the first expression of your love for your baby. It\'s uncomfortable, but it\'s real.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'You don\'t have to control everything.',
      message: 'Some things will unfold in their own time. Your job isn\'t to manage every outcome — it\'s to take the next small step as gently as you can.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'Breathe. Just breathe.',
      message: 'In through your nose for four counts. Hold for four. Out through your mouth for six. Your nervous system responds to breath. Let it respond now.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'Not everything needs an answer today.',
      message: 'You\'re allowed to sit with uncertainty. You\'re allowed to not know. Some of life\'s most tender moments live in the space between knowing and not knowing.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'You have a history of getting through things.',
      message: 'Whatever you\'re worried about — look back at what you\'ve already handled. That history doesn\'t disappear just because this feels big.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
    {
      title: 'Come back to this moment.',
      message: 'Most anxiety lives in the future. But right now, in this moment, you are okay. Your baby is okay. Come back here, to this breath.',
      color: '#6A88A8',
      gradient: ['#E8F0F8', '#D8E5F0'],
    },
  ],
  happy: [
    {
      title: 'Let yourself feel this fully.',
      message: 'Joy during pregnancy is a real and precious thing. Soak in this moment — you don\'t have to hold back or make it smaller than it is.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'Today feels lighter. Let it.',
      message: 'Not every moment of pregnancy is hard. Some are radiant. This is one of them. Stay here as long as you possibly can.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'Your joy is your baby\'s warmth.',
      message: 'When you feel this good, your baby feels it too. You\'re not just happy — you\'re giving happiness to someone who already loves you.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'You\'ve earned this lightness.',
      message: 'After the hard days, the tired days, the uncertain days — this is the reward. Receive it without guilt. Every bit of it is yours.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'Good days are allowed.',
      message: 'You don\'t have to feel guilty for feeling good. You don\'t owe the universe a difficult day. This happiness is real and it\'s yours.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'There is light in you today.',
      message: 'And it\'s real, and it\'s yours. Don\'t let anyone dim it — especially not yourself.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'Linger here.',
      message: 'The happy moments during pregnancy are worth savoring — the way you\'d linger over a warm cup of tea on a slow morning. Don\'t rush past this.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
    {
      title: 'Some days just feel like a gift.',
      message: 'Bright and full and easy. Today seems to be one of those. Receive it with open hands.',
      color: '#B89A30',
      gradient: ['#FBF5E0', '#F5ECC8'],
    },
  ],
  overwhelmed: [
    {
      title: 'One thing at a time.',
      message: 'You don\'t have to solve everything right now. Take one small step. Then another. That\'s the only way through — for anyone.',
      color: '#A87A6A',
      gradient: ['#F8EDE8', '#F0E0D8'],
    },
    {
      title: 'Pregnancy is a lot. That\'s just true.',
      message: 'Feeling overwhelmed doesn\'t mean you\'re failing. It means you\'re human, carrying something enormous, and doing it anyway.',
      color: '#A87A6A',
      gradient: ['#F8EDE8', '#F0E0D8'],
    },
    {
      title: 'You don\'t have to hold it all right now.',
      message: 'Set something down. Just for today. Not everything on your list needs to get done before your baby arrives. Some of it can simply wait.',
      color: '#A87A6A',
      gradient: ['#F8EDE8', '#F0E0D8'],
    },
  ],
  grateful: [
    {
      title: 'Gratitude and love feel the same, sometimes.',
      message: 'You\'re growing a life, and you feel grateful for it. Hold that feeling close — it will carry you through the harder days.',
      color: '#7A9E78',
      gradient: ['#EAF5E8', '#D8EDD5'],
    },
    {
      title: 'Gratitude is a quiet kind of strength.',
      message: 'Feeling thankful during pregnancy, even in its difficulty, says something true about who you already are.',
      color: '#7A9E78',
      gradient: ['#EAF5E8', '#D8EDD5'],
    },
    {
      title: 'Notice this.',
      message: 'The ability to feel grateful in the middle of something so hard and so tender is not a small thing. It\'s something you\'ve cultivated.',
      color: '#7A9E78',
      gradient: ['#EAF5E8', '#D8EDD5'],
    },
  ],
};

export function getMoodResponse(mood: MoodKey, week: number): MoodResponse {
  const pool = MOOD_POOLS[mood];
  if (!pool || pool.length === 0) return MOOD_POOLS.calm[0];
  const index = (week + new Date().getDay()) % pool.length;
  return pool[index];
}

export function getMoodResponseByIndex(mood: MoodKey, index: number): MoodResponse {
  const pool = MOOD_POOLS[mood];
  if (!pool || pool.length === 0) return MOOD_POOLS.calm[0];
  return pool[index % pool.length];
}

export const TRIMESTER_DATA = {
  1: {
    label: 'First Trimester',
    weeks: '1–12',
    tagline: 'The quiet beginning',
    description: 'Everything is forming in secret. Your body is doing profound, invisible work — and most people won\'t even know.',
    affirmation: 'The smallest beginnings hold the greatest potential.',
    gradientColors: ['#FDF6EE', '#F9EDE0'] as const,
  },
  2: {
    label: 'Second Trimester',
    weeks: '13–26',
    tagline: 'Coming alive',
    description: 'Your baby is growing fast, and so are you. This is often when things start to feel more real.',
    affirmation: 'You are halfway through something extraordinary.',
    gradientColors: ['#F5F0FA', '#EDE8F5'] as const,
  },
  3: {
    label: 'Third Trimester',
    weeks: '27–40',
    tagline: 'Almost there',
    description: 'The final stretch. Your baby is nearly ready. Your body knows what to do next — and so do you.',
    affirmation: 'Every day you carry them is an act of love.',
    gradientColors: ['#EEF5F0', '#E2EEE5'] as const,
  },
};

export function getTrimester(week: number): 1 | 2 | 3 {
  if (week <= 12) return 1;
  if (week <= 26) return 2;
  return 3;
}

export const HOME_AFFIRMATIONS = [
  'Right now, your body is doing something it has never done before.',
  'You don\'t have to understand it all. You just have to live it.',
  'You\'ve carried this far. That already proves something.',
  'Nobody is ever fully ready. And yet, here you are.',
  'Rest is not retreat. It\'s the work you can\'t see.',
  'The love you already feel — that\'s the real thing.',
  'Your baby already knows the sound of your heart.',
  'Even on ordinary days, something extraordinary is happening.',
  'Forty weeks is a long time to be so quietly brave.',
  'There\'s no version of this you\'re doing wrong.',
  'You don\'t have to hold it together to be a good mother.',
  'Your nervousness and your love are the same thing, wearing different faces.',
  'Some days the hardest thing is simply showing up. You did.',
  'Slow days count just as much as the big ones.',
  'You\'re building a person. That deserves gentleness — from everyone, including yourself.',
  'Not every feeling needs to be managed. Some just need to move through.',
  'The gentlest journeys often carry the most weight.',
  'Whatever you\'re feeling right now is allowed to be here.',
  'Your body is not behind. It is on its own wise timeline.',
  'Small moments of care add up to something enormous.',
  'You are allowed to take up space — physically, emotionally, all of it.',
  'This season asks a lot. So does asking for help.',
  'Your baby does not need a perfect mother. They need you.',
  'Some weeks feel invisible. They still count.',
  'Trust the quiet work happening beneath the surface.',
  'You can love this journey and find it hard at the same time.',
  'What feels ordinary to the world may be extraordinary to you.',
  'Your tenderness right now is not fragility — it is depth.',
  'There is no rush. Your story unfolds at its own pace.',
  'You have already given more than you realize.',
  'Let today be enough, even if it was not remarkable.',
  'Your presence is the first gift your baby receives.',
  'Healing, growing, and resting can all happen in the same day.',
  'You do not have to earn your right to be cared for.',
  'The bond you are building began long before you could feel it.',
  'Uncertainty is not a sign you are failing — it is part of the path.',
  'Your instincts are worth listening to, even when they whisper.',
  'This body of yours is doing something ancient and remarkable.',
  'You are not alone in the middle-of-the-night worries.',
  'Gentleness toward yourself is never wasted.',
  'Every week you carry them is a quiet act of devotion.',
  'You are becoming someone new — and that takes courage.',
  'What you need today is allowed to be different from yesterday.',
  'Your story does not have to look like anyone else\'s.',
  'There is room here for all of your feelings.',
];

const LATE_NIGHT_GREETINGS = [
  'In the quiet hours',
  'Awake in the stillness',
  'The night holds you gently',
  'Still here with you',
  'You\'re not alone tonight',
];

export function getDailyAffirmation(week: number, daysAlong: number = 0): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
  const seed = week * 7 + daysAlong + dayOfYear;
  return HOME_AFFIRMATIONS[seed % HOME_AFFIRMATIONS.length];
}

export const GREETING_BY_TIME = (): string => {
  const hour = new Date().getHours();

  // Midnight through 4am — warm, emotionally consistent (not "Good afternoon")
  if (hour >= 0 && hour < 5) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - startOfYear.getTime()) / 86_400_000);
    return LATE_NIGHT_GREETINGS[dayOfYear % LATE_NIGHT_GREETINGS.length];
  }

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  if (hour >= 21 && hour < 23) return 'Good evening';
  return 'Goodnight';
};

const MOOD_LABELS: Record<string, string> = {
  calm: 'calm',
  tired: 'tired',
  emotional: 'tender',
  anxious: 'unsettled',
  happy: 'joyful',
  overwhelmed: 'overwhelmed',
  grateful: 'grateful',
};

const YESTERDAY_MOOD_VARIANTS = [
  (word: string) => `Yesterday you felt ${word}.`,
  (word: string) => `You checked in as ${word} yesterday.`,
  (word: string) => `Yesterday was ${word}. You\'re still here.`,
];

const TOTAL_DAYS_VARIANTS = [
  (days: number) => `You\'ve carried this journey for ${days} days.`,
  (days: number) => `${days} days along now. Every single one.`,
  (days: number) => `${days} days of showing up. That counts for something.`,
];

export function getPersonalMemory(
  name: string,
  week: number,
  totalDays: number,
  lastMood?: string,
  lastMoodDate?: string,
): string | null {
  if (lastMood && lastMoodDate) {
    const lastDate = new Date(lastMoodDate);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (
      lastDate.toDateString() === yesterday.toDateString() &&
      lastDate.toDateString() !== today.toDateString()
    ) {
      const word = MOOD_LABELS[lastMood] || lastMood;
      const variant = YESTERDAY_MOOD_VARIANTS[week % YESTERDAY_MOOD_VARIANTS.length];
      return variant(word);
    }
  }

  if (week === 4) return 'Four weeks. The very start of everything.';
  if (week === 8) return 'Eight weeks. A tiny heartbeat, already beating.';
  if (week === 12) return 'You\'ve completed your first trimester. That\'s no small thing.';
  if (week === 13) return 'Second trimester begins. Often when things start to feel more real.';
  if (week === 16) return name ? `Four months in, ${name}.` : 'Four months in now.';
  if (week === 20) return name
    ? `Halfway there, ${name}. Stop and feel that for a moment.`
    : 'Halfway there. Stop and feel that for a moment.';
  if (week === 24) return 'Twenty-four weeks. A quiet milestone worth marking.';
  if (week === 28) return 'Third trimester. Your baby is putting on weight, getting ready.';
  if (week === 32) return 'Eight weeks to go. Your body knows what it\'s doing.';
  if (week === 36) return 'Full term is close now.';
  if (week >= 40) return name
    ? `${name}, your baby will be here so soon.`
    : 'Your baby will be here so soon.';

  if (totalDays > 84 && week % 4 === 0) {
    const variant = TOTAL_DAYS_VARIANTS[Math.floor(week / 4) % TOTAL_DAYS_VARIANTS.length];
    return variant(totalDays);
  }

  if (week > 4 && week % 3 === 0) {
    return name
      ? `Another week together, ${name}.`
      : 'Another quiet week.';
  }

  return null;
}

export const MOOD_CHECKIN_AFFIRMATIONS = [
  'However you feel right now, there\'s no wrong answer.',
  'This is a quiet moment to check in with yourself — nothing more.',
  'Whatever is here, it\'s allowed to be here.',
  'You don\'t need to perform anything. Your real feelings are enough.',
  'No judgment. No agenda. Just you, checking in.',
];

export function getDailyCheckinAffirmation(): string {
  return MOOD_CHECKIN_AFFIRMATIONS[new Date().getDay() % MOOD_CHECKIN_AFFIRMATIONS.length];
}

// ─── Companion notes (trimester-aware, shown on home screen) ──────────────────

const COMPANION_NOTES: Record<1 | 2 | 3, string[]> = {
  1: [
    'Your body is doing invisible, extraordinary work right now.',
    'The earliest weeks are often the quietest — and somehow the most profound.',
    'Fatigue in early pregnancy is your body asking for what it truly needs.',
    'Right now, something is growing that didn\'t exist before. That deserves to be witnessed.',
    'The first trimester can feel lonely when so much is kept close. You\'re not alone.',
    'Even when pregnancy is all you can think about, your pace can be different from the world\'s.',
    'Morning sickness, if you have it, is one of the most concrete signs of how hard your body is working.',
    'Every day of the first trimester is a quiet act of faith.',
  ],
  2: [
    'The second trimester often brings a return of energy — receive it gently.',
    'Your baby can now hear the rhythm of your heartbeat, always.',
    'Your experience of this pregnancy is yours to define, however you choose.',
    'Those first flutters of movement — when they come — are unlike anything else.',
    'You might feel closer to your baby this week than you expected. That\'s real.',
    'Your center of gravity is shifting. Be patient with your body as it adjusts.',
    'Halfway through is also halfway toward something remarkable.',
    'Your baby can now distinguish light from dark. They\'re already curious.',
    'Some weeks feel quieter than others. That\'s allowed too.',
    'The anatomy scan can bring a flood of feelings — every single one is valid.',
  ],
  3: [
    'The final stretch carries its own particular weight — and its own beauty.',
    'Your baby is putting on weight, gaining the softness you\'ll hold soon.',
    'Rest however you can, whenever you can. It counts.',
    'Your body is ancient wisdom in motion. It knows what it\'s doing.',
    'Every day now is a day closer to the one that changes everything.',
    'Your baby knows your voice. They\'ve been listening for weeks.',
    'This kind of waiting is unlike any other. It has its own strange, tender gravity.',
    'Nesting, resting, preparing — all of it is a form of love.',
    'You are further along than you think, and closer than it feels. Both are true.',
  ],
};

export function getCompanionNote(week: number): string {
  const trimester = getTrimester(week);
  const pool = COMPANION_NOTES[trimester];
  const seed = week + new Date().getDate() + new Date().getMonth() * 3;
  return pool[seed % pool.length];
}

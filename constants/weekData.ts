export interface WeekData {
  week: number;
  babySize: string;
  babySizeDetail: string;
  babyDevelopment: string;
  bodyChanges: string;
  selfCareTip: string;
  emotionalNote: string;
  dailyInsight: string;
}

export const WEEK_DATA: Record<number, WeekData> = {
  1: {
    week: 1,
    babySize: 'a poppy seed',
    babySizeDetail: 'Tiny beyond imagination — just beginning.',
    babyDevelopment: 'The very first cells are coming together, forming the foundation of a new life. It\'s the beginning of something extraordinary.',
    bodyChanges: 'Your body has begun preparing for this incredible journey. Hormonal shifts are quietly starting to make space for your growing baby.',
    selfCareTip: 'Begin taking a prenatal vitamin if you haven\'t already. Rest, hydrate, and honor whatever your body needs today.',
    emotionalNote: 'Every great journey begins with a single step. Yours has already begun.',
    dailyInsight: 'The most extraordinary things often start as the smallest seeds.',
  },
  4: {
    week: 4,
    babySize: 'a poppy seed',
    babySizeDetail: 'Tiny but mighty — already growing fast.',
    babyDevelopment: 'Your baby\'s neural tube — which will become the brain and spinal cord — is beginning to form. The heart cells have started beating for the very first time.',
    bodyChanges: 'You might notice tender breasts or a subtle fatigue as your body adjusts to rising pregnancy hormones. These are signs your body is working hard.',
    selfCareTip: 'Rest when you need to. Your body is doing extraordinary work beneath the surface.',
    emotionalNote: 'It\'s okay if this feels surreal. Big feelings — all of them — are welcome here.',
    dailyInsight: 'Something beautiful is growing in the quiet.',
  },
  8: {
    week: 8,
    babySize: 'a raspberry',
    babySizeDetail: 'Sweet, small, and growing every single day.',
    babyDevelopment: 'Tiny fingers and toes are forming. Your baby has a heartbeat that can now be seen on an ultrasound — a little flutter that changes everything.',
    bodyChanges: 'Morning sickness may be at its peak this week. Your uterus has doubled in size, and you may feel bloated or unusually tired.',
    selfCareTip: 'Eat small, frequent meals to ease nausea. Ginger tea and fresh air can be your best friends right now.',
    emotionalNote: 'Nausea, exhaustion, and all the discomfort — they are signs of something wonderful happening.',
    dailyInsight: 'Even when it\'s hard, you are doing exactly what you need to do.',
  },
  12: {
    week: 12,
    babySize: 'a lime',
    babySizeDetail: 'Bright, fresh, and perfectly formed.',
    babyDevelopment: 'Your baby\'s reflexes are developing — they can open and close their fingers. All vital organs are formed and functioning. This is a beautiful milestone.',
    bodyChanges: 'The first trimester is nearly complete. Many women find their energy starting to return. Your uterus is moving upward, out of the pelvis.',
    selfCareTip: 'This might be a lovely week to share your news with someone you trust, if you feel ready.',
    emotionalNote: 'You\'ve carried something precious and held it close. You\'re doing beautifully.',
    dailyInsight: 'The hardest part is often what builds the most strength.',
  },
  16: {
    week: 16,
    babySize: 'an avocado',
    babySizeDetail: 'Strong, nourishing, and full of goodness.',
    babyDevelopment: 'Your baby can now make facial expressions. Their eyes, though still sealed, are sensitive to light. They are beginning to hear your voice.',
    bodyChanges: 'Your belly is becoming visible. You may feel the first flutters of baby movement — like tiny bubbles or butterflies.',
    selfCareTip: 'Talk to your baby. Sing if it feels right. They are already listening to the warmth of your voice.',
    emotionalNote: 'Those first flutters of movement are unlike anything else in the world. Cherish them.',
    dailyInsight: 'Your voice is the first music your baby will ever know.',
  },
  18: {
    week: 18,
    babySize: 'a sweet potato',
    babySizeDetail: 'Warm, grounding, and full of life.',
    babyDevelopment: 'Your baby\'s nervous system is maturing rapidly. They are yawning, hiccupping, and swallowing. Their unique fingerprints are already forming.',
    bodyChanges: 'You may be feeling baby\'s kicks more consistently now. Your center of gravity is shifting — take your time and move gently through the world.',
    selfCareTip: 'A warm bath with lavender oil, a good book, or a slow walk in nature — gift yourself one gentle thing today.',
    emotionalNote: 'You deserve as much care as you give. Please remember to receive it too.',
    dailyInsight: 'Every kick is a little reminder that you are never alone.',
  },
  20: {
    week: 20,
    babySize: 'a banana',
    babySizeDetail: 'Half the journey — and what a journey it\'s been.',
    babyDevelopment: 'Your baby is now covered in vernix, a protective coating. Their senses — touch, taste, hearing — are all developing beautifully.',
    bodyChanges: 'This is the halfway milestone. Your uterus has reached your navel. The anatomy scan this week reveals so much — and seeing your baby in detail is a profound experience.',
    selfCareTip: 'Document this week in some small way. A photo, a journal entry, a voice memo. You\'ll want to remember how you felt right now.',
    emotionalNote: 'Halfway. You\'ve grown so much — in every sense of the word.',
    dailyInsight: 'The middle of the story is where character is built.',
  },
  24: {
    week: 24,
    babySize: 'an ear of corn',
    babySizeDetail: 'Golden and growing tall with purpose.',
    babyDevelopment: 'Your baby has reached a significant milestone — they are now considered viable. Their lungs are beginning to produce surfactant, preparing to breathe air.',
    bodyChanges: 'Braxton Hicks contractions may begin — gentle practice contractions. Your baby\'s movements are becoming stronger and more regular.',
    selfCareTip: 'Sleep on your left side if you can. It improves circulation for both you and your baby.',
    emotionalNote: 'Viability week. Let that sink in. You have brought life to a remarkable milestone.',
    dailyInsight: 'Every day you carry them is a gift given freely from love.',
  },
  28: {
    week: 28,
    babySize: 'an eggplant',
    babySizeDetail: 'Rich, beautiful, and wonderfully substantial.',
    babyDevelopment: 'Your baby can now blink their eyes and has developed REM sleep — they are dreaming. Their brain is developing more rapidly than ever.',
    bodyChanges: 'Welcome to the third trimester. Your body is working incredibly hard. You may notice heartburn, shortness of breath, or more frequent bathroom visits.',
    selfCareTip: 'Embrace slowness. You don\'t have to move quickly or do everything. Rest is productive too.',
    emotionalNote: 'Third trimester. The home stretch. You are nearly there.',
    dailyInsight: 'Slowing down is not falling behind — it is wisdom.',
  },
  32: {
    week: 32,
    babySize: 'a squash',
    babySizeDetail: 'Substantial, beautiful, and almost ready.',
    babyDevelopment: 'Your baby\'s bones are hardening, and they are gaining weight rapidly now. They can see light filtering through your belly and respond to familiar voices.',
    bodyChanges: 'You may feel pressure in your pelvis as baby descends. Swelling in your feet and ankles is normal. Fatigue may return as your body prepares.',
    selfCareTip: 'Start preparing your birth preferences and hospital bag, gently and without rush. Having things ready brings peace of mind.',
    emotionalNote: 'The anticipation is building. Allow yourself to feel both excited and nervous — both are signs of how much this matters.',
    dailyInsight: 'Preparation is an act of love for yourself and your baby.',
  },
  36: {
    week: 36,
    babySize: 'a honeydew melon',
    babySizeDetail: 'Full, sweet, and perfectly ripe.',
    babyDevelopment: 'Your baby is considered "early term" now. They are likely in a head-down position, preparing for birth. Their lungs are nearly fully mature.',
    bodyChanges: 'You may feel baby "drop" as they engage in your pelvis. Breathing may become easier even as walking becomes more challenging.',
    selfCareTip: 'Rest as much as you possibly can. Your body is storing energy for the remarkable work ahead.',
    emotionalNote: 'You are so close. Whatever you\'re feeling right now — all of it — is completely valid.',
    dailyInsight: 'The final stretch holds its own kind of beauty.',
  },
  40: {
    week: 40,
    babySize: 'a small pumpkin',
    babySizeDetail: 'Complete, beautiful, and perfectly ready.',
    babyDevelopment: 'Your baby is fully formed and ready to meet you. They have likely settled deep into your pelvis, and every system is prepared for life outside the womb.',
    bodyChanges: 'You are at your due date. Your body may show signs of labor — or you may wait a little longer. Both are completely normal.',
    selfCareTip: 'Trust your body. It knows what to do. Rest, breathe, and let the people who love you take care of you today.',
    emotionalNote: 'You did it. Whatever happens next, you have already done something extraordinary.',
    dailyInsight: 'You were made for this moment.',
  },
};

export function getWeekData(week: number): WeekData {
  const clampedWeek = Math.max(1, Math.min(42, week));
  
  if (WEEK_DATA[clampedWeek]) return WEEK_DATA[clampedWeek];
  
  const availableWeeks = Object.keys(WEEK_DATA).map(Number).sort((a, b) => a - b);
  const closest = availableWeeks.reduce((prev, curr) =>
    Math.abs(curr - clampedWeek) < Math.abs(prev - clampedWeek) ? curr : prev
  );
  
  const data = { ...WEEK_DATA[closest], week: clampedWeek };
  return data;
}

export const MOOD_RESPONSES: Record<string, { title: string; message: string; color: string }> = {
  calm: {
    title: 'What a beautiful feeling.',
    message: 'Carry this calmness gently through your day. Your peace is a gift to both you and your baby.',
    color: '#A8C4B8',
  },
  tired: {
    title: 'Rest is sacred right now.',
    message: 'Your body is growing a person. There is nothing lazy about being tired. Please, slow down and let yourself rest.',
    color: '#C4B8A8',
  },
  emotional: {
    title: 'Every feeling is valid.',
    message: 'Pregnancy opens you in ways you didn\'t expect. Let whatever you feel move through you. You are not too much.',
    color: '#C4A8C8',
  },
  anxious: {
    title: 'You are safe right now.',
    message: 'Take one breath. Then another. Anxiety during pregnancy is so common and so human. You don\'t have to have everything figured out.',
    color: '#A8B8C4',
  },
  happy: {
    title: 'Let yourself feel this fully.',
    message: 'Joy during pregnancy is a beautiful thing. Soak in this moment. You deserve to feel wonderful.',
    color: '#C4C4A8',
  },
};

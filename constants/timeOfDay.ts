export type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night';

export function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 13) return 'morning';
  if (h >= 13 && h < 18) return 'afternoon';
  if (h >= 18 && h < 21) return 'evening';
  return 'night';
}

export const TIME_GRADIENTS: Record<TimeOfDay, [string, string, string]> = {
  dawn:      ['#FDF2E8', '#FAE8D2', '#F6DFCA'],
  morning:   ['#FBF7F0', '#F7EEE4', '#F0E5D6'],
  afternoon: ['#F8F3EC', '#F3EBE0', '#EDE3D5'],
  evening:   ['#F5EFF6', '#EDE5F2', '#E6DBED'],
  night:     ['#F2EBF5', '#EAE0F0', '#E4D6EC'],
};

export const TIME_ORB_COLORS: Record<TimeOfDay, [string, string, string]> = {
  dawn:      ['#F5C4A0', '#F0C0D0', '#F0E4B8'],
  morning:   ['#F0C4A8', '#E0D0E8', '#D8ECD8'],
  afternoon: ['#ECC4A0', '#E8D8B8', '#DDE8C0'],
  evening:   ['#D8B8DC', '#C8B0D4', '#E0C4CC'],
  night:     ['#C8B4D8', '#B8B0D4', '#D4C4D4'],
};

export const TRIMESTER_HERO_GRADIENTS: Record<1 | 2 | 3, [string, string, string]> = {
  1: ['#D48870', '#C4785A', '#B86848'],
  2: ['#A880C8', '#9870B8', '#8860A8'],
  3: ['#78A888', '#689878', '#588868'],
};

export const TRIMESTER_HERO_SHADOW: Record<1 | 2 | 3, string> = {
  1: '#B06840',
  2: '#886090',
  3: '#486858',
};

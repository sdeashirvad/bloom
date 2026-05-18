export const Colors = {
  background: '#FBF7F0',
  backgroundWarm: '#F7F0E8',
  card: '#FFFFFF',
  cardWarm: '#FDF6EE',

  primary: '#D4876A',
  primaryLight: '#E8A88C',
  primarySoft: '#F5D5C3',

  peach: '#F0C4A8',
  peachLight: '#FAE8D8',

  lavender: '#C4A8C8',
  lavenderLight: '#E8DCF0',
  lavenderSoft: '#F3EDF8',

  blush: '#E8A4A4',
  blushLight: '#F5CECE',

  sage: '#A8C4A8',
  sageLight: '#D5E8D5',

  text: '#2D1F17',
  textWarm: '#4A3728',
  textMuted: '#8B7355',
  textSoft: '#B09A80',
  textLight: '#D4BFA5',

  border: '#EDE5D8',
  borderLight: '#F5EEE5',
  divider: '#EAE0D0',

  gradientStart: '#FBF7F0',
  gradientMid: '#F7EEE5',
  gradientEnd: '#F0E5D8',

  white: '#FFFFFF',
  offWhite: '#FDF9F5',

  radius: {
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    full: 999,
  },

  shadow: {
    color: '#3D2B1F',
    offset: { width: 0, height: 4 },
    opacity: 0.06,
    radius: 16,
    elevation: 4,
  },
};

export type ColorScheme = typeof Colors;

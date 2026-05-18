import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { TRIMESTER_DATA, getTrimester } from '@/constants/emotionalContent';

interface Props {
  week: number;
}

export function TrimesterBadge({ week }: Props) {
  const trimester = getTrimester(week);
  const data = TRIMESTER_DATA[trimester];

  const gradients: Record<1 | 2 | 3, readonly [string, string]> = {
    1: ['#FDF0E8', '#F8E5D5'],
    2: ['#F0EBF8', '#E8E0F5'],
    3: ['#E8F5EE', '#D8EEE2'],
  };

  const textColors: Record<1 | 2 | 3, string> = {
    1: '#A07050',
    2: '#7050A0',
    3: '#407050',
  };

  return (
    <LinearGradient
      colors={gradients[trimester]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badge}
    >
      <View style={[styles.dot, { backgroundColor: textColors[trimester] }]} />
      <Text style={[styles.label, { color: textColors[trimester] }]}>
        {data.label}
      </Text>
      <Text style={styles.divider}>·</Text>
      <Text style={[styles.tagline, { color: textColors[trimester] + 'AA' }]}>
        {data.tagline}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Colors.radius.full,
    gap: 6,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.3,
  },
  divider: {
    fontSize: 12,
    color: '#AAA',
  },
  tagline: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
});

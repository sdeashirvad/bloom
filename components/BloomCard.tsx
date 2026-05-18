import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'white' | 'warm' | 'peach' | 'lavender';
  padding?: number;
}

export function BloomCard({ children, style, variant = 'white', padding = 20 }: Props) {
  const cardColor = {
    white: Colors.card,
    warm: Colors.cardWarm,
    peach: Colors.peachLight,
    lavender: Colors.lavenderSoft,
  }[variant];

  return (
    <View style={[styles.card, { backgroundColor: cardColor, padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Colors.radius.lg,
    shadowColor: Colors.shadow.color,
    shadowOffset: Colors.shadow.offset,
    shadowOpacity: Colors.shadow.opacity,
    shadowRadius: Colors.shadow.radius,
    elevation: Colors.shadow.elevation,
  },
});

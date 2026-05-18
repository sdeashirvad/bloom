import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'peach' | 'lavender' | 'sage';
}

const gradients = {
  default: ['#FBF7F0', '#F5EDE0', '#F0E5D5'] as const,
  peach: ['#FDF3EE', '#F9E4D5', '#F5D5C0'] as const,
  lavender: ['#F5F0FA', '#EDE4F5', '#E3D5ED'] as const,
  sage: ['#F0F7F2', '#E4F0E8', '#D5E8DC'] as const,
};

export function GradientBackground({ children, style, variant = 'default' }: Props) {
  return (
    <LinearGradient
      colors={gradients[variant]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

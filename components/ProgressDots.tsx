import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors } from '@/constants/colors';

interface Props {
  total: number;
  current: number;
}

function Dot({ isActive }: { isActive: boolean }) {
  const animStyle = useAnimatedStyle(() => ({
    width: withSpring(isActive ? 24 : 8, { damping: 15 }),
    opacity: withSpring(isActive ? 1 : 0.35, { damping: 15 }),
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: isActive ? Colors.primary : Colors.primarySoft },
        animStyle,
      ]}
    />
  );
}

export function ProgressDots({ total, current }: Props) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, i) => (
        <Dot key={i} isActive={i === current} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

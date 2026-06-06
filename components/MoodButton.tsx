import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

interface Props {
  label: string;
  icon: string;
  isSelected: boolean;
  onPress: () => void;
  color: string;
  delay?: number;
}

export function MoodButton({ label, icon, isSelected, onPress, color, delay = 0 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const entranceSlide = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(entranceAnim, { toValue: 1, duration: 440, useNativeDriver: true }),
        Animated.spring(entranceSlide, { toValue: 0, damping: 22, stiffness: 88, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    Animated.timing(glowOpacity, {
      toValue: isSelected ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  function handlePress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.91,
        useNativeDriver: true,
        speed: 80,
        bounciness: 0,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 24,
        bounciness: 4,
      }),
    ]).start();
    onPress();
  }

  return (
    <Animated.View
      style={{
        opacity: entranceAnim,
        transform: [{ scale }, { translateY: entranceSlide }],
      }}
    >
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: color,
            opacity: glowOpacity,
          },
        ]}
      />

      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.button,
          {
            backgroundColor: isSelected ? color : Colors.card,
            borderColor: isSelected ? 'transparent' : Colors.border,
          },
        ]}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${label} — select mood`}
        accessibilityState={{ selected: isSelected }}
      >
        <View style={styles.inner}>
          <Text style={styles.icon}>{icon}</Text>
          <Text
            style={[
              styles.label,
              { color: isSelected ? '#FFFFFF' : Colors.textWarm },
            ]}
          >
            {label}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  glowRing: {
    position: 'absolute',
    inset: -4,
    borderRadius: Colors.radius.full + 4,
    borderWidth: 2,
    zIndex: -1,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: Colors.radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inner: {
    alignItems: 'center',
    gap: 5,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'Inter_600SemiBold',
  },
});

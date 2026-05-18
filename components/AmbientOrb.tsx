import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

interface AmbientOrbProps {
  size: number;
  color: string;
  opacity: number;
  style?: object;
  phaseSeed?: number;
}

export function AmbientOrb({
  size,
  color,
  opacity,
  style,
  phaseSeed = 0,
}: AmbientOrbProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const floatDuration = 7400 + phaseSeed * 2800;
    const pulseDuration = 5600 + phaseSeed * 2200;

    const floatDelay = phaseSeed * 3000;
    const pulseDelay = phaseSeed * 1800;

    const floatTimer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: floatDuration,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: floatDuration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, floatDelay);

    const pulseTimer = setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: pulseDuration,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, pulseDelay);

    return () => {
      clearTimeout(floatTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });
  const scale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity,
          position: 'absolute',
          transform: [{ translateY }, { scale }],
        },
        style,
      ]}
    />
  );
}

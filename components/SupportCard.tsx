import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

interface Props {
  title: string;
  message: string;
  color: string;
  gradient: readonly [string, string];
}

export function SupportCard({ title, message, color, gradient }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(24);
    scale.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        damping: 18,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 16,
        stiffness: 110,
        useNativeDriver: true,
      }),
    ]).start();
  }, [title]);

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity, transform: [{ translateY }, { scale }] },
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Color accent bar */}
        <View style={[styles.accentBar, { backgroundColor: color }]} />

        <View style={styles.content}>
          {/* Decorative quote mark */}
          <Text style={[styles.quoteDecor, { color: color + '30' }]}>"</Text>

          <Text style={[styles.title, { color: Colors.textWarm }]}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Decorative orb */}
        <View style={[styles.decorOrb, { backgroundColor: color + '18' }]} />
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 28,
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 5,
  },
  card: {
    borderRadius: Colors.radius.xl,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  accentBar: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 20,
    gap: 10,
  },
  quoteDecor: {
    fontSize: 72,
    lineHeight: 60,
    fontFamily: 'CormorantGaramond_700Bold',
    marginBottom: -10,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 26,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  message: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 24,
    fontFamily: 'Inter_400Regular',
  },
  decorOrb: {
    position: 'absolute',
    bottom: -28,
    right: -28,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
});

import React, { useRef, useEffect, memo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Colors } from '@/constants/colors';
import { ReflectionEntry, ReflectionMood } from '@/types/reflection';

const MOOD_META: Record<ReflectionMood, { icon: string; color: string; label: string }> = {
  calm:      { icon: '🌿', color: '#4A9078', label: 'Calm' },
  tired:     { icon: '🌙', color: '#8A7868', label: 'Tired' },
  emotional: { icon: '🌊', color: '#7858A0', label: 'Emotional' },
  anxious:   { icon: '🍃', color: '#5878A0', label: 'Anxious' },
  happy:     { icon: '☀️', color: '#A89028', label: 'Happy' },
};

interface JourneyCardProps {
  entry: ReflectionEntry;
  delay?: number;
}

function JourneyCard({ entry, delay = 0 }: JourneyCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 480,
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const mood = MOOD_META[entry.mood] ?? MOOD_META.calm;
  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.cardDecor} />

      <View style={styles.cardHeader}>
        <View style={[styles.moodPill, { backgroundColor: mood.color + '14' }]}>
          <Text style={styles.moodIcon}>{mood.icon}</Text>
          <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
        </View>
        <Text style={styles.metaText}>
          Week {entry.pregnancyWeek} · {dateLabel}
        </Text>
      </View>

      {entry.userReflection ? (
        <Text style={styles.reflectionText}>"{entry.userReflection}"</Text>
      ) : null}

      <View style={styles.bloomReply}>
        <View style={styles.bloomDot} />
        <Text style={styles.bloomReplyText}>{entry.bloomReply}</Text>
      </View>
    </Animated.View>
  );
}

export default memo(JourneyCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.xl,
    padding: 22,
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
    shadowRadius: 16,
    elevation: 3,
  },
  cardDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,136,112,0.04)',
    top: -40,
    right: -35,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 10,
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Colors.radius.full,
    flexShrink: 0,
  },
  moodIcon: {
    fontSize: 13,
  },
  moodLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
    flexShrink: 1,
    textAlign: 'right',
  },
  reflectionText: {
    fontSize: 18,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
    lineHeight: 27,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  bloomReply: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.borderLight,
    borderRadius: Colors.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bloomDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    opacity: 0.55,
    marginTop: 7,
    flexShrink: 0,
  },
  bloomReplyText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

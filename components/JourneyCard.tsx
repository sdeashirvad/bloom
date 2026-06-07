import React, { useRef, useEffect, memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/colors';
import { ReflectionEntry, ReflectionMood, MILESTONE_TAGS, MilestoneTag } from '@/types/reflection';

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
  onToggleKeptClose?: () => void;
  onSetMilestone?: (tag: MilestoneTag | null) => void;
  /** Dim the card slightly when shown in "Moments kept close" section (avoids visual competition) */
  variant?: 'default' | 'keptClose';
}

// ─── Milestone picker ─────────────────────────────────────────────────────────

function MilestonePicker({
  current,
  onSelect,
  onClose,
}: {
  current: MilestoneTag | undefined;
  onSelect: (tag: MilestoneTag | null) => void;
  onClose: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 24, stiffness: 88, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.picker, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <Text style={styles.pickerLabel}>Mark this moment</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pickerScroll}
      >
        {MILESTONE_TAGS.map((tag) => {
          const isActive = current === tag;
          return (
            <TouchableOpacity
              key={tag}
              style={[styles.pickerChip, isActive && styles.pickerChipActive]}
              onPress={() => {
                onSelect(isActive ? null : tag);
                onClose();
              }}
              activeOpacity={0.75}
            >
              <Text style={[styles.pickerChipText, isActive && styles.pickerChipTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

function JourneyCard({
  entry,
  delay = 0,
  onToggleKeptClose,
  onSetMilestone,
  variant = 'default',
}: JourneyCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;
  const keptScaleAnim = useRef(new Animated.Value(1)).current;

  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 480, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 480, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  function handleToggleKeptClose() {
    // Small celebratory pulse
    Animated.sequence([
      Animated.timing(keptScaleAnim, { toValue: 1.22, duration: 120, useNativeDriver: true }),
      Animated.spring(keptScaleAnim, { toValue: 1, damping: 20, stiffness: 260, useNativeDriver: true }),
    ]).start();
    onToggleKeptClose?.();
  }

  const mood = MOOD_META[entry.mood] ?? MOOD_META.calm;
  const date = new Date(entry.createdAt);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const isKeptClose = entry.keptClose === true;

  return (
    <Animated.View
      style={[
        styles.card,
        variant === 'keptClose' && styles.cardKeptClose,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.cardDecor} />

      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={[styles.moodPill, { backgroundColor: mood.color + '14' }]}>
          <Text style={styles.moodIcon}>{mood.icon}</Text>
          <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
        </View>
        <Text style={styles.metaText}>
          Week {entry.pregnancyWeek} · {dateLabel}
        </Text>
      </View>

      {/* Milestone tag */}
      {entry.milestoneTag ? (
        <View style={styles.milestoneTag}>
          <Text style={styles.milestoneTagMark}>✦</Text>
          <Text style={styles.milestoneTagText}>{entry.milestoneTag}</Text>
        </View>
      ) : null}

      {/* User reflection */}
      {entry.userReflection ? (
        <Text style={styles.reflectionText}>"{entry.userReflection}"</Text>
      ) : null}

      {/* Bloom reply */}
      <View style={styles.bloomReply}>
        <View style={styles.bloomDot} />
        <Text style={styles.bloomReplyText}>{entry.bloomReply}</Text>
      </View>

      {/* Milestone picker (inline, collapsible) */}
      {showPicker && onSetMilestone ? (
        <MilestonePicker
          current={entry.milestoneTag}
          onSelect={onSetMilestone}
          onClose={() => setShowPicker(false)}
        />
      ) : null}

      {/* Footer actions */}
      <View style={styles.cardFooter}>
        {/* "Hold onto this" toggle */}
        {onToggleKeptClose ? (
          <TouchableOpacity
            style={styles.footerAction}
            onPress={handleToggleKeptClose}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isKeptClose ? 'Release this moment' : 'Hold onto this moment'}
          >
            <Animated.Text
              style={[
                styles.footerActionIcon,
                isKeptClose && styles.footerActionIconActive,
                { transform: [{ scale: keptScaleAnim }] },
              ]}
            >
              {isKeptClose ? '❤' : '♡'}
            </Animated.Text>
            <Text style={[styles.footerActionText, isKeptClose && styles.footerActionTextActive]}>
              {isKeptClose ? 'Kept close' : 'Hold onto this'}
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Milestone toggle */}
        {onSetMilestone ? (
          <TouchableOpacity
            style={styles.footerAction}
            onPress={() => setShowPicker((v) => !v)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={entry.milestoneTag ? 'Change milestone tag' : 'Mark as a milestone'}
          >
            <Text
              style={[
                styles.footerActionIcon,
                entry.milestoneTag && styles.footerActionIconActive,
              ]}
            >
              ✦
            </Text>
            <Text
              style={[
                styles.footerActionText,
                entry.milestoneTag && styles.footerActionTextActive,
              ]}
            >
              {entry.milestoneTag ? entry.milestoneTag : 'Milestone'}
            </Text>
          </TouchableOpacity>
        ) : null}
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
  cardKeptClose: {
    backgroundColor: '#FDF6F0',
    borderWidth: 1,
    borderColor: 'rgba(212,136,106,0.12)',
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
  moodIcon: { fontSize: 13 },
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

  milestoneTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  milestoneTagMark: {
    fontSize: 10,
    color: Colors.primary,
    opacity: 0.7,
  },
  milestoneTagText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
    opacity: 0.85,
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
    marginBottom: 16,
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

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  footerActionIcon: {
    fontSize: 13,
    color: Colors.textLight,
  },
  footerActionIconActive: {
    color: Colors.primary,
  },
  footerActionText: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  footerActionTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
  },

  // Milestone picker
  picker: {
    backgroundColor: Colors.offWhite,
    borderRadius: Colors.radius.md,
    paddingVertical: 12,
    marginBottom: 12,
    marginTop: -4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pickerLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    paddingHorizontal: 14,
  },
  pickerScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  pickerChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Colors.radius.full,
    backgroundColor: Colors.borderLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerChipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary + '30',
  },
  pickerChipText: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
  },
  pickerChipTextActive: {
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
  },
});

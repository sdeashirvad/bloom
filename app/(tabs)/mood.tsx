import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { MoodButton } from '@/components/MoodButton';
import { SupportCard } from '@/components/SupportCard';
import { AmbientOrb } from '@/components/AmbientOrb';
import { useBloom } from '@/context/BloomContext';
import { getMoodResponse, MoodKey, getDailyCheckinAffirmation } from '@/constants/emotionalContent';
import { getTimeOfDay, TIME_GRADIENTS, TIME_ORB_COLORS } from '@/constants/timeOfDay';

const MOODS: { key: MoodKey; label: string; icon: string; color: string; subtext: string }[] = [
  { key: 'calm', label: 'Calm', icon: '🌿', color: '#4A9078', subtext: 'At peace' },
  { key: 'tired', label: 'Tired', icon: '🌙', color: '#8A7868', subtext: 'Need rest' },
  { key: 'emotional', label: 'Emotional', icon: '🌊', color: '#7858A0', subtext: 'Feeling deep' },
  { key: 'anxious', label: 'Anxious', icon: '🍃', color: '#5878A0', subtext: 'Unsettled' },
  { key: 'happy', label: 'Happy', icon: '☀️', color: '#A89028', subtext: 'Feeling good' },
];

const MOOD_LABELS: Record<string, string> = {
  calm: 'calm',
  tired: 'tired',
  emotional: 'tender',
  anxious: 'unsettled',
  happy: 'joyful',
  overwhelmed: 'overwhelmed',
  grateful: 'grateful',
};

function getLastMoodMemory(lastMood: string, lastMoodDate: string): string | null {
  const lastDate = new Date(lastMoodDate);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = lastDate.toDateString() === today.toDateString();
  if (isToday) return null;

  const isYesterday = lastDate.toDateString() === yesterday.toDateString();
  const word = MOOD_LABELS[lastMood] || lastMood;

  if (isYesterday) return `Yesterday you were ${word}.`;

  const diffMs = today.getTime() - lastDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 6) return `${diffDays} days ago you were ${word}.`;

  return null;
}

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { user, pregnancyWeek, updateUser } = useBloom();
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(
    (user.lastMood as MoodKey) || null
  );
  const [responseKey, setResponseKey] = useState(0);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 680, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, damping: 22, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  function handleMoodSelect(moodKey: MoodKey) {
    const isNew = moodKey !== selectedMood;
    setSelectedMood(moodKey);
    if (isNew) setResponseKey((k) => k + 1);
    updateUser({ lastMood: moodKey, lastMoodDate: new Date().toISOString() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function handleReset() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(null);
  }

  const week = pregnancyWeek || 18;
  const moodResponse = selectedMood ? getMoodResponse(selectedMood, week + responseKey) : null;

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  const lastMoodMemory =
    user.lastMood && user.lastMoodDate && !selectedMood
      ? getLastMoodMemory(user.lastMood, user.lastMoodDate)
      : null;

  const nameGreeting = user.name ? `${user.name}, how are you today?` : 'How are you today?';
  const checkinAffirmation = getDailyCheckinAffirmation();

  const timeOfDay = getTimeOfDay();
  const bgGradient = TIME_GRADIENTS[timeOfDay];
  const orbColors = TIME_ORB_COLORS[timeOfDay];

  return (
    <LinearGradient
      colors={[bgGradient[0], bgGradient[1], bgGradient[2]]}
      style={styles.container}
    >
      <AmbientOrb
        size={230}
        color={orbColors[0]}
        opacity={0.22}
        phaseSeed={0.2}
        style={{ top: -90, right: -70 }}
      />
      <AmbientOrb
        size={160}
        color={orbColors[1]}
        opacity={0.16}
        phaseSeed={0.6}
        style={{ bottom: 180, left: -55 }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 28, paddingBottom: bottomPad + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
          <Text style={styles.eyebrow}>Daily check-in</Text>
          <Text style={styles.pageTitle}>How are you{'\n'}feeling?</Text>
          <Text style={styles.subtitle}>{nameGreeting}</Text>
        </Animated.View>

        {/* Last mood memory — above grid, only when not yet selected today */}
        {lastMoodMemory ? (
          <Animated.View style={{ opacity: headerFade }}>
            <View style={styles.memoryPill}>
              <View style={styles.memoryPillDot} />
              <Text style={styles.memoryPillText}>{lastMoodMemory} How are you today?</Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Mood grid */}
        <View style={styles.moodGrid}>
          {MOODS.map((mood, i) => (
            <MoodButton
              key={mood.key}
              label={mood.label}
              icon={mood.icon}
              isSelected={selectedMood === mood.key}
              onPress={() => handleMoodSelect(mood.key)}
              color={mood.color}
              delay={i * 55 + 200}
            />
          ))}
        </View>

        {/* Response card */}
        {moodResponse ? (
          <SupportCard
            key={`${selectedMood}-${responseKey}`}
            title={moodResponse.title}
            message={moodResponse.message}
            color={moodResponse.color}
            gradient={moodResponse.gradient}
          />
        ) : null}

        {/* Reset */}
        {selectedMood ? (
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn} activeOpacity={0.7}>
            <Ionicons name="refresh-outline" size={15} color={Colors.textSoft} />
            <Text style={styles.resetText}>Check in again</Text>
          </TouchableOpacity>
        ) : null}

        {/* Pre-selection affirmation — when nothing selected */}
        {!selectedMood ? (
          <Animated.View style={{ opacity: headerFade }}>
            <LinearGradient
              colors={['#FDF0EA', '#F9E6D8']}
              style={styles.affirmationCard}
            >
              <View style={styles.affirmationDecor} />
              <Text style={styles.affirmationText}>"{checkinAffirmation}"</Text>
            </LinearGradient>
          </Animated.View>
        ) : null}

        {/* Last check-in stamp */}
        {user.lastMood && user.lastMoodDate && !lastMoodMemory ? (
          <View style={styles.historyRow}>
            <View style={styles.historyPill}>
              <Ionicons name="time-outline" size={13} color={Colors.textSoft} />
              <Text style={styles.historyText}>
                Last check-in ·{' '}
                {new Date(user.lastMoodDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 22 },

  eyebrow: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  pageTitle: {
    fontSize: 44,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 52,
    letterSpacing: -1,
    marginBottom: 10,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    lineHeight: 24,
    marginBottom: 28,
    fontFamily: 'Inter_400Regular',
  },

  memoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: Colors.radius.full,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  memoryPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    opacity: 0.5,
    flexShrink: 0,
  },
  memoryPillText: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },

  affirmationCard: {
    borderRadius: Colors.radius.xl,
    padding: 28,
    marginTop: 28,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  affirmationDecor: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,136,112,0.07)',
  },
  affirmationText: {
    fontSize: 20,
    color: Colors.textWarm,
    lineHeight: 32,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
    letterSpacing: -0.2,
  },

  historyRow: {
    alignItems: 'center',
    marginTop: 28,
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.borderLight,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Colors.radius.full,
  },
  historyText: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
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
import {
  getMoodResponse,
  MoodKey,
  getDailyCheckinAffirmation,
  getTrimester,
} from '@/constants/emotionalContent';
import { getTimeOfDay, TIME_GRADIENTS, TIME_ORB_COLORS } from '@/constants/timeOfDay';
import { getReflectionPrompt } from '@/constants/reflectionPrompts';
import { addReflection, getTodaysReflection } from '@/stores/reflectionStore';
import { ReflectionEntry, ReflectionMood } from '@/types/reflection';

// Only moods that are part of ReflectionMood
const MOODS: { key: ReflectionMood; label: string; icon: string; color: string; subtext: string }[] = [
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
};

type FlowStep = 'select' | 'prompt' | 'response';

function getLastMoodMemory(lastMood: string, lastMoodDate: string): string | null {
  const lastDate = new Date(lastMoodDate);
  const today = new Date();
  const isToday = lastDate.toDateString() === today.toDateString();
  if (isToday) return null;

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = lastDate.toDateString() === yesterday.toDateString();
  const word = MOOD_LABELS[lastMood] || lastMood;

  if (isYesterday) return `Yesterday you were ${word}.`;
  const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 6) return `${diffDays} days ago you were ${word}.`;
  return null;
}

// ─── Step 1: Mood selection ───────────────────────────────────────────────────

function MoodSelectStep({
  onSelect,
  lastMood,
  lastMoodDate,
  checkinAffirmation,
  nameGreeting,
  headerFade,
  headerSlide,
}: {
  onSelect: (mood: ReflectionMood) => void;
  lastMood?: string;
  lastMoodDate?: string;
  checkinAffirmation: string;
  nameGreeting: string;
  headerFade: Animated.Value;
  headerSlide: Animated.Value;
}) {
  const lastMoodMemory =
    lastMood && lastMoodDate ? getLastMoodMemory(lastMood, lastMoodDate) : null;

  return (
    <>
      <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
        <Text style={styles.eyebrow}>Daily reflection</Text>
        <Text style={styles.pageTitle}>How are you{'\n'}feeling?</Text>
        <Text style={styles.subtitle}>{nameGreeting}</Text>
      </Animated.View>

      {lastMoodMemory ? (
        <Animated.View style={{ opacity: headerFade }}>
          <View style={styles.memoryPill}>
            <View style={styles.memoryPillDot} />
            <Text style={styles.memoryPillText}>{lastMoodMemory} How are you today?</Text>
          </View>
        </Animated.View>
      ) : null}

      <View style={styles.moodGrid}>
        {MOODS.map((mood, i) => (
          <MoodButton
            key={mood.key}
            label={mood.label}
            icon={mood.icon}
            isSelected={false}
            onPress={() => onSelect(mood.key)}
            color={mood.color}
            delay={i * 55 + 200}
          />
        ))}
      </View>

      <Animated.View style={{ opacity: headerFade }}>
        <LinearGradient colors={['#FDF0EA', '#F9E6D8']} style={styles.affirmationCard}>
          <View style={styles.affirmationDecor} />
          <Text style={styles.affirmationText}>"{checkinAffirmation}"</Text>
        </LinearGradient>
      </Animated.View>
    </>
  );
}

// ─── Step 2 + 3: Prompt + optional text input ─────────────────────────────────

function ReflectionPromptStep({
  mood,
  prompt,
  reflectionText,
  setReflectionText,
  onSave,
  onSkip,
  isSaving,
}: {
  mood: ReflectionMood;
  prompt: string;
  reflectionText: string;
  setReflectionText: (v: string) => void;
  onSave: () => void;
  onSkip: () => void;
  isSaving: boolean;
}) {
  const moodData = MOODS.find((m) => m.key === mood)!;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 22, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {/* Mood echo pill */}
      <View style={[styles.moodEchoPill, { backgroundColor: moodData.color + '18' }]}>
        <Text style={styles.moodEchoIcon}>{moodData.icon}</Text>
        <Text style={[styles.moodEchoLabel, { color: moodData.color }]}>
          Feeling {moodData.label.toLowerCase()}
        </Text>
      </View>

      {/* Prompt */}
      <Text style={styles.promptTitle}>{prompt}</Text>
      <Text style={styles.promptSubtitle}>
        Write a few words, if you'd like. There's no pressure here.
      </Text>

      {/* Optional text input */}
      <TextInput
        style={styles.reflectionInput}
        placeholder="Whatever is here is welcome..."
        placeholderTextColor={Colors.textLight}
        value={reflectionText}
        onChangeText={setReflectionText}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        returnKeyType="default"
      />

      {/* Save */}
      <TouchableOpacity
        style={[styles.primaryButton, isSaving && styles.primaryButtonDisabled]}
        onPress={onSave}
        activeOpacity={0.85}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel={reflectionText.trim() ? 'Save reflection' : 'Continue without writing'}
        accessibilityState={{ disabled: isSaving }}
      >
        <Text style={styles.primaryButtonText}>
          {reflectionText.trim() ? 'Save reflection' : 'Continue'}
        </Text>
      </TouchableOpacity>

      {/* Skip */}
      <TouchableOpacity
        style={styles.skipBtn}
        onPress={onSkip}
        activeOpacity={0.7}
        disabled={isSaving}
        accessibilityRole="button"
        accessibilityLabel="Skip for today"
        accessibilityState={{ disabled: isSaving }}
      >
        <Text style={styles.skipText}>Skip for today</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Step 4: Bloom response card + history stamp ──────────────────────────────

function ReflectionResponseStep({
  mood,
  bloomReply,
  bloomReplyColor,
  bloomReplyGradient,
  savedAt,
  onReset,
}: {
  mood: ReflectionMood;
  bloomReply: string;
  bloomReplyColor: string;
  bloomReplyGradient: readonly [string, string];
  savedAt: string;
  onReset: () => void;
}) {
  return (
    <>
      <SupportCard
        title="A moment held."
        message={bloomReply}
        color={bloomReplyColor}
        gradient={bloomReplyGradient}
      />

      <View style={styles.historyRow}>
        <View style={styles.historyPill}>
          <Ionicons name="time-outline" size={13} color={Colors.textSoft} />
          <Text style={styles.historyText}>
            Reflected ·{' '}
            {new Date(savedAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onReset}
        style={styles.resetBtn}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Reflect again"
      >
        <Ionicons name="refresh-outline" size={15} color={Colors.textSoft} />
        <Text style={styles.resetText}>Reflect again</Text>
      </TouchableOpacity>
    </>
  );
}

// ─── Main mood screen ─────────────────────────────────────────────────────────

export default function MoodScreen() {
  const insets = useSafeAreaInsets();
  const { user, pregnancyWeek, updateUser } = useBloom();

  const [flowStep, setFlowStep] = useState<FlowStep>('select');
  const [selectedMood, setSelectedMood] = useState<ReflectionMood | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [savedEntry, setSavedEntry] = useState<ReflectionEntry | null>(null);
  const [promptSeed] = useState(() => new Date().getDate() + new Date().getMonth());
  const [checkedTodayEntry, setCheckedTodayEntry] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 680, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, damping: 22, stiffness: 100, useNativeDriver: true }),
    ]).start();

    // Restore today's reflection if it exists
    getTodaysReflection().then((entry) => {
      if (entry) {
        setSavedEntry(entry);
        setSelectedMood(entry.mood);
        setFlowStep('response');
      }
      setCheckedTodayEntry(true);
    });
  }, []);

  const week = pregnancyWeek || 18;
  const trimester = getTrimester(week);
  const nameGreeting = user.name ? `${user.name}, how are you today?` : 'How are you today?';
  const checkinAffirmation = getDailyCheckinAffirmation();

  const timeOfDay = getTimeOfDay();
  const bgGradient = TIME_GRADIENTS[timeOfDay];
  const orbColors = TIME_ORB_COLORS[timeOfDay];

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  function handleMoodSelect(mood: ReflectionMood) {
    setSelectedMood(mood);
    setReflectionText('');
    setFlowStep('prompt');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleSave() {
    if (!selectedMood || isSaving) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const moodResponse = getMoodResponse(selectedMood as MoodKey, week + promptSeed);
    const entry: ReflectionEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      pregnancyWeek: week,
      trimester,
      mood: selectedMood,
      prompt: getReflectionPrompt(selectedMood, promptSeed),
      userReflection: reflectionText.trim() || undefined,
      bloomReply: moodResponse.message,
    };

    await addReflection(entry);
    await updateUser({
      lastMood: selectedMood,
      lastMoodDate: new Date().toISOString(),
    });

    setSavedEntry(entry);
    setFlowStep('response');
    setIsSaving(false);
  }

  async function handleSkip() {
    if (!selectedMood || isSaving) return;
    setIsSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const moodResponse = getMoodResponse(selectedMood as MoodKey, week + promptSeed);
    const entry: ReflectionEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      pregnancyWeek: week,
      trimester,
      mood: selectedMood,
      bloomReply: moodResponse.message,
    };

    await addReflection(entry);
    await updateUser({
      lastMood: selectedMood,
      lastMoodDate: new Date().toISOString(),
    });

    setSavedEntry(entry);
    setFlowStep('response');
    setIsSaving(false);
  }

  function handleReset() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(null);
    setReflectionText('');
    setSavedEntry(null);
    setFlowStep('select');
  }

  // Derive bloom response details for the response step
  const bloomMoodResponse =
    selectedMood && savedEntry
      ? getMoodResponse(selectedMood as MoodKey, week + promptSeed)
      : null;

  const currentPrompt =
    selectedMood ? getReflectionPrompt(selectedMood, promptSeed) : '';

  if (!checkedTodayEntry) return null;

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

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 28, paddingBottom: bottomPad + 110 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {flowStep === 'select' && (
            <MoodSelectStep
              onSelect={handleMoodSelect}
              lastMood={user.lastMood}
              lastMoodDate={user.lastMoodDate}
              checkinAffirmation={checkinAffirmation}
              nameGreeting={nameGreeting}
              headerFade={headerFade}
              headerSlide={headerSlide}
            />
          )}

          {flowStep === 'prompt' && selectedMood && (
            <ReflectionPromptStep
              mood={selectedMood}
              prompt={currentPrompt}
              reflectionText={reflectionText}
              setReflectionText={setReflectionText}
              onSave={handleSave}
              onSkip={handleSkip}
              isSaving={isSaving}
            />
          )}

          {flowStep === 'response' && savedEntry && bloomMoodResponse && (
            <ReflectionResponseStep
              mood={savedEntry.mood}
              bloomReply={savedEntry.bloomReply}
              bloomReplyColor={bloomMoodResponse.color}
              bloomReplyGradient={bloomMoodResponse.gradient}
              savedAt={savedEntry.createdAt}
              onReset={handleReset}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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

  // Reflection prompt step
  moodEchoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Colors.radius.full,
    marginBottom: 28,
  },
  moodEchoIcon: { fontSize: 16 },
  moodEchoLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
  },
  promptTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 40,
    letterSpacing: -0.6,
    marginBottom: 10,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  promptSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 24,
    marginBottom: 28,
    fontFamily: 'Inter_400Regular',
  },
  reflectionInput: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
    minHeight: 120,
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Colors.radius.full,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
    marginTop: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.peach,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'Inter_600SemiBold',
  },

  skipBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 4,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },

  // Response step
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

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 12,
  },
  resetText: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },
});

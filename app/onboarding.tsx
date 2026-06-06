import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { ProgressDots } from '@/components/ProgressDots';
import { BabyIllustration } from '@/components/BabyIllustration';
import { useBloom } from '@/context/BloomContext';
import { validateLMPDate, parseLMPFields } from '@/utils/pregnancyValidation';

// Steps: 0,1,2 = story  |  3,4,5 = data  |  6 = bloom completion
const DATA_STEPS = 3;

// ─── Decorative bloom shape ──────────────────────────────────────────────────

function BloomDecor({
  colors,
  size = 180,
}: {
  colors: [string, string, string];
  size?: number;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 3800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 3800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors[0],
          opacity: 0.18,
          transform: [{ scale: pulseAnim }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.72,
          height: size * 0.72,
          borderRadius: (size * 0.72) / 2,
          backgroundColor: colors[1],
          opacity: 0.25,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: (size * 0.42) / 2,
          backgroundColor: colors[2],
          opacity: 0.35,
        }}
      />
    </View>
  );
}

// ─── Story step ───────────────────────────────────────────────────────────────

interface StoryStepProps {
  decorColors: [string, string, string];
  eyebrow?: string;
  title: string;
  body?: string;
  privacyPoints?: string[];
  ctaLabel: string;
  onNext: () => void;
}

function StoryStep({
  decorColors,
  eyebrow,
  title,
  body,
  privacyPoints,
  ctaLabel,
  onNext,
}: StoryStepProps) {
  return (
    <View style={styles.storyContainer}>
      <View style={styles.decorRow}>
        <BloomDecor colors={decorColors} size={170} />
      </View>

      <View style={styles.storyContent}>
        {eyebrow ? <Text style={styles.storyEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.storyTitle}>{title}</Text>
        {body ? <Text style={styles.storyBody}>{body}</Text> : null}

        {privacyPoints ? (
          <View style={styles.privacyPoints}>
            {privacyPoints.map((point, i) => (
              <View key={i} style={styles.privacyRow}>
                <View style={styles.privacyDot} />
                <Text style={styles.privacyText}>{point}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onNext} activeOpacity={0.85}>
        <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Data steps ───────────────────────────────────────────────────────────────

function NameStep({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateUser } = useBloom();

  async function handleNext() {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateUser({ name: name.trim() });
    onNext();
    setIsSubmitting(false);
  }

  return (
    <View style={styles.dataContainer}>
      <Text style={styles.dataEyebrow}>Let's start gently.</Text>
      <Text style={styles.dataTitle}>What shall we{'\n'}call you?</Text>
      <Text style={styles.dataBody}>
        This is your space. We just want to know how to greet you.
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder="Your name..."
        placeholderTextColor={Colors.textLight}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleNext}
      />
      <TouchableOpacity
        style={[styles.primaryButton, (!name.trim() || isSubmitting) && styles.primaryButtonDisabled]}
        onPress={handleNext}
        activeOpacity={0.85}
        disabled={!name.trim() || isSubmitting}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function LMPStep({ onNext }: { onNext: () => void }) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);
  const { user, updateUser } = useBloom();

  const fieldsComplete = day.length >= 1 && month.length >= 1 && year.length === 4;

  const parsedDate = fieldsComplete ? parseLMPFields(day, month, year) : null;
  const validation = parsedDate ? validateLMPDate(parsedDate) : null;

  const isBlocked = !fieldsComplete || !parsedDate || (validation?.blocking === true);
  const canContinue = !isBlocked && !isSubmitting;

  const helperText = validation?.warning ?? null;
  const helperIsWarning = validation?.blocking === true;

  async function handleNext() {
    if (!canContinue || !parsedDate) return;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const d = parsedDate.getDate().toString().padStart(2, '0');
    const m = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const y = parsedDate.getFullYear().toString();
    await updateUser({ lmp: `${y}-${m}-${d}` });
    onNext();
    setIsSubmitting(false);
  }

  return (
    <View style={styles.dataContainer}>
      <Text style={styles.dataEyebrow}>You're doing beautifully already.</Text>
      <Text style={styles.dataTitle}>
        {user.name ? `${user.name}, when did your` : 'When did your'}{'\n'}last period begin?
      </Text>
      <Text style={styles.dataBody}>
        This helps us understand where you are in your pregnancy and offer the right support each week.
      </Text>
      <View style={styles.dateRow}>
        <View style={[styles.dateInputWrap, { flex: 0.8 }]}>
          <Text style={styles.dateLabel}>Day</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="DD"
            placeholderTextColor={Colors.textLight}
            value={day}
            onChangeText={(v) => {
              setDay(v.replace(/\D/g, ''));
              if (v.replace(/\D/g, '').length >= 2) monthRef.current?.focus();
            }}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <View style={[styles.dateInputWrap, { flex: 0.8 }]}>
          <Text style={styles.dateLabel}>Month</Text>
          <TextInput
            ref={monthRef}
            style={styles.dateInput}
            placeholder="MM"
            placeholderTextColor={Colors.textLight}
            value={month}
            onChangeText={(v) => {
              setMonth(v.replace(/\D/g, ''));
              if (v.replace(/\D/g, '').length >= 2) yearRef.current?.focus();
            }}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <View style={[styles.dateInputWrap, { flex: 1.4 }]}>
          <Text style={styles.dateLabel}>Year</Text>
          <TextInput
            ref={yearRef}
            style={styles.dateInput}
            placeholder="YYYY"
            placeholderTextColor={Colors.textLight}
            value={year}
            onChangeText={(v) => setYear(v.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={4}
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
        </View>
      </View>

      {/* Soft helper text — warm, non-judgmental */}
      {helperText ? (
        <View style={[styles.helperRow, helperIsWarning && styles.helperRowBlocking]}>
          <View style={[styles.helperDot, helperIsWarning && styles.helperDotBlocking]} />
          <Text style={[styles.helperText, helperIsWarning && styles.helperTextBlocking]}>
            {helperText}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
        onPress={handleNext}
        activeOpacity={0.85}
        disabled={!canContinue}
      >
        <Text style={styles.primaryButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

function FirstPregnancyStep({ onComplete }: { onComplete: (value: boolean) => void }) {
  const { user } = useBloom();
  const [selected, setSelected] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSelect(value: boolean) {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSelected(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await new Promise((r) => setTimeout(r, 350));
    onComplete(value);
  }

  return (
    <View style={styles.dataContainer}>
      <Text style={styles.dataEyebrow}>Almost there.</Text>
      <Text style={styles.dataTitle}>
        {user.name ? `${user.name}, is this` : 'Is this'}{'\n'}your first pregnancy?
      </Text>
      <Text style={styles.dataBody}>
        There's no right answer — every pregnancy is its own journey, first or not.
      </Text>
      <View style={styles.choiceRow}>
        <TouchableOpacity
          style={[styles.choiceButton, selected === true && styles.choiceButtonSelected]}
          onPress={() => handleSelect(true)}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Text style={[styles.choiceText, selected === true && styles.choiceTextSelected]}>
            Yes, it is
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.choiceButton, selected === false && styles.choiceButtonSelected]}
          onPress={() => handleSelect(false)}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Text style={[styles.choiceText, selected === false && styles.choiceTextSelected]}>
            I've been here before
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Bloom completion ─────────────────────────────────────────────────────────

function BloomCompletionStep({
  name,
  firstPreg,
}: {
  name: string;
  firstPreg: boolean;
}) {
  const { completeOnboarding } = useBloom();
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;
  const illustScale = useRef(new Animated.Value(0.2)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(24)).current;
  const btnFade = useRef(new Animated.Value(0)).current;
  const hasCompleted = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(illustScale, {
        toValue: 1,
        damping: 14,
        stiffness: 70,
        useNativeDriver: true,
      }),
      Animated.stagger(140, [
        Animated.spring(ring1, { toValue: 1, damping: 18, stiffness: 50, useNativeDriver: true }),
        Animated.spring(ring2, { toValue: 1, damping: 18, stiffness: 40, useNativeDriver: true }),
        Animated.spring(ring3, { toValue: 1, damping: 18, stiffness: 32, useNativeDriver: true }),
      ]),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFade, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(textSlide, { toValue: 0, damping: 22, stiffness: 90, useNativeDriver: true }),
      ]).start();
    }, 500);

    setTimeout(() => {
      Animated.timing(btnFade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 1300);

    // Auto-complete after 3.5 seconds — longer than before to avoid race
    const timer = setTimeout(() => handleComplete(), 3500);
    return () => clearTimeout(timer);
  }, []);

  async function handleComplete() {
    if (hasCompleted.current || isSubmitting) return;
    hasCompleted.current = true;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // completeOnboarding now writes storage before updating state
    await completeOnboarding({ isFirstPregnancy: firstPreg });
    // Small settle delay so state propagation and navigation feel calm
    await new Promise((r) => setTimeout(r, 150));
  }

  return (
    <View style={styles.bloomContainer}>
      {/* Expanding rings */}
      <View style={styles.ringsWrap}>
        <Animated.View
          style={[
            styles.ring,
            styles.ring3,
            { transform: [{ scale: ring3 }], opacity: ring3.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] }) },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            { transform: [{ scale: ring2 }], opacity: ring2.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] }) },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring1,
            { transform: [{ scale: ring1 }], opacity: ring1.interpolate({ inputRange: [0, 1], outputRange: [0, 0.26] }) },
          ]}
        />
        <Animated.View style={{ transform: [{ scale: illustScale }] }}>
          <BabyIllustration week={18} size={100} />
        </Animated.View>
      </View>

      {/* Text */}
      <Animated.View
        style={[
          styles.bloomTextWrap,
          { opacity: textFade, transform: [{ translateY: textSlide }] },
        ]}
      >
        <Text style={styles.bloomTitle}>
          {name ? `${name}, you're` : "You're"}{'\n'}not alone in this.
        </Text>
        <Text style={styles.bloomSubtitle}>
          Bloom is here to walk beside you.
        </Text>
      </Animated.View>

      {/* Enter button */}
      <Animated.View style={{ opacity: btnFade, width: '100%' }}>
        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handleComplete}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          <Text style={styles.primaryButtonText}>Enter Bloom</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ─── Main onboarding screen ───────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [firstPregValue, setFirstPregValue] = useState(false);
  const insets = useSafeAreaInsets();

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(28)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, damping: 24, stiffness: 70, useNativeDriver: true }),
    ]).start();
  }, []);

  function goToNext() {
    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: -22, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setStep((s) => s + 1);
      contentSlide.setValue(28);
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(contentSlide, { toValue: 0, damping: 22, stiffness: 90, useNativeDriver: true }),
      ]).start();
    });
  }

  const isDataStep = step >= 3 && step <= 5;
  const dataStepIndex = step - 3;

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 40 : 40);

  return (
    <OnboardingInner
      step={step}
      isDataStep={isDataStep}
      dataStepIndex={dataStepIndex}
      contentOpacity={contentOpacity}
      contentSlide={contentSlide}
      topPad={topPad}
      bottomPad={bottomPad}
      firstPregValue={firstPregValue}
      setFirstPregValue={setFirstPregValue}
      goToNext={goToNext}
    />
  );
}

interface OnboardingInnerProps {
  step: number;
  isDataStep: boolean;
  dataStepIndex: number;
  contentOpacity: Animated.Value;
  contentSlide: Animated.Value;
  topPad: number;
  bottomPad: number;
  firstPregValue: boolean;
  setFirstPregValue: (v: boolean) => void;
  goToNext: () => void;
}

function OnboardingInner({
  step,
  isDataStep,
  dataStepIndex,
  contentOpacity,
  contentSlide,
  topPad,
  bottomPad,
  firstPregValue,
  setFirstPregValue,
  goToNext,
}: OnboardingInnerProps) {
  const { user } = useBloom();

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <StoryStep
            decorColors={['#D4876A', '#F0C4A8', '#FBF0E8']}
            title={'A quiet space for your\npregnancy journey.'}
            body="No pressure. No noise. Just warmth, wonder, and gentle guidance — every step of the way."
            ctaLabel="Step inside"
            onNext={goToNext}
          />
        );
      case 1:
        return (
          <StoryStep
            decorColors={['#C4A8C8', '#E0D0E8', '#F5EDF8']}
            eyebrow="You belong here."
            title={'Gentle support,\nalways beside you.'}
            body="Bloom was made for the tender, complex, extraordinary experience of pregnancy — to walk beside you, not overwhelm you."
            ctaLabel="Continue"
            onNext={goToNext}
          />
        );
      case 2:
        return (
          <StoryStep
            decorColors={['#A8C4A8', '#C8DEC8', '#EDF5ED']}
            eyebrow="A promise we keep."
            title={'Your story stays\nwith you, always.'}
            privacyPoints={[
              'Everything you share stays only on your device.',
              'No accounts. No tracking. No pressure.',
              'Your journey is yours alone — always.',
            ]}
            ctaLabel="Begin your journey"
            onNext={goToNext}
          />
        );
      case 3:
        return <NameStep onNext={goToNext} />;
      case 4:
        return <LMPStep onNext={goToNext} />;
      case 5:
        return (
          <FirstPregnancyStep
            onComplete={(v) => {
              setFirstPregValue(v);
              goToNext();
            }}
          />
        );
      case 6:
        return <BloomCompletionStep name={user.name} firstPreg={firstPregValue} />;
      default:
        return null;
    }
  }

  const gradientColors: [string, string, string] =
    step === 0
      ? ['#FBF7F0', '#F7EDE4', '#F2E4D4']
      : step === 1
      ? ['#F8F4FC', '#F2EBF8', '#EDE4F4']
      : step === 2
      ? ['#F4F8F4', '#EBF3EB', '#E2EEE2']
      : ['#FBF7F0', '#F5EDE0', '#F0E5D5'];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 24, paddingBottom: bottomPad },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {isDataStep && (
            <View style={styles.dotsRow}>
              <ProgressDots total={DATA_STEPS} current={dataStepIndex} />
            </View>
          )}

          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
              flex: 1,
            }}
          >
            {renderStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 32,
  },
  dotsRow: { marginBottom: 44 },

  // Story layout
  storyContainer: {
    flex: 1,
    minHeight: 480,
    justifyContent: 'space-between',
  },
  decorRow: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  storyContent: {
    flex: 1,
    paddingBottom: 32,
  },
  storyEyebrow: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.8,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  storyTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 48,
    letterSpacing: -0.8,
    marginBottom: 20,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  storyBody: {
    fontSize: 17,
    color: Colors.textMuted,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  privacyPoints: {
    gap: 16,
    marginTop: 8,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  privacyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sage,
    marginTop: 8,
    flexShrink: 0,
  },
  privacyText: {
    fontSize: 16,
    color: Colors.textWarm,
    lineHeight: 26,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },

  // Data layout
  dataContainer: {
    flex: 1,
  },
  dataEyebrow: {
    fontSize: 13,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.4,
    marginBottom: 14,
  },
  dataTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 46,
    letterSpacing: -0.8,
    marginBottom: 16,
    fontFamily: 'CormorantGaramond_700Bold',
  },
  dataBody: {
    fontSize: 16,
    color: Colors.textMuted,
    lineHeight: 26,
    marginBottom: 36,
    fontFamily: 'Inter_400Regular',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.md,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: Colors.text,
    marginBottom: 22,
    borderWidth: 1.5,
    borderColor: Colors.border,
    fontFamily: 'Inter_400Regular',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  dateInputWrap: { gap: 6 },
  dateLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: 'Inter_500Medium',
  },
  dateInput: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 18,
    fontSize: 18,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },

  // LMP helper / validation text
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: Colors.peachLight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Colors.radius.md,
    marginBottom: 20,
    marginTop: 6,
  },
  helperRowBlocking: {
    backgroundColor: '#F5EDE5',
  },
  helperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginTop: 6,
    flexShrink: 0,
    opacity: 0.6,
  },
  helperDotBlocking: {
    backgroundColor: '#C4876A',
    opacity: 0.8,
  },
  helperText: {
    fontSize: 14,
    color: Colors.textWarm,
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    fontStyle: 'italic',
  },
  helperTextBlocking: {
    color: '#7A4A32',
  },

  choiceRow: { gap: 14 },
  choiceButton: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    paddingVertical: 22,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: Colors.primarySoft,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  choiceText: {
    fontSize: 17,
    color: Colors.textWarm,
    fontFamily: 'Inter_500Medium',
  },
  choiceTextSelected: {
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
  },

  // Shared button
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
    marginTop: 8,
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

  // Bloom completion
  bloomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 520,
    gap: 32,
  },
  ringsWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  ring1: { width: 160, height: 160 },
  ring2: { width: 200, height: 200 },
  ring3: { width: 240, height: 240 },
  bloomTextWrap: {
    alignItems: 'center',
    gap: 12,
  },
  bloomTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 44,
    letterSpacing: -0.8,
    textAlign: 'center',
    fontFamily: 'CormorantGaramond_700Bold',
  },
  bloomSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    lineHeight: 26,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
  },
});

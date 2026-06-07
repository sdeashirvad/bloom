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
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { ProgressDots } from '@/components/ProgressDots';
import { BabyIllustration } from '@/components/BabyIllustration';
import { useBloom } from '@/context/BloomContext';
import { validateLMPDate, parseLMPFields } from '@/utils/pregnancyValidation';

const DATA_STEPS = 3;

// ─── Easing curves ────────────────────────────────────────────────────────────
const gentleEaseOut = Easing.out(Easing.cubic);
const softEaseOut = Easing.out(Easing.quad);

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
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
    return () => pulseAnim.stopAnimation();
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

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onNext}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
      >
        <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Data steps ───────────────────────────────────────────────────────────────

function NameStep({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);
  const { updateUser } = useBloom();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  async function handleNext() {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateUser({ name: name.trim() });
    if (isMounted.current) onNext();
  }

  return (
    <View style={styles.dataContainer}>
      <Text style={styles.dataEyebrow}>Begin softly.</Text>
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
        accessibilityLabel="Enter your name"
      />
      <TouchableOpacity
        style={[styles.primaryButton, (!name.trim() || isSubmitting) && styles.primaryButtonDisabled]}
        onPress={handleNext}
        activeOpacity={0.85}
        disabled={!name.trim() || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Continue"
        accessibilityState={{ disabled: !name.trim() || isSubmitting }}
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
        This helps Bloom understand where you are in your journey, and offer the right support each week.
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
        accessibilityRole="button"
        accessibilityLabel="Continue"
        accessibilityState={{ disabled: !canContinue }}
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
          accessibilityRole="button"
          accessibilityLabel="Yes, this is my first pregnancy"
          accessibilityState={{ selected: selected === true, disabled: isSubmitting }}
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
          accessibilityRole="button"
          accessibilityLabel="I've been pregnant before"
          accessibilityState={{ selected: selected === false, disabled: isSubmitting }}
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
  const illustScale = useRef(new Animated.Value(0.3)).current;
  const illustOpacity = useRef(new Animated.Value(0)).current;
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(16)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  const dedicationFade = useRef(new Animated.Value(0)).current;
  const dedicationTextFade = useRef(new Animated.Value(0)).current;
  const [dedicationVisible, setDedicationVisible] = useState(false);

  const hasCompleted = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Gentle illustration entrance — scale + fade, no spring bounce
    Animated.parallel([
      Animated.timing(illustScale, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: gentleEaseOut,
      }),
      Animated.timing(illustOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: softEaseOut,
      }),
    ]).start();

    // Rings expand with stagger — overdamped timing
    setTimeout(() => {
      Animated.stagger(160, [
        Animated.timing(ring1, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: gentleEaseOut,
        }),
        Animated.timing(ring2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: gentleEaseOut,
        }),
        Animated.timing(ring3, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
          easing: gentleEaseOut,
        }),
      ]).start();
    }, 200);

    // Text fades in softly
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
          easing: softEaseOut,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
          easing: gentleEaseOut,
        }),
      ]).start();
    }, 600);

    // Button fades in last
    setTimeout(() => {
      Animated.timing(btnFade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
        easing: softEaseOut,
      }).start();
    }, 1500);
  }, []);

  async function handleComplete() {
    if (hasCompleted.current || isSubmitting) return;
    hasCompleted.current = true;
    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setDedicationVisible(true);

    Animated.timing(dedicationFade, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: softEaseOut,
    }).start();

    await new Promise((r) => setTimeout(r, 600));
    Animated.timing(dedicationTextFade, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
      easing: softEaseOut,
    }).start();

    await new Promise((r) => setTimeout(r, 2000));

    await new Promise<void>((r) => {
      Animated.timing(dedicationTextFade, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }).start(() => r());
    });

    await completeOnboarding({ isFirstPregnancy: firstPreg });
    await new Promise((r) => setTimeout(r, 120));
  }

  return (
    <View style={styles.bloomContainer}>
      <View style={styles.ringsWrap}>
        <Animated.View
          style={[
            styles.ring,
            styles.ring3,
            {
              transform: [{ scale: ring3 }],
              opacity: ring3.interpolate({ inputRange: [0, 1], outputRange: [0, 0.1] }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            {
              transform: [{ scale: ring2 }],
              opacity: ring2.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring1,
            {
              transform: [{ scale: ring1 }],
              opacity: ring1.interpolate({ inputRange: [0, 1], outputRange: [0, 0.24] }),
            },
          ]}
        />
        <Animated.View
          style={{
            transform: [{ scale: illustScale }],
            opacity: illustOpacity,
          }}
        >
          <BabyIllustration week={18} size={100} />
        </Animated.View>
      </View>

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

      <Animated.View style={{ opacity: btnFade, width: '100%' }}>
        <TouchableOpacity
          style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
          onPress={handleComplete}
          activeOpacity={0.85}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Enter Bloom"
          accessibilityState={{ disabled: isSubmitting }}
        >
          <Text style={styles.primaryButtonText}>Enter Bloom</Text>
        </TouchableOpacity>
      </Animated.View>

      {dedicationVisible ? (
        <Animated.View
          style={[StyleSheet.absoluteFillObject, styles.dedicationOverlay, { opacity: dedicationFade }]}
          pointerEvents="none"
        >
          <Animated.Text style={[styles.dedicationText, { opacity: dedicationTextFade }]}>
            For mothers, everywhere.
          </Animated.Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

// ─── Main onboarding screen ───────────────────────────────────────────────────

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [firstPregValue, setFirstPregValue] = useState(false);
  const insets = useSafeAreaInsets();

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Soft entrance — pure timing, no springs, no oscillation
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
        easing: softEaseOut,
      }),
      Animated.timing(contentSlide, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
        easing: gentleEaseOut,
      }),
    ]).start();
  }, []);

  function goToNext() {
    // Fade + slide out
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
      Animated.timing(contentSlide, {
        toValue: -14,
        duration: 220,
        useNativeDriver: true,
        easing: Easing.in(Easing.quad),
      }),
    ]).start(() => {
      setStep((s) => s + 1);
      contentSlide.setValue(20);
      // Fade + slide in — pure timing, zero bounce
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
          easing: softEaseOut,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 440,
          useNativeDriver: true,
          easing: gentleEaseOut,
        }),
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
            onComplete={(val) => {
              setFirstPregValue(val);
              goToNext();
            }}
          />
        );
      case 6:
        return <BloomCompletionStep name={user.name || ''} firstPreg={firstPregValue} />;
      default:
        return null;
    }
  }

  const showProgress = step <= 5;
  const progressStep = step < 3 ? step : step - 3 + DATA_STEPS;

  return (
    <LinearGradient
      colors={['#FBF7F0', '#F5EDE2', '#F0E5D5']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: topPad + 28, paddingBottom: bottomPad },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {showProgress && (
            <View style={styles.progressWrap}>
              <ProgressDots total={6} current={progressStep} />
            </View>
          )}

          <Animated.View
            style={[
              styles.stepWrap,
              {
                opacity: contentOpacity,
                transform: [{ translateY: contentSlide }],
              },
            ]}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
  },
  progressWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepWrap: {
    flex: 1,
  },

  // Story steps
  storyContainer: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 480,
  },
  decorRow: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
  },
  storyEyebrow: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 38,
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 46,
    letterSpacing: -0.8,
    marginBottom: 18,
  },
  storyBody: {
    fontSize: 17,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  privacyPoints: { marginTop: 4, gap: 14 },
  privacyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  privacyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sage,
    opacity: 0.7,
    marginTop: 7,
    flexShrink: 0,
  },
  privacyText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
  },

  // Data steps
  dataContainer: {
    flex: 1,
    paddingTop: 12,
    minHeight: 440,
  },
  dataEyebrow: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  dataTitle: {
    fontSize: 36,
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 44,
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  dataBody: {
    fontSize: 16,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
    marginBottom: 32,
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Inter_400Regular',
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dateInputWrap: { gap: 8 },
  dateLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dateInput: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 16,
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Inter_400Regular',
    borderWidth: 1.5,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  helperRowBlocking: {},
  helperDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sage,
    marginTop: 6,
    flexShrink: 0,
  },
  helperDotBlocking: { backgroundColor: '#C47858' },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },
  helperTextBlocking: { color: '#B06040' },
  choiceRow: { gap: 12, marginTop: 8 },
  choiceButton: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  choiceButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primarySoft,
  },
  choiceText: {
    fontSize: 17,
    color: Colors.textWarm,
    fontFamily: 'Inter_500Medium',
  },
  choiceTextSelected: { color: Colors.primary },

  // Primary button
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: Colors.radius.full,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: Colors.peach,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Bloom completion
  bloomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 520,
    paddingTop: 20,
  },
  ringsWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  ring1: { width: 180, height: 180 },
  ring2: { width: 220, height: 220 },
  ring3: { width: 260, height: 260 },
  bloomTextWrap: {
    alignItems: 'center',
    marginBottom: 48,
    paddingHorizontal: 8,
  },
  bloomTitle: {
    fontSize: 36,
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 46,
    letterSpacing: -0.6,
    textAlign: 'center',
    marginBottom: 14,
  },
  bloomSubtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
    textAlign: 'center',
  },
  dedicationOverlay: {
    backgroundColor: '#FBF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  dedicationText: {
    fontSize: 28,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});

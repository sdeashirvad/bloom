import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity,
  Platform,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { BloomCard } from '@/components/BloomCard';
import { BabyIllustration } from '@/components/BabyIllustration';
import { TrimesterBadge } from '@/components/TrimesterBadge';
import { AmbientOrb } from '@/components/AmbientOrb';
import { useBloom } from '@/context/BloomContext';
import { BloomUser } from '@/context/BloomContext';
import { getWeekData } from '@/constants/weekData';
import {
  getDailyAffirmation,
  GREETING_BY_TIME,
  getPersonalMemory,
  getTrimester,
} from '@/constants/emotionalContent';
import {
  getTimeOfDay,
  TIME_GRADIENTS,
  TIME_ORB_COLORS,
  TRIMESTER_HERO_GRADIENTS,
  TRIMESTER_HERO_SHADOW,
} from '@/constants/timeOfDay';
import {
  getTodaysReflection,
  getReflectionsByWeek,
} from '@/stores/reflectionStore';
import { ReflectionEntry } from '@/types/reflection';

const softEaseOut = Easing.out(Easing.cubic);

// ─── Sub-components ───────────────────────────────────────────────────────────

function FadeCard({
  children,
  delay,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 560,
          useNativeDriver: true,
          easing: softEaseOut,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: softEaseOut,
        }),
      ]).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

function MemoryLine({
  user,
  week,
  totalDays,
}: {
  user: BloomUser;
  week: number;
  totalDays: number;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
        easing: softEaseOut,
      }).start();
    }, 350);
    return () => clearTimeout(t);
  }, []);

  const memory = getPersonalMemory(user.name, week, totalDays, user.lastMood, user.lastMoodDate);
  if (!memory) return null;

  return (
    <Animated.View style={[styles.memoryLine, { opacity: fadeAnim }]}>
      <View style={styles.memoryDot} />
      <Text style={styles.memoryText}>{memory}</Text>
    </Animated.View>
  );
}

function BreathingHeroCard({
  week,
  totalDays,
  daysAlong,
  trimester,
}: {
  week: number;
  totalDays: number;
  daysAlong: number;
  trimester: 1 | 2 | 3;
}) {
  const breathAnim = useRef(new Animated.Value(0)).current;
  const weekData = getWeekData(week);
  const heroGradient = TRIMESTER_HERO_GRADIENTS[trimester];
  const heroShadow = TRIMESTER_HERO_SHADOW[trimester];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathAnim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(breathAnim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);

  const heroScale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.004] });
  const weeksLeft = Math.max(0, 40 - week);

  return (
    <Animated.View
      style={[styles.heroCardWrap, { shadowColor: heroShadow, transform: [{ scale: heroScale }] }]}
    >
      <LinearGradient
        colors={heroGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <View style={styles.heroDecorRing1} />
        <View style={styles.heroDecorRing2} />
        <View style={styles.heroInner}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroEyebrow}>You are in</Text>
            <Text style={styles.heroWeek}>Week {week}</Text>
            <View style={styles.heroDayRow}>
              <Text style={styles.heroDay}>Day {totalDays}</Text>
              <View style={styles.heroDayDot} />
              <Text style={styles.heroDay}>
                {weeksLeft > 0 ? `${weeksLeft} weeks to go` : 'Due any day'}
              </Text>
            </View>
          </View>
          <View style={styles.heroRight}>
            <BabyIllustration week={week} size={110} />
          </View>
        </View>
        <View style={styles.heroBottom}>
          <Text style={styles.heroBabyLabel}>About the size of</Text>
          <Text style={styles.heroBabySize}>{weekData.babySize}</Text>
          <Text style={styles.heroBabyDetail}>{weekData.babySizeDetail}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Today's check-in CTA — the emotional core of Home ───────────────────────

const MOOD_ICONS: Record<string, string> = {
  calm: '🌿', tired: '🌙', emotional: '🌊', anxious: '🍃', happy: '☀️',
};
const MOOD_DISPLAY: Record<string, string> = {
  calm: 'calm', tired: 'tired', emotional: 'tender', anxious: 'unsettled', happy: 'joyful',
};

function TodayCheckinCard({
  todaysEntry,
  onCheckin,
}: {
  todaysEntry: ReflectionEntry | null;
  onCheckin: () => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: softEaseOut,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
          easing: softEaseOut,
        }),
      ]).start();
    }, 260);
    return () => clearTimeout(t);
  }, [todaysEntry?.id]);

  if (!todaysEntry) {
    // Primary emotional CTA — no check-in today
    return (
      <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <TouchableOpacity
          style={styles.checkinCTA}
          onPress={onCheckin}
          activeOpacity={0.88}
          accessibilityRole="button"
          accessibilityLabel="How are you feeling today? Open mood check-in"
        >
          <LinearGradient colors={['#FDF0EA', '#F7E4D4']} style={styles.checkinCTAInner}>
            <View style={styles.checkinCTADecor} />
            <View style={styles.checkinCTAContent}>
              <Text style={styles.checkinCTAEyebrow}>A moment for you</Text>
              <Text style={styles.checkinCTATitle}>How are you{'\n'}feeling today?</Text>
              <View style={styles.checkinCTAButton}>
                <Text style={styles.checkinCTAButtonText}>Check in</Text>
                <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Checked in today — show gentle status
  const moodIcon = MOOD_ICONS[todaysEntry.mood] ?? '🌿';
  const moodWord = MOOD_DISPLAY[todaysEntry.mood] ?? todaysEntry.mood;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.checkinStatus}>
        <View style={styles.checkinStatusLeft}>
          <Text style={styles.checkinStatusIcon}>{moodIcon}</Text>
          <View>
            <Text style={styles.checkinStatusLabel}>You checked in today</Text>
            <Text style={styles.checkinStatusMood}>Feeling {moodWord}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onCheckin}
          activeOpacity={0.75}
          style={styles.checkinStatusAddBtn}
          accessibilityRole="button"
          accessibilityLabel="Add another reflection"
        >
          <Text style={styles.checkinStatusAddText}>Reflect more</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// ─── This week's latest reflection ───────────────────────────────────────────

function ThisWeekWidget({
  weekEntries,
  onCapture,
}: {
  weekEntries: ReflectionEntry[] | null;
  onCapture: () => void;
}) {
  if (weekEntries === null) return null;

  const latest = weekEntries[0] ?? null;
  if (!latest) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>This week</Text>
      <View style={styles.weekCard}>
        <View style={styles.weekCardDecor} />
        <View style={styles.weekCardHeader}>
          <View style={styles.weekMoodPill}>
            <Text style={styles.weekMoodIcon}>{MOOD_ICONS[latest.mood] ?? '🌿'}</Text>
            <Text style={styles.weekMoodLabel}>
              {latest.mood.charAt(0).toUpperCase() + latest.mood.slice(1)}
            </Text>
          </View>
          {latest.keptClose ? (
            <Text style={styles.weekKeptClose}>❤ Kept close</Text>
          ) : null}
          {latest.milestoneTag ? (
            <Text style={styles.weekMilestone}>✦ {latest.milestoneTag}</Text>
          ) : null}
        </View>
        {latest.userReflection ? (
          <Text style={styles.weekReflection} numberOfLines={3}>
            "{latest.userReflection}"
          </Text>
        ) : (
          <Text style={styles.weekMoodOnly} numberOfLines={2}>
            A quiet moment.
          </Text>
        )}
        <View style={styles.weekCardFooter}>
          <Text style={styles.weekCardDate}>
            {new Date(latest.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, pregnancyWeek, daysAlong } = useBloom();

  const [todaysEntry, setTodaysEntry] = useState<ReflectionEntry | null>(null);
  const [weekEntries, setWeekEntries] = useState<ReflectionEntry[] | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const week = pregnancyWeek || 18;
  const weekData = getWeekData(week);
  const affirmation = getDailyAffirmation(week);
  const greeting = GREETING_BY_TIME();
  const trimester = getTrimester(week);
  const timeOfDay = getTimeOfDay();
  const bgGradient = TIME_GRADIENTS[timeOfDay];
  const orbColors = TIME_ORB_COLORS[timeOfDay];
  const totalDays = week * 7 + (daysAlong || 0);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === 'web' ? 34 : 20);

  // Load data — refetch every time this tab gains focus
  const loadData = useCallback(async () => {
    const [todayEntry, entries] = await Promise.all([
      getTodaysReflection(),
      getReflectionsByWeek(week),
    ]);
    setTodaysEntry(todayEntry);
    setWeekEntries(entries);
    setDataLoaded(true);
  }, [week]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh on every focus — catches saves from mood tab
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function handleMoodCapture() {
    router.push('/(tabs)/mood');
  }

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>
      <AmbientOrb size={260} color={orbColors[0]} opacity={0.16} phaseSeed={0} style={{ top: -100, right: -90 }} />
      <AmbientOrb size={180} color={orbColors[1]} opacity={0.14} phaseSeed={0.5} style={{ bottom: 260, left: -70 }} />
      <AmbientOrb size={110} color={orbColors[2]} opacity={0.11} phaseSeed={0.75} style={{ top: 360, right: -40 }} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 28, paddingBottom: bottomPad + 130 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <FadeCard delay={0}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>
                {greeting}{user.name ? `, ${user.name}` : ''}
              </Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.avatarWrap}>
              <LinearGradient colors={['#F5D0B8', '#EAC0A8']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>✿</Text>
              </LinearGradient>
            </View>
          </View>
        </FadeCard>

        {/* Trimester badge */}
        <FadeCard delay={80}>
          <TrimesterBadge week={week} />
        </FadeCard>

        {/* Personal memory line */}
        <MemoryLine user={user} week={week} totalDays={totalDays} />

        {/* Week hero card */}
        <FadeCard delay={160}>
          <BreathingHeroCard
            week={week}
            totalDays={totalDays}
            daysAlong={daysAlong || 0}
            trimester={trimester}
          />
        </FadeCard>

        {/* ── Emotional core: mood CTA or check-in status ── */}
        {dataLoaded && (
          <TodayCheckinCard
            todaysEntry={todaysEntry}
            onCheckin={handleMoodCapture}
          />
        )}

        {/* Affirmation */}
        <FadeCard delay={340}>
          <View style={styles.affirmationCard}>
            <View style={styles.affirmationInner}>
              <Text style={styles.affirmationQuote}>"</Text>
              <Text style={styles.affirmationText}>{affirmation}</Text>
            </View>
          </View>
        </FadeCard>

        {/* This week's reflection — only shown if they have entries */}
        {dataLoaded && weekEntries && weekEntries.length > 0 && (
          <FadeCard delay={420}>
            <ThisWeekWidget weekEntries={weekEntries} onCapture={handleMoodCapture} />
          </FadeCard>
        )}

        {/* One daily insight */}
        <FadeCard delay={500}>
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>For you today</Text>
          <BloomCard style={styles.insightCard} variant="white" padding={22}>
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.lavenderLight }]}>
                <Ionicons name="sparkles-outline" size={18} color={Colors.lavender} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Daily insight</Text>
                <Text style={styles.insightText}>{weekData.dailyInsight}</Text>
              </View>
            </View>
          </BloomCard>
        </FadeCard>

        {/* Navigation */}
        <FadeCard delay={580}>
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Around Bloom</Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/(tabs)/week')}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="This week — baby and your body"
            >
              <LinearGradient colors={['#F0EBF8', '#E8E0F5']} style={styles.quickGradient}>
                <View style={[styles.quickIconWrap, { backgroundColor: Colors.lavenderLight }]}>
                  <Ionicons name="leaf" size={18} color={Colors.lavender} />
                </View>
                <Text style={styles.quickLabel}>This week</Text>
                <Text style={styles.quickSub}>Baby &amp; your body</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/(tabs)/journey')}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Journey — your memories"
            >
              <LinearGradient colors={['#FDF0EA', '#F8E5D8']} style={styles.quickGradient}>
                <View style={[styles.quickIconWrap, { backgroundColor: Colors.peachLight }]}>
                  <Ionicons name="sunny" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.quickLabel}>Journey</Text>
                <Text style={styles.quickSub}>Your memories</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </FadeCard>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 22 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: { flex: 1 },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  date: {
    fontSize: 13,
    color: Colors.textSoft,
    marginTop: 4,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
  avatarWrap: {
    marginLeft: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22 },

  memoryLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  memoryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primarySoft,
    flexShrink: 0,
  },
  memoryText: {
    fontSize: 14,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    lineHeight: 20,
    flex: 1,
  },

  heroCardWrap: {
    borderRadius: Colors.radius.xl,
    marginBottom: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
    elevation: 10,
  },
  heroCard: {
    borderRadius: Colors.radius.xl,
    padding: 24,
    overflow: 'hidden',
  },
  heroDecorRing1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80,
    left: -60,
  },
  heroDecorRing2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -50,
    right: 80,
  },
  heroInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroLeft: { flex: 1, gap: 6 },
  heroRight: {},
  heroEyebrow: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroWeek: {
    fontSize: 52,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 58,
    letterSpacing: -1.5,
  },
  heroDayRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroDay: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_400Regular' },
  heroDayDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' },
  heroBottom: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.16)',
    paddingTop: 18,
    gap: 4,
  },
  heroBabyLabel: { fontSize: 12, color: 'rgba(255,255,255,0.62)', fontFamily: 'Inter_400Regular', letterSpacing: 0.3 },
  heroBabySize: { fontSize: 24, color: '#FFF', fontWeight: '600', fontFamily: 'CormorantGaramond_600SemiBold', letterSpacing: -0.3 },
  heroBabyDetail: { fontSize: 13, color: 'rgba(255,255,255,0.58)', fontFamily: 'Inter_400Regular', lineHeight: 18 },

  // ── Today check-in CTA (no check-in) ──
  checkinCTA: {
    borderRadius: Colors.radius.xl,
    marginBottom: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  checkinCTAInner: {
    borderRadius: Colors.radius.xl,
    padding: 26,
    overflow: 'hidden',
    position: 'relative',
  },
  checkinCTADecor: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(212,136,112,0.07)',
    bottom: -60,
    right: -40,
  },
  checkinCTAContent: { gap: 10 },
  checkinCTAEyebrow: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  checkinCTATitle: {
    fontSize: 28,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 36,
    letterSpacing: -0.4,
  },
  checkinCTAButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  checkinCTAButtonText: {
    fontSize: 15,
    color: Colors.primary,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },

  // ── Today check-in status (checked in) ──
  checkinStatus: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  checkinStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  checkinStatusIcon: { fontSize: 24 },
  checkinStatusLabel: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  checkinStatusMood: {
    fontSize: 16,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: -0.2,
  },
  checkinStatusAddBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Colors.radius.full,
    backgroundColor: Colors.primarySoft,
  },
  checkinStatusAddText: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.1,
  },

  // Affirmation
  affirmationCard: {
    marginBottom: 18,
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  affirmationInner: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    paddingHorizontal: 22,
    paddingVertical: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primarySoft,
  },
  affirmationQuote: {
    fontSize: 40,
    color: Colors.primarySoft,
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 32,
    marginBottom: 4,
  },
  affirmationText: {
    fontSize: 17,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_600SemiBold',
    lineHeight: 26,
    letterSpacing: -0.2,
  },

  // ── This week widget ──
  weekCard: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.xl,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 3,
  },
  weekCardDecor: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(212,136,112,0.04)',
    top: -30,
    right: -25,
  },
  weekCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  weekMoodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Colors.radius.full,
  },
  weekMoodIcon: { fontSize: 12 },
  weekMoodLabel: {
    fontSize: 12,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
  },
  weekKeptClose: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'Inter_400Regular',
    opacity: 0.75,
  },
  weekMilestone: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: 'Inter_400Regular',
    opacity: 0.75,
  },
  weekReflection: {
    fontSize: 16,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontStyle: 'italic',
    lineHeight: 24,
    letterSpacing: -0.1,
    marginBottom: 12,
  },
  weekMoodOnly: {
    fontSize: 15,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 12,
  },
  weekCardFooter: {},
  weekCardDate: {
    fontSize: 11,
    color: Colors.textLight,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },

  sectionTitle: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },

  insightCard: {
    marginBottom: 24,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightContent: { flex: 1, gap: 5 },
  insightLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 15,
    color: Colors.textWarm,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },

  // Quick links
  quickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCard: {
    flex: 1,
    borderRadius: Colors.radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  quickGradient: {
    padding: 20,
    gap: 10,
  },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 15,
    color: Colors.textWarm,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: -0.1,
    marginTop: 4,
  },
  quickSub: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
  },
});

import React, { useRef, useEffect, useState } from 'react';
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
import { useRouter } from 'expo-router';
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
  getCompanionNote,
} from '@/constants/emotionalContent';
import {
  getTimeOfDay,
  TIME_GRADIENTS,
  TIME_ORB_COLORS,
  TRIMESTER_HERO_GRADIENTS,
  TRIMESTER_HERO_SHADOW,
} from '@/constants/timeOfDay';
import { getReflectionsByWeek, ReflectionGroup } from '@/stores/reflectionStore';
import { ReflectionEntry } from '@/types/reflection';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StaggeredCard({
  children,
  delay,
  style,
}: {
  children: React.ReactNode;
  delay: number;
  style?: object;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 520, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, damping: 24, stiffness: 88, useNativeDriver: true }),
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
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    }, 400);
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
        Animated.timing(breathAnim, { toValue: 1, duration: 4400, useNativeDriver: true }),
        Animated.timing(breathAnim, { toValue: 0, duration: 4400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const heroScale = breathAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.006] });
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

// ─── "This week in your journey" widget ──────────────────────────────────────

const MOOD_ICONS: Record<string, string> = {
  calm: '🌿', tired: '🌙', emotional: '🌊', anxious: '🍃', happy: '☀️',
};

function ThisWeekWidget({
  week,
  onCapture,
}: {
  week: number;
  onCapture: () => void;
}) {
  const [weekEntries, setWeekEntries] = useState<ReflectionEntry[] | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    getReflectionsByWeek(week).then((entries) => {
      setWeekEntries(entries);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    });
  }, [week]);

  if (weekEntries === null) return null;

  // Most recent reflection this week
  const latest = weekEntries[0] ?? null;

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={styles.sectionTitle}>This week in your journey</Text>
      {latest ? (
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
            <Text style={styles.weekBloomReply} numberOfLines={3}>
              {latest.bloomReply}
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
      ) : (
        <TouchableOpacity
          style={styles.weekEmptyCard}
          onPress={onCapture}
          activeOpacity={0.82}
        >
          <View style={styles.weekEmptyInner}>
            <View style={styles.weekEmptyOrb} />
            <Text style={styles.weekEmptyText}>
              A quiet week so far.
            </Text>
            <View style={styles.weekEmptyCTA}>
              <Text style={styles.weekEmptyCTAText}>Check in today</Text>
              <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, pregnancyWeek, daysAlong } = useBloom();

  const week = pregnancyWeek || 18;
  const weekData = getWeekData(week);
  const affirmation = getDailyAffirmation(week);
  const companionNote = getCompanionNote(week);
  const greeting = GREETING_BY_TIME();
  const trimester = getTrimester(week);
  const timeOfDay = getTimeOfDay();
  const bgGradient = TIME_GRADIENTS[timeOfDay];
  const orbColors = TIME_ORB_COLORS[timeOfDay];
  const totalDays = week * 7 + (daysAlong || 0);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  function handleMoodCapture() {
    router.push('/(tabs)/mood');
  }

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>
      <AmbientOrb size={260} color={orbColors[0]} opacity={0.18} phaseSeed={0} style={{ top: -100, right: -90 }} />
      <AmbientOrb size={180} color={orbColors[1]} opacity={0.16} phaseSeed={0.5} style={{ bottom: 260, left: -70 }} />
      <AmbientOrb size={120} color={orbColors[2]} opacity={0.13} phaseSeed={0.75} style={{ top: 340, right: -40 }} />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 28, paddingBottom: bottomPad + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <StaggeredCard delay={0}>
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
        </StaggeredCard>

        {/* Trimester badge */}
        <StaggeredCard delay={80}>
          <TrimesterBadge week={week} />
        </StaggeredCard>

        {/* Personal memory line */}
        <MemoryLine user={user} week={week} totalDays={totalDays} />

        {/* Breathing hero card */}
        <StaggeredCard delay={180}>
          <BreathingHeroCard week={week} totalDays={totalDays} daysAlong={daysAlong || 0} trimester={trimester} />
        </StaggeredCard>

        {/* Affirmation */}
        <StaggeredCard delay={280}>
          <View style={styles.affirmationCard}>
            <View style={styles.affirmationInner}>
              <Text style={styles.affirmationQuote}>"</Text>
              <Text style={styles.affirmationText}>{affirmation}</Text>
            </View>
          </View>
        </StaggeredCard>

        {/* Companion note */}
        <StaggeredCard delay={330}>
          <LinearGradient colors={['#FDF5EE', '#F8EDE0']} style={styles.companionNote}>
            <Text style={styles.companionMark}>✦</Text>
            <Text style={styles.companionText}>{companionNote}</Text>
          </LinearGradient>
        </StaggeredCard>

        {/* Emotional note */}
        <StaggeredCard delay={380}>
          <LinearGradient colors={['#FDF5EE', '#F8EAE0']} style={styles.emotionalNote}>
            <View style={styles.emotionalNoteDecor} />
            <Text style={styles.emotionalNoteText}>{weekData.emotionalNote}</Text>
          </LinearGradient>
        </StaggeredCard>

        {/* This week in your journey */}
        <StaggeredCard delay={430}>
          <ThisWeekWidget week={week} onCapture={handleMoodCapture} />
        </StaggeredCard>

        {/* Today for you */}
        <StaggeredCard delay={500}>
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>For you today</Text>
        </StaggeredCard>

        <StaggeredCard delay={560}>
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
        </StaggeredCard>

        <StaggeredCard delay={610}>
          <BloomCard style={styles.insightCard} variant="white" padding={22}>
            <View style={styles.insightRow}>
              <View style={[styles.insightIcon, { backgroundColor: Colors.sageLight }]}>
                <Ionicons name="leaf-outline" size={18} color={Colors.sage} />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightLabel}>Gentle reminder</Text>
                <Text style={styles.insightText}>{weekData.selfCareTip}</Text>
              </View>
            </View>
          </BloomCard>
        </StaggeredCard>

        {/* Quick links */}
        <StaggeredCard delay={660}>
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
              onPress={handleMoodCapture}
              activeOpacity={0.82}
              accessibilityRole="button"
              accessibilityLabel="Mood check — how are you today?"
            >
              <LinearGradient colors={['#FDF0EA', '#F8E5D8']} style={styles.quickGradient}>
                <View style={[styles.quickIconWrap, { backgroundColor: Colors.peachLight }]}>
                  <Ionicons name="sunny" size={18} color={Colors.primary} />
                </View>
                <Text style={styles.quickLabel}>Mood check</Text>
                <Text style={styles.quickSub}>How are you today?</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </StaggeredCard>
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
    shadowOpacity: 0.18,
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
    marginBottom: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.26,
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

  affirmationCard: {
    marginBottom: 12,
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
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

  emotionalNote: {
    borderRadius: Colors.radius.xl,
    padding: 24,
    marginBottom: 28,
    overflow: 'hidden',
  },
  emotionalNoteDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,136,112,0.06)',
    bottom: -40,
    right: -30,
  },
  emotionalNoteText: {
    fontSize: 20,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_600SemiBold',
    lineHeight: 30,
    letterSpacing: -0.2,
  },

  // ── This week widget ──
  weekCard: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.xl,
    padding: 20,
    marginBottom: 28,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.055,
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
  weekBloomReply: {
    fontSize: 14,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  weekCardFooter: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    marginTop: 2,
  },
  weekCardDate: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },

  weekEmptyCard: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.xl,
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  weekEmptyInner: {
    padding: 22,
    alignItems: 'center',
    position: 'relative',
  },
  weekEmptyOrb: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.peachLight,
    opacity: 0.3,
    top: -20,
    right: -10,
  },
  weekEmptyText: {
    fontSize: 14,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    marginBottom: 14,
    textAlign: 'center',
  },
  weekEmptyCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weekEmptyCTAText: {
    fontSize: 14,
    color: Colors.primary,
    fontFamily: 'Inter_500Medium',
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSoft,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  insightCard: { marginBottom: 10 },
  insightRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  insightContent: { flex: 1, gap: 5 },
  insightLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  insightText: {
    fontSize: 15,
    color: Colors.textWarm,
    lineHeight: 23,
    fontFamily: 'Inter_400Regular',
  },

  companionNote: {
    borderRadius: Colors.radius.xl,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  companionMark: {
    fontSize: 13,
    color: Colors.primarySoft,
    lineHeight: 28,
    marginTop: 3,
    flexShrink: 0,
  },
  companionText: {
    flex: 1,
    fontSize: 17,
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_400Regular',
    lineHeight: 26,
    letterSpacing: -0.1,
    fontStyle: 'italic',
  },

  quickRow: { flexDirection: 'row', gap: 12 },
  quickCard: {
    flex: 1,
    borderRadius: Colors.radius.xl,
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  quickGradient: { padding: 20, gap: 10, alignItems: 'flex-start' },
  quickIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textWarm,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -0.2,
  },
  quickSub: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
  },
});

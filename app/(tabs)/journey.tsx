import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { AmbientOrb } from '@/components/AmbientOrb';
import JourneyCard from '@/components/JourneyCard';
import {
  getAllReflections,
  groupReflectionsByMonth,
  ReflectionGroup,
  toggleKeptClose,
  setMilestoneTag,
} from '@/stores/reflectionStore';
import { ReflectionEntry, MilestoneTag } from '@/types/reflection';

// ─── Milestone detection (system milestones) ──────────────────────────────────

type SystemMilestone = { week: number; label: string; note: string };

const SYSTEM_MILESTONES: SystemMilestone[] = [
  { week: 13, label: 'First trimester complete', note: 'A quiet, tender beginning.' },
  { week: 20, label: 'Halfway there', note: 'The journey is unfolding.' },
  { week: 24, label: 'Viability week', note: 'Something profound this week.' },
  { week: 28, label: 'Third trimester beginning', note: 'The final chapter opens.' },
  { week: 36, label: 'Due month approaching', note: 'Almost time to meet each other.' },
];

function getMilestoneForGroup(entries: ReflectionEntry[]): SystemMilestone | null {
  const weeks = new Set(entries.map((e) => e.pregnancyWeek));
  return SYSTEM_MILESTONES.find((m) => weeks.has(m.week)) ?? null;
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onCapture }: { onCapture: () => void }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 560, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 24, stiffness: 88, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[styles.emptyState, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.emptyOrb} />
      <Text style={styles.emptyIcon}>✿</Text>
      <Text style={styles.emptyTitle}>
        Your reflections will gather here{'\n'}gently over time.
      </Text>
      <Text style={styles.emptySubtitle}>
        Each moment you share becomes a quiet part{'\n'}of your story.
      </Text>
      <TouchableOpacity style={styles.emptyCTA} onPress={onCapture} activeOpacity={0.82}>
        <Text style={styles.emptyCTAText}>Check in today</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Month group header ───────────────────────────────────────────────────────

function GroupHeader({ label }: { label: string }) {
  return (
    <View style={styles.groupHeader}>
      <View style={styles.groupHeaderLine} />
      <Text style={styles.groupHeaderLabel}>{label}</Text>
      <View style={styles.groupHeaderLine} />
    </View>
  );
}

// ─── System milestone marker ──────────────────────────────────────────────────

function MilestoneMarker({ milestone }: { milestone: SystemMilestone }) {
  return (
    <View style={styles.milestone}>
      <LinearGradient colors={['#FDF0EA', '#F7E4D6']} style={styles.milestoneInner}>
        <View style={styles.milestoneDot} />
        <View style={styles.milestoneText}>
          <Text style={styles.milestoneLabel}>{milestone.label}</Text>
          <Text style={styles.milestoneNote}>{milestone.note}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Capture CTA ─────────────────────────────────────────────────────────────

function CaptureCTA({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.captureCTA}
      onPress={onPress}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel="Capture a moment — open mood check-in"
    >
      <View style={styles.captureCTAInner}>
        <View style={styles.captureCTAIcon}>
          <Ionicons name="sunny" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.captureCTAText}>Capture a moment</Text>
        <Ionicons name="chevron-forward" size={15} color={Colors.textLight} />
      </View>
    </TouchableOpacity>
  );
}

// ─── "Moments kept close" section ────────────────────────────────────────────

function KeptCloseSection({
  entries,
  onToggleKeptClose,
  onSetMilestone,
}: {
  entries: ReflectionEntry[];
  onToggleKeptClose: (id: string) => void;
  onSetMilestone: (id: string, tag: MilestoneTag | null) => void;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, damping: 24, stiffness: 88, useNativeDriver: true }),
    ]).start();
  }, []);

  if (entries.length === 0) return null;

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.keptCloseHeader}>
        <Text style={styles.keptCloseMark}>❤</Text>
        <Text style={styles.keptCloseTitle}>Moments kept close</Text>
      </View>
      <Text style={styles.keptCloseSubtitle}>
        These reflections meant something more.
      </Text>
      {entries.map((entry, i) => (
        <JourneyCard
          key={`kc-${entry.id}`}
          entry={entry}
          delay={i * 60}
          variant="keptClose"
          onToggleKeptClose={() => onToggleKeptClose(entry.id)}
          onSetMilestone={(tag) => onSetMilestone(entry.id, tag)}
        />
      ))}
      <View style={styles.keptCloseDivider} />
    </Animated.View>
  );
}

// ─── Privacy badge ────────────────────────────────────────────────────────────

function PrivacyNudge() {
  return (
    <View style={styles.privacyNudge}>
      <View style={styles.privacyNudgeDot} />
      <Text style={styles.privacyNudgeText}>Your journey stays with you</Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const [allEntries, setAllEntries] = useState<ReflectionEntry[]>([]);
  const [groups, setGroups] = useState<ReflectionGroup[]>([]);
  const [keptCloseEntries, setKeptCloseEntries] = useState<ReflectionEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(22)).current;

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  async function loadReflections() {
    const all = await getAllReflections();
    setAllEntries(all);
    setGroups(groupReflectionsByMonth(all));
    setKeptCloseEntries(all.filter((e) => e.keptClose === true));
    setLoaded(true);
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, damping: 24, stiffness: 88, useNativeDriver: true }),
    ]).start();
    loadReflections();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReflections();
    setRefreshing(false);
  }, []);

  function handleCapture() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/mood');
  }

  async function handleToggleKeptClose(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleKeptClose(id);
    await loadReflections();
  }

  async function handleSetMilestone(id: string, tag: MilestoneTag | null) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setMilestoneTag(id, tag);
    await loadReflections();
  }

  const isEmpty = loaded && allEntries.length === 0;
  const hasKeptClose = keptCloseEntries.length > 0;

  return (
    <LinearGradient colors={['#FBF7F0', '#F5EDE0', '#F0E5D5']} style={styles.container}>
      <AmbientOrb
        size={240}
        color={Colors.peachLight}
        opacity={0.22}
        phaseSeed={0.15}
        style={{ top: -100, right: -80 }}
      />
      <AmbientOrb
        size={170}
        color={Colors.lavenderLight}
        opacity={0.14}
        phaseSeed={0.7}
        style={{ bottom: 200, left: -60 }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 28, paddingBottom: bottomPad + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
          <Text style={styles.eyebrow}>Your journey</Text>
          <Text style={styles.pageTitle}>Memories</Text>
          <Text style={styles.pageSubtitle}>
            A gentle keepsake of your{'\n'}pregnancy journey.
          </Text>
          <PrivacyNudge />
        </Animated.View>

        {/* Capture CTA */}
        {!isEmpty && (
          <Animated.View style={{ opacity: headerFade }}>
            <CaptureCTA onPress={handleCapture} />
          </Animated.View>
        )}

        {/* Content */}
        {!loaded ? null : isEmpty ? (
          <EmptyState onCapture={handleCapture} />
        ) : (
          <>
            {/* "Moments kept close" — only when at least one entry is kept */}
            {hasKeptClose && (
              <KeptCloseSection
                entries={keptCloseEntries}
                onToggleKeptClose={handleToggleKeptClose}
                onSetMilestone={handleSetMilestone}
              />
            )}

            {/* Main timeline */}
            <View style={styles.timeline}>
              {groups.map((group, groupIndex) => {
                const systemMilestone = getMilestoneForGroup(group.entries);
                return (
                  <View key={group.key}>
                    <GroupHeader label={group.label} />
                    {systemMilestone && <MilestoneMarker milestone={systemMilestone} />}
                    {group.entries.map((entry, entryIndex) => (
                      <JourneyCard
                        key={entry.id}
                        entry={entry}
                        delay={groupIndex * 60 + entryIndex * 80}
                        onToggleKeptClose={() => handleToggleKeptClose(entry.id)}
                        onSetMilestone={(tag) => handleSetMilestone(entry.id, tag)}
                      />
                    ))}
                  </View>
                );
              })}
            </View>
          </>
        )}
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
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -1.4,
    lineHeight: 58,
    marginBottom: 10,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    marginBottom: 12,
  },

  // Privacy nudge
  privacyNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 28,
  },
  privacyNudgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.sage,
    opacity: 0.6,
  },
  privacyNudgeText: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    letterSpacing: 0.1,
  },

  captureCTA: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 30,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  captureCTAInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  captureCTAIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureCTAText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textWarm,
    fontFamily: 'Inter_500Medium',
  },

  // "Moments kept close" section
  keptCloseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  keptCloseMark: {
    fontSize: 13,
    color: Colors.primary,
    opacity: 0.7,
  },
  keptCloseTitle: {
    fontSize: 13,
    color: Colors.textWarm,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.2,
  },
  keptCloseSubtitle: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  keptCloseDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 28,
    marginTop: 4,
  },

  timeline: { gap: 0 },

  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  groupHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  groupHeaderLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  milestone: {
    marginBottom: 14,
    borderRadius: Colors.radius.lg,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  milestoneInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: Colors.radius.lg,
  },
  milestoneDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    opacity: 0.6,
    flexShrink: 0,
  },
  milestoneText: { flex: 1 },
  milestoneLabel: {
    fontSize: 14,
    color: Colors.textWarm,
    fontFamily: 'Inter_500Medium',
    marginBottom: 2,
  },
  milestoneNote: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 16,
    position: 'relative',
  },
  emptyOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.peachLight,
    opacity: 0.18,
    top: 20,
  },
  emptyIcon: { fontSize: 36, marginBottom: 24 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    textAlign: 'center',
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 14,
  },
  emptySubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 36,
  },
  emptyCTA: {
    backgroundColor: Colors.primary,
    borderRadius: Colors.radius.full,
    paddingVertical: 16,
    paddingHorizontal: 36,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    elevation: 5,
  },
  emptyCTAText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { AmbientOrb } from '@/components/AmbientOrb';
import { useBloom } from '@/context/BloomContext';
import { getTrimester } from '@/constants/emotionalContent';
import { getReflectionCount, exportSnapshot } from '@/stores/reflectionStore';
import ExportModal from '@/components/ExportModal';
import { MemoryBookInput } from '@/utils/memoryBookHtml';

const TRIMESTER_NOTES: Record<1 | 2 | 3, string> = {
  1: 'First trimester — the quiet beginning.',
  2: 'Second trimester — coming alive.',
  3: 'Third trimester — almost there.',
};

// ─── Privacy points ───────────────────────────────────────────────────────────

function PrivacyPoint({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.privacyPoint}>
      <View style={styles.privacyIconWrap}>
        <Ionicons name={icon} size={14} color={Colors.sage} />
      </View>
      <Text style={styles.privacyPointText}>{text}</Text>
    </View>
  );
}

// ─── Offline indicator ────────────────────────────────────────────────────────

function OfflineIndicator() {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 2200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.offlineIndicator}>
      <Animated.View style={[styles.offlineDot, { opacity: pulseAnim }]} />
      <Text style={styles.offlineText}>Offline · Local only</Text>
    </View>
  );
}

// ─── Clear modal ──────────────────────────────────────────────────────────────

function ClearModal({
  visible,
  onKeep,
  onClear,
}: {
  visible: boolean;
  onKeep: () => void;
  onClear: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 20, stiffness: 120, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onKeep}>
      <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.modalDecor} />

          <View style={styles.modalIconWrap}>
            <LinearGradient colors={['#FDE8DF', '#F8D8CB']} style={styles.modalIconGradient}>
              <Text style={styles.modalIconEmoji}>✿</Text>
            </LinearGradient>
          </View>

          <Text style={styles.modalTitle}>Clear your journey?</Text>
          <Text style={styles.modalBody}>
            This will remove all your data from this device. Nothing is sent anywhere — it was only ever yours. You can always begin again whenever you're ready.
          </Text>

          <TouchableOpacity
            style={styles.modalPrimaryBtn}
            onPress={onKeep}
            activeOpacity={0.85}
          >
            <Text style={styles.modalPrimaryBtnText}>Keep my journey</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalGhostBtn}
            onPress={onClear}
            activeOpacity={0.7}
          >
            <Text style={styles.modalGhostBtnText}>Clear everything</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Export CTA card ──────────────────────────────────────────────────────────

function ExportCTACard({ onPress }: { onPress: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scaleAnim, { toValue: 0.977, damping: 22, stiffness: 160, useNativeDriver: true }).start();
  }
  function handlePressOut() {
    Animated.spring(scaleAnim, { toValue: 1, damping: 22, stiffness: 160, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[styles.exportCardWrap, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel="Export your journey — create a memory book"
      >
        <LinearGradient
          colors={['#FBF0EA', '#F5E4D6', '#F0D8C8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.exportCard}
        >
          <View style={styles.exportCardDecor1} />
          <View style={styles.exportCardDecor2} />

          <View style={styles.exportCardLeft}>
            <View style={styles.exportIconWrap}>
              <LinearGradient colors={['#F5CBB4', '#EDBFA4']} style={styles.exportIconGradient}>
                <Text style={styles.exportIconGlyph}>✦</Text>
              </LinearGradient>
            </View>
            <View style={styles.exportTextWrap}>
              <Text style={styles.exportCardTitle}>Export your journey</Text>
              <Text style={styles.exportCardSub}>
                A quiet keepsake of the moments you've carried.
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textSoft} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, pregnancyWeek, clearJourney } = useBloom();
  const [showClearModal, setShowClearModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportInput, setExportInput] = useState<MemoryBookInput | null>(null);
  const [reflectionCount, setReflectionCount] = useState<number | null>(null);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(22)).current;
  const card1Fade = useRef(new Animated.Value(0)).current;
  const card1Slide = useRef(new Animated.Value(20)).current;
  const card2Fade = useRef(new Animated.Value(0)).current;
  const card2Slide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    getReflectionCount().then(setReflectionCount);
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, damping: 22, stiffness: 110, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(card1Fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(card1Slide, { toValue: 0, damping: 22, useNativeDriver: true }),
      ]).start();
    }, 160);

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(card2Fade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(card2Slide, { toValue: 0, damping: 22, useNativeDriver: true }),
      ]).start();
    }, 300);
  }, []);

  async function handleClear() {
    setShowClearModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await new Promise((r) => setTimeout(r, 300));
    await clearJourney();
  }

  async function handleExportPress() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const snapshot = await exportSnapshot();
    const input: MemoryBookInput = {
      userName: user.name ?? '',
      pregnancyWeek: pregnancyWeek ?? 0,
      entries: snapshot.entries,
      generatedAt: new Date(),
    };
    setExportInput(input);
    setShowExportModal(true);
  }

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : 0;
  const trimester = getTrimester(pregnancyWeek || 18);

  return (
    <LinearGradient colors={['#FBF7F0', '#F5EDE0', '#F0E5D5']} style={styles.container}>
      <AmbientOrb
        size={220}
        color={Colors.peachLight}
        opacity={0.28}
        phaseSeed={0.1}
        style={{ top: -90, right: -70 }}
      />
      <AmbientOrb
        size={160}
        color={Colors.lavenderLight}
        opacity={0.18}
        phaseSeed={0.55}
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
          <Text style={styles.eyebrow}>Your sanctuary</Text>
          <Text style={styles.pageTitle}>Sanctuary</Text>
          <Text style={styles.pageSubtitle}>
            Your journey stays with you.{'\n'}Quiet, private, and always yours.
          </Text>
          <OfflineIndicator />
        </Animated.View>

        {/* Privacy card */}
        <Animated.View
          style={[styles.privacyCard, { opacity: card1Fade, transform: [{ translateY: card1Slide }] }]}
        >
          <LinearGradient colors={['#FFFFFF', '#FDF8F3']} style={styles.privacyCardInner}>
            <View style={styles.privacyCardDecor} />

            <View style={styles.privacyCardHeader}>
              <View style={styles.privacyCardIconWrap}>
                <LinearGradient colors={['#D5EDD5', '#C4E2C4']} style={styles.privacyCardIcon}>
                  <Ionicons name="leaf" size={17} color={Colors.sage} />
                </LinearGradient>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.privacyCardLabel}>Privacy</Text>
                <Text style={styles.privacyCardTitle}>Everything stays here</Text>
              </View>
            </View>

            <Text style={styles.privacyCardBody}>
              Bloom stores your journey only on this device. Nothing is shared, uploaded, or sold — ever. Not now, not later. Your words are yours alone.
            </Text>

            <View style={styles.divider} />

            <View style={styles.privacyPoints}>
              <PrivacyPoint icon="phone-portrait-outline" text="Stored only on your phone" />
              <PrivacyPoint icon="person-remove-outline" text="No account required" />
              <PrivacyPoint icon="wifi-outline" text="No internet needed — ever" />
              <PrivacyPoint icon="eye-off-outline" text="No tracking, no data collection" />
              <PrivacyPoint icon="lock-closed-outline" text="Your words are yours alone" />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Journey card */}
        {user.name ? (
          <Animated.View
            style={[styles.journeyCard, { opacity: card1Fade, transform: [{ translateY: card1Slide }] }]}
          >
            <LinearGradient colors={['#FBF2EC', '#F7E8DE']} style={styles.journeyCardInner}>
              <View style={styles.journeyCardDecor} />
              <Text style={styles.journeyGreeting}>{user.name}'s journey</Text>
              <Text style={styles.journeyWeek}>Week {pregnancyWeek}</Text>
              <Text style={styles.journeyNote}>{TRIMESTER_NOTES[trimester]}</Text>

              {reflectionCount !== null && reflectionCount > 0 ? (
                <View style={styles.journeySummary}>
                  <View style={styles.journeySummaryDivider} />
                  <Text style={styles.journeySummaryLabel}>Your journey so far</Text>
                  <Text style={styles.journeySummaryValue}>
                    {reflectionCount === 1
                      ? '1 moment shared'
                      : `${reflectionCount} moments shared`}
                  </Text>
                  <Text style={styles.journeySummaryNote}>
                    Each one held safely, only here.
                  </Text>
                </View>
              ) : null}
            </LinearGradient>
          </Animated.View>
        ) : null}

        {/* ── Export your journey ── */}
        <Animated.View style={{ opacity: card1Fade, transform: [{ translateY: card1Slide }] }}>
          <Text style={styles.sectionLabel}>Memory</Text>
          <ExportCTACard onPress={handleExportPress} />
        </Animated.View>

        {/* Fresh start section */}
        <Animated.View
          style={[styles.freshSection, { opacity: card2Fade, transform: [{ translateY: card2Slide }] }]}
        >
          <Text style={styles.freshLabel}>If you ever need to</Text>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowClearModal(true);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Clear my journey — removes all data from this device"
          >
            <View style={styles.clearButtonInner}>
              <View style={styles.clearButtonIconWrap}>
                <Ionicons name="refresh-outline" size={17} color={Colors.textSoft} />
              </View>
              <Text style={styles.clearButtonText}>Clear my journey</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </View>
          </TouchableOpacity>

          <Text style={styles.clearHint}>
            Removes all your data from this device.{'\n'}Nothing is sent anywhere — it simply goes.
          </Text>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: card2Fade }]}>
          <Text style={styles.footerPrivacyLine}>Your journey stays with you.</Text>
          <Text style={styles.footerText}>Bloom · Version 1.0</Text>
          <Text style={styles.footerSub}>Made with care, for you.</Text>
        </Animated.View>
      </ScrollView>

      <ClearModal
        visible={showClearModal}
        onKeep={() => setShowClearModal(false)}
        onClear={handleClear}
      />

      <ExportModal
        visible={showExportModal}
        input={exportInput}
        onClose={() => setShowExportModal(false)}
      />
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
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -1.2,
    lineHeight: 54,
    marginBottom: 12,
  },
  pageSubtitle: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    marginBottom: 12,
  },

  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 32,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.sage,
  },
  offlineText: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.2,
  },

  privacyCard: {
    borderRadius: Colors.radius.xl,
    marginBottom: 14,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
    overflow: 'hidden',
  },
  privacyCardInner: {
    borderRadius: Colors.radius.xl,
    padding: 24,
    overflow: 'hidden',
  },
  privacyCardDecor: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(168,196,168,0.06)',
    top: -60,
    right: -50,
  },
  privacyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  privacyCardIconWrap: {
    shadowColor: Colors.sage,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 3,
  },
  privacyCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCardLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  privacyCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -0.3,
  },
  privacyCardBody: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 24,
    marginBottom: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 18,
  },
  privacyPoints: { gap: 12 },
  privacyPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  privacyIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: Colors.sageLight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  privacyPointText: {
    fontSize: 14,
    color: Colors.textWarm,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },

  journeyCard: {
    borderRadius: Colors.radius.xl,
    marginBottom: 14,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
    overflow: 'hidden',
  },
  journeyCardInner: {
    borderRadius: Colors.radius.xl,
    padding: 24,
    overflow: 'hidden',
  },
  journeyCardDecor: {
    position: 'absolute',
    bottom: -40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(212,136,112,0.07)',
  },
  journeyGreeting: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  journeyWeek: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -1,
    lineHeight: 48,
    marginBottom: 6,
  },
  journeyNote: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
  journeySummary: { marginTop: 18 },
  journeySummaryDivider: {
    height: 1,
    backgroundColor: 'rgba(212,136,112,0.15)',
    marginBottom: 14,
  },
  journeySummaryLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  journeySummaryValue: {
    fontSize: 15,
    color: Colors.textWarm,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  journeySummaryNote: {
    fontSize: 12,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },

  // ── Export card ──
  sectionLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  exportCardWrap: {
    borderRadius: Colors.radius.xl,
    marginBottom: 28,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    overflow: 'hidden',
  },
  exportCard: {
    borderRadius: Colors.radius.xl,
    paddingHorizontal: 20,
    paddingVertical: 22,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  exportCardDecor1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.22)',
    top: -70,
    right: -50,
  },
  exportCardDecor2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    bottom: -30,
    left: 30,
  },
  exportCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginRight: 8,
  },
  exportIconWrap: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 7,
    elevation: 3,
    flexShrink: 0,
  },
  exportIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportIconGlyph: {
    fontSize: 18,
    color: Colors.primary,
  },
  exportTextWrap: { flex: 1 },
  exportCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  exportCardSub: {
    fontSize: 13,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    lineHeight: 19,
    fontStyle: 'italic',
  },

  freshSection: {
    marginTop: 0,
    marginBottom: 8,
  },
  freshLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  clearButton: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 12,
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  clearButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  clearButtonIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textWarm,
    fontFamily: 'Inter_500Medium',
  },
  clearHint: {
    fontSize: 13,
    color: Colors.textLight,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    paddingHorizontal: 4,
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 4,
  },
  footerPrivacyLine: {
    fontSize: 14,
    color: Colors.textSoft,
    fontFamily: 'CormorantGaramond_400Regular',
    fontStyle: 'italic',
    letterSpacing: 0.1,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSoft,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.3,
  },
  footerSub: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter_400Regular',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45,31,23,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderRadius: Colors.radius.xl,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 40,
    elevation: 20,
  },
  modalDecor: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(212,136,112,0.05)',
    top: -80,
    right: -60,
  },
  modalIconWrap: {
    marginBottom: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  modalIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalIconEmoji: { fontSize: 28 },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  modalBody: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  modalPrimaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Colors.radius.full,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.26,
    shadowRadius: 12,
    elevation: 5,
  },
  modalPrimaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },
  modalGhostBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalGhostBtnText: {
    fontSize: 15,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
});

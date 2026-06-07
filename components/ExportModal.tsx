/**
 * ExportModal — Memory Book PDF generation and share flow.
 *
 * States: idle → generating → sharing → done | error
 * Keeps the experience calm and emotionally clean.
 * Everything runs locally — no uploads, no cloud.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { buildMemoryBookHtml, MemoryBookInput } from '@/utils/memoryBookHtml';

// Lazy-import platform modules to avoid crashing on web
async function generateAndShare(html: string): Promise<void> {
  if (Platform.OS === 'web') {
    // On web: open a new window with the HTML (printable via browser)
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);
      });
    }
    return;
  }

  // Native: expo-print → PDF file → expo-sharing
  const Print = await import('expo-print');
  const Sharing = await import('expo-sharing');

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(uri, {
    UTI: 'com.adobe.pdf',
    mimeType: 'application/pdf',
    dialogTitle: 'Your Bloom Memory Book',
  });
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ExportStep = 'idle' | 'generating' | 'done' | 'error';

interface ExportModalProps {
  visible: boolean;
  input: MemoryBookInput | null;
  onClose: () => void;
}

// ─── Gentle pulsing loader ─────────────────────────────────────────────────

function BloomLoader() {
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.6, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
    return () => pulse.stopAnimation();
  }, []);

  return (
    <Animated.Text style={[styles.loaderFloral, { opacity: pulse }]}>
      ✿
    </Animated.Text>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export default function ExportModal({ visible, input, onClose }: ExportModalProps) {
  const [step, setStep] = useState<ExportStep>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('idle');
      setErrorMsg('');
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 22, stiffness: 120, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  async function handleGenerate() {
    if (!input) return;
    setStep('generating');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Build HTML on the JS thread — typically <200ms
      const html = buildMemoryBookHtml(input);

      // Generate PDF + share
      await generateAndShare(html);

      setStep('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(message);
      setStep('error');
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => setStep('idle'), 300);
  }

  const entryCount = input?.entries.length ?? 0;
  const hasEntries = entryCount > 0;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={step === 'generating' ? undefined : handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.cardDecor} />

          {/* ── Idle state ── */}
          {step === 'idle' && (
            <>
              <View style={styles.iconWrap}>
                <LinearGradient colors={['#FDE8DF', '#F8D8CB']} style={styles.iconGradient}>
                  <Text style={styles.iconEmoji}>✦</Text>
                </LinearGradient>
              </View>

              <Text style={styles.title}>Your Memory Book</Text>
              <Text style={styles.body}>
                {hasEntries
                  ? `A quiet keepsake of your pregnancy journey — ${entryCount === 1 ? '1 moment' : `${entryCount} moments`} gathered together.`
                  : 'Your journey is just beginning. Check in with Bloom a few times and your memory book will be ready to create.'}
              </Text>

              {hasEntries && (
                <Text style={styles.privacyNote}>
                  Created entirely on your device.{'\n'}Nothing leaves, nothing is shared without you.
                </Text>
              )}

              {hasEntries ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleGenerate}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>Create memory book</Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity style={styles.ghostBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.ghostBtnText}>{hasEntries ? 'Not just yet' : 'Close'}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Generating state ── */}
          {step === 'generating' && (
            <>
              <BloomLoader />
              <Text style={styles.title}>Creating your book</Text>
              <Text style={styles.body}>
                Gathering your moments into something beautiful.{'\n'}Just a moment...
              </Text>
              <Text style={styles.privacyNote}>
                Everything happens here, on your device.
              </Text>
            </>
          )}

          {/* ── Done state ── */}
          {step === 'done' && (
            <>
              <View style={styles.iconWrap}>
                <LinearGradient colors={['#D5EDD5', '#C4E2C4']} style={styles.iconGradient}>
                  <Text style={styles.iconEmoji}>✿</Text>
                </LinearGradient>
              </View>
              <Text style={styles.title}>Your book is ready</Text>
              <Text style={styles.body}>
                Your memory book is on its way. You can save, share, or print it from the share sheet.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleGenerate}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Create again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.ghostBtnText}>Done</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Error state ── */}
          {step === 'error' && (
            <>
              <View style={styles.iconWrap}>
                <LinearGradient colors={['#F5CECE', '#F0B8B8']} style={styles.iconGradient}>
                  <Text style={styles.iconEmoji}>✦</Text>
                </LinearGradient>
              </View>
              <Text style={styles.title}>Something interrupted</Text>
              <Text style={styles.body}>
                Something interrupted the export. Please try again gently.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleGenerate}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={handleClose} activeOpacity={0.7}>
                <Text style={styles.ghostBtnText}>Not now</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45,31,23,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  card: {
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
  cardDecor: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(212,136,112,0.05)',
    top: -80,
    right: -60,
  },

  iconWrap: {
    marginBottom: 22,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  iconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 26,
    color: Colors.primary,
  },

  loaderFloral: {
    fontSize: 44,
    color: Colors.primary,
    marginBottom: 24,
    marginTop: 4,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  body: {
    fontSize: 15,
    color: Colors.textMuted,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  privacyNote: {
    fontSize: 12,
    color: Colors.textLight,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 24,
  },

  primaryBtn: {
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
  primaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
  },

  ghostBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: 15,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    letterSpacing: 0.1,
  },
});

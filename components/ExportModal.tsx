/**
 * ExportModal — Memory Book PDF generation and share flow.
 *
 * States: idle → generating → done | error
 * PDF generation and share are split so the WebView can finish before
 * the system share sheet opens (reduces Android first-run failures).
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
  InteractionManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { buildMemoryBookHtml, MemoryBookInput } from '@/utils/memoryBookHtml';

// ─── Native module warmup (avoids cold-start delay on first export) ───────────

let nativeModulesWarmup: Promise<void> | null = null;

/** Call when the user shows interest in export — warms native modules early. */
export function warmupExportModules(): void {
  if (Platform.OS === 'web') return;
  if (!nativeModulesWarmup) {
    nativeModulesWarmup = Promise.all([
      import('expo-print'),
      import('expo-sharing'),
    ]).then(() => undefined);
  }
}

function warmupNativeModules(): void {
  warmupExportModules();
}

async function ensureNativeModulesReady(): Promise<void> {
  warmupNativeModules();
  await nativeModulesWarmup;
}

// ─── PDF + share helpers ──────────────────────────────────────────────────────

async function generatePdf(html: string): Promise<string> {
  if (Platform.OS === 'web') {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.addEventListener('load', () => {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      });
    }
    return url;
  }

  await ensureNativeModulesReady();
  const Print = await import('expo-print');
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

function isShareCancellation(err: unknown): boolean {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return (
    message.includes('cancel') ||
    message.includes('dismiss') ||
    message.includes('did not share') ||
    message.includes('user denied') ||
    message.includes('abort')
  );
}

async function sharePdf(uri: string): Promise<'shared' | 'cancelled'> {
  if (Platform.OS === 'web') return 'shared';

  const Sharing = await import('expo-sharing');
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }

  try {
    await Sharing.shareAsync(uri, {
      UTI: 'com.adobe.pdf',
      mimeType: 'application/pdf',
      dialogTitle: 'Your Bloom Memory Book',
    });
    return 'shared';
  } catch (err) {
    if (isShareCancellation(err)) return 'cancelled';
    throw err;
  }
}

/** Brief pause so the UI can paint "done" before the share sheet steals focus. */
function waitForUiSettle(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => setTimeout(resolve, 150));
    });
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
  const pdfUriRef = useRef<string | null>(null);

  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setStep('idle');
      setErrorMsg('');
      pdfUriRef.current = null;
      warmupNativeModules();
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, damping: 24, stiffness: 88, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  async function handleGenerate() {
    if (!input) return;
    setStep('generating');
    setErrorMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await ensureNativeModulesReady();
      const html = buildMemoryBookHtml(input);
      const uri = await generatePdf(html);
      pdfUriRef.current = uri;

      // PDF is ready — update UI before opening the share sheet
      setStep('done');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (Platform.OS !== 'web') {
        await waitForUiSettle();
        const shareResult = await sharePdf(uri);
        if (__DEV__ && shareResult === 'cancelled') {
          console.log('[Bloom Export] Share sheet dismissed — PDF was still created.');
        }
      }
    } catch (err) {
      if (__DEV__) {
        console.error('[Bloom Export] Export failed:', err);
      }
      const message = err instanceof Error ? err.message : 'Unknown error';
      setErrorMsg(message);
      setStep('error');
    }
  }

  async function handleShareAgain() {
    const uri = pdfUriRef.current;
    if (!uri || Platform.OS === 'web') return;
    try {
      await sharePdf(uri);
    } catch (err) {
      if (__DEV__) {
        console.error('[Bloom Export] Re-share failed:', err);
      }
      if (!isShareCancellation(err)) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setErrorMsg(message);
        setStep('error');
      }
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => setStep('idle'), 300);
  }

  const entryCount = input?.entries.length ?? 0;
  const hasEntries = entryCount > 0;
  const isBusy = step === 'generating';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={isBusy ? undefined : handleClose}
    >
      <View style={styles.backdrop}>
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
                  Gathering your moments into something beautiful.{'\n'}
                  The first time may take a little longer —{'\n'}please stay with this screen.
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
                  {Platform.OS === 'web'
                    ? 'Your memory book opened in a new tab. You can print or save it from your browser.'
                    : 'Your memory book was created on this device. Use the share sheet to save, send, or print it.'}
                </Text>
                {Platform.OS !== 'web' && pdfUriRef.current ? (
                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleShareAgain}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.primaryBtnText}>Share again</Text>
                  </TouchableOpacity>
                ) : null}
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
                  The export didn't complete. Please try again whenever you're ready.
                </Text>
                {__DEV__ && errorMsg ? (
                  <Text style={styles.devError}>{errorMsg}</Text>
                ) : null}
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45,31,23,0.52)',
  },
  overlay: {
    flex: 1,
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
  devError: {
    fontSize: 11,
    color: Colors.textLight,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
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

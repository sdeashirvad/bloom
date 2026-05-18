import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { BloomCard } from '@/components/BloomCard';
import { BabyIllustration } from '@/components/BabyIllustration';
import { TrimesterBadge } from '@/components/TrimesterBadge';
import { AmbientOrb } from '@/components/AmbientOrb';
import { useBloom } from '@/context/BloomContext';
import { getWeekData } from '@/constants/weekData';
import { getTrimester, TRIMESTER_DATA } from '@/constants/emotionalContent';

const TRIMESTER_BG: Record<1 | 2 | 3, [string, string, string]> = {
  1: ['#FBF5EE', '#F6ECE0', '#F1E4D6'],
  2: ['#F4EFF8', '#EDE8F5', '#F8F4FC'],
  3: ['#EEF5F0', '#E6EFE8', '#F2F7F3'],
};

const TRIMESTER_ORB1: Record<1 | 2 | 3, string> = {
  1: '#F0C4A8',
  2: '#D8C8F0',
  3: '#B8D8C0',
};

const TRIMESTER_ORB2: Record<1 | 2 | 3, string> = {
  1: '#E8D0E8',
  2: '#C8B8E8',
  3: '#A8C8B8',
};

interface InfoSectionProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  label: string;
  title: string;
  body: string;
  delay?: number;
}

function InfoSection({ icon, iconBg, iconColor, label, title, body, delay = 0 }: InfoSectionProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 100, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <BloomCard style={styles.section} variant="white" padding={22}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={17} color={iconColor} />
          </View>
          <View style={styles.sectionMeta}>
            <Text style={styles.sectionLabel}>{label}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        </View>
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionBody}>{body}</Text>
      </BloomCard>
    </Animated.View>
  );
}

export default function WeekScreen() {
  const insets = useSafeAreaInsets();
  const { pregnancyWeek } = useBloom();
  const week = pregnancyWeek || 18;
  const weekData = getWeekData(week);
  const trimester = getTrimester(week);
  const trimesterData = TRIMESTER_DATA[trimester];
  const bgGradient = TRIMESTER_BG[trimester];

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 640, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, damping: 22, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const topPad = insets.top + (Platform.OS === 'web' ? 67 : 0);
  const bottomPad = Platform.OS === 'web' ? 34 : 0;

  return (
    <LinearGradient colors={bgGradient} style={styles.container}>
      <AmbientOrb
        size={200}
        color={TRIMESTER_ORB1[trimester]}
        opacity={0.18}
        phaseSeed={0.15}
        style={{ top: -70, right: -60 }}
      />
      <AmbientOrb
        size={150}
        color={TRIMESTER_ORB2[trimester]}
        opacity={0.15}
        phaseSeed={0.6}
        style={{ bottom: 220, left: -50 }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 28, paddingBottom: bottomPad + 110 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: headerFade, transform: [{ translateY: headerSlide }] }}>
          <TrimesterBadge week={week} />
          <Text style={styles.pageTitle}>Week {weekData.week}</Text>
          <Text style={styles.trimesterAffirmation}>{trimesterData.affirmation}</Text>

          {/* Baby banner */}
          <LinearGradient
            colors={['#ECE3F5', '#E0D4EE', '#D8CCE8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.weekBanner}
          >
            <View style={styles.bannerDecorRing} />

            <View style={styles.bannerLeft}>
              <Text style={styles.bannerEyebrow}>Baby is the size of</Text>
              <Text style={styles.bannerSize}>{weekData.babySize}</Text>
              <Text style={styles.bannerDetail}>{weekData.babySizeDetail}</Text>
            </View>
            <View style={styles.bannerRight}>
              <BabyIllustration week={week} size={120} />
            </View>
          </LinearGradient>
        </Animated.View>

        <InfoSection
          icon="sparkles-outline"
          iconBg={Colors.lavenderLight}
          iconColor={Colors.lavender}
          label="Baby's development"
          title="Growing beautifully"
          body={weekData.babyDevelopment}
          delay={200}
        />

        <InfoSection
          icon="body-outline"
          iconBg={Colors.peachLight}
          iconColor={Colors.primary}
          label="Your body this week"
          title="What you might notice"
          body={weekData.bodyChanges}
          delay={320}
        />

        <InfoSection
          icon="heart-outline"
          iconBg={Colors.sageLight}
          iconColor={Colors.sage}
          label="A gentle suggestion"
          title="For you today"
          body={weekData.selfCareTip}
          delay={440}
        />

        <Animated.View style={{ opacity: headerFade }}>
          <LinearGradient
            colors={['#FDF3EE', '#F9E8DC']}
            style={styles.emotionalCard}
          >
            <View style={styles.emotionalDecorTop} />
            <View style={styles.emotionalDecorBottom} />
            <Text style={styles.emotionalQuote}>"</Text>
            <Text style={styles.emotionalText}>{weekData.emotionalNote}</Text>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 22 },

  pageTitle: {
    fontSize: 52,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -1.5,
    fontFamily: 'CormorantGaramond_700Bold',
    lineHeight: 58,
    marginBottom: 6,
  },
  trimesterAffirmation: {
    fontSize: 15,
    color: Colors.textSoft,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 24,
    fontStyle: 'italic',
  },

  weekBanner: {
    borderRadius: Colors.radius.xl,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#9060B0',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 7,
  },
  bannerDecorRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -80,
    left: -60,
  },
  bannerLeft: { flex: 1, paddingRight: 10 },
  bannerRight: {},
  bannerEyebrow: {
    fontSize: 11,
    color: 'rgba(80,50,110,0.65)',
    fontFamily: 'Inter_500Medium',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  bannerSize: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3D2060',
    fontFamily: 'CormorantGaramond_700Bold',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  bannerDetail: {
    fontSize: 14,
    color: 'rgba(80,50,110,0.55)',
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
  },

  section: { marginBottom: 12 },
  sectionHeader: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionMeta: { flex: 1, gap: 3 },
  sectionLabel: {
    fontSize: 11,
    color: Colors.textSoft,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'CormorantGaramond_700Bold',
    letterSpacing: -0.3,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 14,
  },
  sectionBody: {
    fontSize: 15,
    color: Colors.textMuted,
    lineHeight: 25,
    fontFamily: 'Inter_400Regular',
  },

  emotionalCard: {
    borderRadius: Colors.radius.xl,
    padding: 30,
    marginTop: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  emotionalDecorTop: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(212,136,112,0.06)',
  },
  emotionalDecorBottom: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(196,168,200,0.07)',
  },
  emotionalQuote: {
    fontSize: 72,
    color: Colors.primarySoft,
    lineHeight: 58,
    fontFamily: 'CormorantGaramond_700Bold',
    marginBottom: 4,
  },
  emotionalText: {
    fontSize: 23,
    color: Colors.textWarm,
    lineHeight: 34,
    fontFamily: 'CormorantGaramond_600SemiBold',
    letterSpacing: -0.3,
  },
});

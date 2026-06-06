import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BloomProvider, useBloom } from '@/context/BloomContext';

SplashScreen.preventAutoHideAsync();

/**
 * Guards navigation — only runs after BOTH fonts and AsyncStorage hydration
 * are complete. Uses inOnboarding (a stable boolean) as dependency rather than
 * the full segments array reference, so it doesn't re-run on every tab change.
 */
function NavigationGuard() {
  const { user, isLoading } = useBloom();
  const segments = useSegments();
  const router = useRouter();
  const inOnboarding = segments[0] === 'onboarding';

  useEffect(() => {
    if (isLoading) return;
    if (!user.hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (user.hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.hasCompletedOnboarding, isLoading, inOnboarding]);

  return null;
}

/**
 * Keeps the splash screen visible until BOTH fonts AND Bloom's AsyncStorage
 * hydration are complete. This prevents the brief flash of the default route
 * before NavigationGuard can redirect to onboarding.
 *
 * Must live inside BloomProvider to access isLoading.
 */
function SplashController({ fontsReady }: { fontsReady: boolean }) {
  const { isLoading } = useBloom();
  const splashHidden = useRef(false);

  useEffect(() => {
    if (fontsReady && !isLoading && !splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync();
    }
  }, [fontsReady, isLoading]);

  return null;
}

export default function RootLayoutNav() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const fontsReady = fontsLoaded || !!fontError;

  // Hold the entire tree until fonts are loaded — splash stays visible.
  // BloomProvider mounts here and handles the storage hydration gate.
  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BloomProvider>
          {/* Delays splash hide until fonts + storage both ready */}
          <SplashController fontsReady={fontsReady} />
          {/* Guards routing until storage hydration finishes */}
          <NavigationGuard />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 280,
            }}
          >
            <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
            <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          </Stack>
          <StatusBar style="dark" translucent />
        </BloomProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

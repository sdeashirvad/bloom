import { useEffect } from 'react';
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

// Only redirects after BOTH fonts and storage are ready — prevents hydration glitch
function NavigationGuard() {
  const { user, isLoading } = useBloom();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!user.hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (user.hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [user.hasCompletedOnboarding, isLoading, segments]);

  return null;
}

function RootLayoutNav() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Hold splash until fonts resolve — BloomProvider handles storage hydration gate
  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BloomProvider>
          <NavigationGuard />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              animationDuration: 300,
            }}
          >
            <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
            <Stack.Screen name="(tabs)" />
          </Stack>
          <StatusBar style="dark" />
        </BloomProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayoutNav;

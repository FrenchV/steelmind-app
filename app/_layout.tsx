import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider } from '@/contexts/AppContext';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { useUserPreferences } from '@/hooks/useUserPreferences';

function AppContent() {
  const { needsOnboarding, completeOnboarding } = useUserPreferences();
  const showOnboarding = needsOnboarding();

  if (showOnboarding) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AppProvider>
      <AppContent />
      <StatusBar style="light" backgroundColor="#1A1B3A" />
    </AppProvider>
  );
}

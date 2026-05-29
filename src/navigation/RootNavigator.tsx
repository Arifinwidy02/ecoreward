import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuthStore } from '../stores/useAuthStore';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isLoading, init, isFirstLaunch, setFirstLaunchComplete } = useAuthStore();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    const unsub = init();
    return unsub;
  }, []);

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (isLoading) {
    return null;
  }

  const isAuthenticated = !!session;
  const showOnboarding = isAuthenticated && isFirstLaunch;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : showOnboarding ? (
          <Stack.Screen name="Onboarding">
            {() => <OnboardingNavigator onComplete={setFirstLaunchComplete} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

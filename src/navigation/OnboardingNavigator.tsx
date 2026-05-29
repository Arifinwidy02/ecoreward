import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingStackParamList } from '../types/navigation';
import { OnboardingScreen } from '../screens/OnboardingScreen';

const Stack = createStackNavigator<OnboardingStackParamList>();

interface Props {
  onComplete: () => void;
}

export function OnboardingNavigator({ onComplete }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingSlides">
        {() => <OnboardingScreen onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

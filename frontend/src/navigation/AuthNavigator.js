import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen   from '../screens/auth/OnboardingScreen';
import RoleSelectScreen   from '../screens/auth/RoleSelectScreen';
import AuthLandingScreen  from '../screens/auth/AuthLandingScreen'; // kept as fallback
import StudentLoginScreen from '../screens/auth/StudentLoginScreen';
import AdminLoginScreen   from '../screens/auth/AdminLoginScreen';
import StudentSignupScreen from '../screens/auth/StudentSignupScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {/* Entry: onboarding slides */}
      <Stack.Screen name="Onboarding"    component={OnboardingScreen}   options={{ animation: 'fade' }} />
      {/* Role picker */}
      <Stack.Screen name="RoleSelect"    component={RoleSelectScreen}   />
      {/* Login / Signup */}
      <Stack.Screen name="StudentLogin"  component={StudentLoginScreen} />
      <Stack.Screen name="AdminLogin"    component={AdminLoginScreen}   />
      <Stack.Screen name="StudentSignup" component={StudentSignupScreen}/>
    </Stack.Navigator>
  );
}

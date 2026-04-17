import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthLandingScreen from '../screens/auth/AuthLandingScreen';
import StudentLoginScreen from '../screens/auth/StudentLoginScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import StudentSignupScreen from '../screens/auth/StudentSignupScreen';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
      <Stack.Screen name="StudentSignup" component={StudentSignupScreen} />
    </Stack.Navigator>
  );
}

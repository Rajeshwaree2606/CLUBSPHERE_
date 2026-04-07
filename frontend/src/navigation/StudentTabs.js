import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/student/HomeScreen';
import ClubsScreen from '../screens/student/ClubsScreen';
import EventsScreen from '../screens/student/EventsScreen';
import LeaderboardScreen from '../screens/student/LeaderboardScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import EventDetailsScreen from '../screens/student/EventDetailsScreen';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList" component={EventsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ presentation: 'modal' }}/>
    </Stack.Navigator>
  );
}

export default function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      headerStyle: { backgroundColor: theme.colors.surface },
      headerTintColor: theme.colors.primary,
      headerTitleStyle: { fontWeight: '800' },
      tabBarStyle: { borderTopWidth: 1, borderColor: theme.colors.border }
    }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant" color={color} size={size} /> }} />
      <Tab.Screen name="Clubs" component={ClubsScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="google-circles-extended" color={color} size={size} /> }} />
      <Tab.Screen name="Events" component={EventsStack} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar-star" color={color} size={size} /> }} />
      <Tab.Screen name="Ranks" component={LeaderboardScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="trophy" color={color} size={size} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle-outline" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ClubsScreen from '../screens/admin/ClubsScreen';
import EventsScreen from '../screens/admin/EventsScreen';
import BudgetScreen from '../screens/admin/BudgetScreen';
import EventAttendanceScreen from '../screens/admin/EventAttendanceScreen';
import AnnouncementsScreen from '../screens/admin/AnnouncementsScreen';
import { theme } from '../utils/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminEventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminEventsList" component={EventsScreen} />
      <Stack.Screen name="EventAttendance" component={EventAttendanceScreen} />
    </Stack.Navigator>
  );
}

export default function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      headerStyle: { backgroundColor: theme.colors.primary },
      headerTintColor: theme.colors.surface,
      headerTitleStyle: { fontWeight: '800' },
    }}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="view-dashboard" color={color} size={size} /> }} />
      <Tab.Screen name="Clubs" component={ClubsScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-group" color={color} size={size} /> }} />
      <Tab.Screen name="Events" component={AdminEventsStack} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="calendar-edit" color={color} size={size} /> }} />
      <Tab.Screen name="Budget" component={BudgetScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="finance" color={color} size={size} /> }} />
      <Tab.Screen name="Alerts" component={AnnouncementsScreen} options={{ tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="bullhorn" color={color} size={size} /> }} />
    </Tab.Navigator>
  );
}

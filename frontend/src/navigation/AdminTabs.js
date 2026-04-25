import React, { useContext } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS } from '../utils/theme';

import DashboardScreen        from '../screens/admin/DashboardScreen';
import ClubsScreen            from '../screens/admin/ClubsScreen';
import EventsScreen           from '../screens/admin/EventsScreen';
import BudgetScreen           from '../screens/admin/BudgetScreen';
import AnnouncementsScreen    from '../screens/admin/AnnouncementsScreen';
import ProfileScreen          from '../screens/admin/ProfileScreen';
import EventAttendanceScreen  from '../screens/admin/EventAttendanceScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function AdminEventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminEventsList"  component={EventsScreen} />
      <Stack.Screen name="EventAttendance"  component={EventAttendanceScreen} />
    </Stack.Navigator>
  );
}

const TABS = [
  { name: 'Dashboard', component: DashboardScreen,     icon: 'view-dashboard', label: 'Home'   },
  { name: 'Clubs',     component: ClubsScreen,         icon: 'account-group',  label: 'Clubs'  },
  { name: 'Events',    component: AdminEventsStack,     icon: 'calendar-edit',  label: 'Events' },
  { name: 'Budget',    component: BudgetScreen,         icon: 'chart-finance',  label: 'Budget' },
  { name: 'Alerts',    component: AnnouncementsScreen,  icon: 'bullhorn',       label: 'Alerts' },
  { name: 'Profile',   component: ProfileScreen,        icon: 'account-circle', label: 'Me'     },
];

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.indigo,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarBackground: () => (
          <View style={styles.tabBarBg}>
            <View style={styles.tabBarBorder} />
          </View>
        ),
        tabBarIcon: ({ color, focused }) => {
          const tab = TABS.find(t => t.name === route.name);
          return (
            <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
              {focused && (
                <LinearGradient
                  colors={['rgba(79,110,247,0.2)', 'rgba(79,110,247,0.05)']}
                  style={StyleSheet.absoluteFill}
                  borderRadius={RADIUS.m}
                />
              )}
              <MaterialCommunityIcons
                name={tab?.icon || 'circle'}
                size={22}
                color={color}
              />
            </View>
          );
        },
      })}
    >
      {TABS.map(t => (
        <Tab.Screen
          key={t.name}
          name={t.name}
          component={t.component}
          options={{ tabBarLabel: t.label }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'web' ? 64 : 70,
    paddingBottom: Platform.OS === 'web' ? 6 : 10,
    elevation: 0,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.card,
  },
  tabBarBorder: {
    position: 'absolute',
    top: 0, left: 40, right: 40, height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.25,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  tabItem: {
    paddingTop: 8,
  },
  iconWrap: {
    width: 40, height: 32,
    borderRadius: RADIUS.m,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  iconWrapActive: {
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
  },
});

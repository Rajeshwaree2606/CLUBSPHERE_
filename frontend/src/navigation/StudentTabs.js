import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SHADOWS } from '../utils/theme';

import HomeScreen        from '../screens/student/HomeScreen';
import ClubsScreen       from '../screens/student/ClubsScreen';
import EventsScreen      from '../screens/student/EventsScreen';
import LeaderboardScreen from '../screens/student/LeaderboardScreen';
import ProfileScreen     from '../screens/student/ProfileScreen';
import EventDetailsScreen from '../screens/student/EventDetailsScreen';
import QRScannerScreen   from '../screens/student/QRScannerScreen';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function EventsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EventsList"   component={EventsScreen} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}

const TABS = [
  { name: 'Home',    component: HomeScreen,        icon: 'home-variant',            label: 'Home'    },
  { name: 'Clubs',   component: ClubsScreen,       icon: 'google-circles-extended', label: 'Clubs'   },
  { name: 'Scan',    component: QRScannerScreen,   icon: 'qrcode-scan',             label: 'Scan'    },
  { name: 'Events',  component: EventsStack,        icon: 'calendar-star',           label: 'Events'  },
  { name: 'Profile', component: ProfileScreen,      icon: 'account-circle',          label: 'Me'      },
];

export default function StudentTabs() {
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
          const isScan = route.name === 'Scan';
          return (
            <View style={[
              styles.iconWrap,
              focused && styles.iconWrapActive,
              isScan && styles.scanIconWrap,
            ]}>
              {isScan ? (
                <LinearGradient
                  colors={['#4F6EF7', '#7C3AED']}
                  style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.m }]}
                />
              ) : focused ? (
                <LinearGradient
                  colors={['rgba(79,110,247,0.2)', 'rgba(79,110,247,0.05)']}
                  style={StyleSheet.absoluteFill}
                  borderRadius={RADIUS.m}
                />
              ) : null}
              <MaterialCommunityIcons
                name={tab?.icon || 'circle'}
                size={isScan ? 24 : 22}
                color={isScan ? '#fff' : color}
              />
            </View>
          );
        },
      })}
    >
      {TABS.map(t => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} options={{ tabBarLabel: t.label }} />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute', borderTopWidth: 0,
    backgroundColor: 'transparent',
    height: Platform.OS === 'web' ? 64 : 70,
    paddingBottom: Platform.OS === 'web' ? 6 : 10,
    elevation: 0,
  },
  tabBarBg: {
    flex: 1, backgroundColor: COLORS.bgCard,
    borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.card,
  },
  tabBarBorder: {
    position: 'absolute', top: 0, left: 40, right: 40, height: 1,
    backgroundColor: COLORS.gold, opacity: 0.25,
  },
  tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },
  tabItem: { paddingTop: 8 },
  iconWrap: {
    width: 40, height: 32, borderRadius: RADIUS.m,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  iconWrapActive: { borderWidth: 1, borderColor: 'rgba(79,110,247,0.4)' },
  scanIconWrap: {
    width: 44, height: 36, borderRadius: RADIUS.m,
    shadowColor: '#4F6EF7', shadowOpacity: 0.5, shadowRadius: 8, elevation: 6,
  },
});

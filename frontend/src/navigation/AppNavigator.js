import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { COLORS, FONTS } from '../utils/theme';
import AuthNavigator from './AuthNavigator';
import StudentTabs from './StudentTabs';
import AdminTabs from './AdminTabs';

const NAV_THEME = {
  ...DarkTheme,
  fonts: {
    ...DarkTheme.fonts,
    regular: FONTS.regular,
    medium:  FONTS.medium,
    bold:    FONTS.bold,
    heavy:   FONTS.heavy,
  },
  colors: {
    ...DarkTheme.colors,
    primary:      COLORS.indigo,
    background:   COLORS.bg,
    card:         COLORS.bgCard,
    text:         COLORS.textPrimary,
    border:       COLORS.border,
    notification: COLORS.crimsonLight,
  },
};

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.indigo} />
      </View>
    );
  }

  // Normalize: both 'admin' (UI role) and raw backend roles route to AdminTabs
  const ADMIN_ROLES = new Set(['admin', 'SuperAdmin', 'ClubAdmin']);
  const isAdmin = user ? ADMIN_ROLES.has(user.role) || ADMIN_ROLES.has(user.backendRole) : false;

  return (
    <NavigationContainer theme={NAV_THEME}>
      {!user ? (
        <AuthNavigator />
      ) : isAdmin ? (
        <AdminTabs />
      ) : (
        <StudentTabs />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
});

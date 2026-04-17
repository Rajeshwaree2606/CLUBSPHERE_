import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import StudentTabs from './StudentTabs';
import AdminTabs from './AdminTabs';


export default function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : user.role === 'admin' ? (
        <AdminTabs />
      ) : (
        <StudentTabs />
      )}
    </NavigationContainer>
  );
}

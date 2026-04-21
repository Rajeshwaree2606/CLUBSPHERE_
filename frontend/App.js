import React from 'react';
import { StatusBar, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/utils/theme';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ErrorBoundary>
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
          <ThemeProvider>
            <AuthProvider>
              <DataProvider>
                <AppNavigator />
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
          <Toast />
        </View>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

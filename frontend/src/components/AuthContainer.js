import React, { useContext } from 'react';
import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// Mobile first, but max width of 480 for tablet/web
const MAX_CONTENT_WIDTH = 480;

export default function AuthContainer({ children }) {
  const { theme } = useContext(ThemeContext);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.centerContainer}>
          <View style={[styles.contentBlock, { backgroundColor: theme.colors.surface, ...theme.shadows.medium }]}>
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBlock: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    padding: 32,
    borderRadius: 32, // Soft large border radius for the card
  }
});

/**
 * AuthContainer.js — No longer used by new auth screens (they are full-screen).
 * Kept as a shim for any legacy import references.
 */
import React from 'react';
import { View, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS } from '../utils/theme';

export default function AuthContainer({ children }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={{ flex: 1 }}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

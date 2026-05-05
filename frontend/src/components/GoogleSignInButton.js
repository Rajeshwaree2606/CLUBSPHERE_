import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

// Ensure the popup closes correctly on web
WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton({ onSignIn, onError, loading }) {
  // Use expo-auth-session for Google Auth
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'PLACEHOLDER_CLIENT_ID',
    // androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, // optional for native
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      onSignIn(id_token);
    } else if (response?.type === 'error') {
      onError?.('Google sign-in failed');
    }
  }, [response]);

  return (
    <TouchableOpacity 
      style={[styles.button, loading && styles.disabled]} 
      onPress={() => promptAsync()}
      disabled={loading || !request}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={COLORS.textPrimary} size="small" />
        ) : (
          <>
            <Image 
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
              style={styles.icon} 
            />
            <Text style={styles.text}>Continue with Google</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: RADIUS.m,
    paddingVertical: 14,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginTop: SPACING.m,
  },
  disabled: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  icon: {
    width: 20,
    height: 20,
  },
  text: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
});

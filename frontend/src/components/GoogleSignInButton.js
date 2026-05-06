import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../utils/theme';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

// ─── Web-safe Google Sign-In button ──────────────────────────────────────────
// On web: uses native browser-based OAuth popup via expo-auth-session
// On native: uses expo-auth-session native flow
// If no EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is configured, renders as disabled

let WebBrowser = null;
let Google = null;

try {
  WebBrowser = require('expo-web-browser');
  Google = require('expo-auth-session/providers/google');
  if (Platform.OS === 'web') {
    WebBrowser.maybeCompleteAuthSession();
  }
} catch (e) {
  // expo-auth-session not available
}

// Component that does the actual Google auth (only rendered when libs are available)
function GoogleAuthButton({ onSignIn, onError, loading }) {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_CLIENT_ID || '',
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
      style={[styles.button, (loading || !request || !GOOGLE_CLIENT_ID) && styles.disabled]}
      onPress={() => promptAsync()}
      disabled={loading || !request || !GOOGLE_CLIENT_ID}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={COLORS.textPrimary} size="small" />
        ) : (
          <>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.text}>
              {GOOGLE_CLIENT_ID ? 'Continue with Google' : 'Google Sign-In (not configured)'}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function GoogleSignInButton({ onSignIn, onError, loading }) {
  // If the auth session library didn't load, show a non-functional button
  if (!Google) {
    return (
      <TouchableOpacity style={[styles.button, styles.disabled]} disabled activeOpacity={1}>
        <View style={styles.content}>
          <Text style={styles.googleIcon}>G</Text>
          <Text style={styles.text}>Google Sign-In unavailable</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return <GoogleAuthButton onSignIn={onSignIn} onError={onError} loading={loading} />;
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
  disabled: { opacity: 0.5 },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
    fontSize: 16,
    fontWeight: '700',
    color: '#4285F4',
    textAlign: 'center',
  },
  text: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
});

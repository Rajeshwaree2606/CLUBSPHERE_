import React, { useState, useContext, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { API_BASE_URL } from '../../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const styles = useMemo(() => getStyles(theme), [theme]);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    try {
      const result = await login(email, password);
      setIsLoading(false);
      if (!result.success) {
        setError(result.message);
        setDebugInfo({
          apiUrl: API_BASE_URL,
          errorType: 'Login rejected',
          detail: result.message,
        });
      }
    } catch (e) {
      setIsLoading(false);
      const isNetwork = !e.response;
      const status = e.response?.status;
      const serverMsg = e.response?.data?.message || e.message;
      setError(isNetwork ? 'Network error — cannot reach server' : `Error ${status}: ${serverMsg}`);
      setDebugInfo({
        apiUrl: API_BASE_URL,
        errorType: isNetwork ? 'NETWORK / CORS' : `HTTP ${status}`,
        detail: serverMsg,
        fullError: e.toString(),
      });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to access your campus clubs</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {/* Debug panel — shows API URL and error details for APK diagnosis */}
      {debugInfo ? (
        <View style={styles.debugBox}>
          <Text style={styles.debugTitle}>🔍 Debug Info</Text>
          <Text style={styles.debugText}>API: {debugInfo.apiUrl}</Text>
          <Text style={styles.debugText}>Type: {debugInfo.errorType}</Text>
          <Text style={styles.debugText}>Detail: {debugInfo.detail}</Text>
          {debugInfo.fullError ? <Text style={styles.debugText}>Raw: {debugInfo.fullError}</Text> : null}
        </View>
      ) : null}

      {/* Always show which API the app is using */}
      <Text style={{ color: theme.colors.textSecondary, fontSize: 10, textAlign: 'center', marginBottom: 8 }}>
        API: {API_BASE_URL}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={{marginTop: 16}}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      <View style={styles.hintBox}>
        <Text style={{color: theme.colors.textSecondary, fontSize: 12}}>
          Student Login: student@campus.edu / student123{`\n`}
          Admin Login: admin@campus.edu / admin123
        </Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1, padding: theme.spacing.xl, justifyContent: 'center', backgroundColor: theme.colors.background,
  },
  title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.s },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
  input: {
    backgroundColor: theme.colors.surface, padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m, marginBottom: theme.spacing.m,
    borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text
  },
  button: {
    backgroundColor: theme.colors.primary, padding: theme.spacing.m,
    borderRadius: theme.borderRadius.m, alignItems: 'center', marginTop: theme.spacing.s,
  },
  buttonText: { color: '#ffffff', fontWeight: '600', fontSize: 16 },
  linkText: { color: theme.colors.primary, textAlign: 'center', fontWeight: '500' },
  error: { color: theme.colors.error, marginBottom: theme.spacing.m, textAlign: 'center' },
  hintBox: { marginTop: 40, padding: 10, backgroundColor: theme.colors.primaryLight, borderRadius: 8 },
  debugBox: { backgroundColor: '#1a1a2e', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 8, padding: 12, marginBottom: 12 },
  debugTitle: { color: '#e74c3c', fontWeight: '700', fontSize: 14, marginBottom: 6 },
  debugText: { color: '#f0f0f0', fontSize: 11, fontFamily: 'monospace', marginBottom: 3 },
});

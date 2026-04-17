import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { theme } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('student123');
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    const result = await login(email, password);
    setIsLoading(false);
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Login to access your campus clubs</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

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
          Student Login: student@test.com / student123{`\n`}
          Admin Login: admin@test.com / admin123
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  buttonText: { color: theme.colors.surface, fontWeight: '600', fontSize: 16 },
  linkText: { color: theme.colors.primary, textAlign: 'center', fontWeight: '500' },
  error: { color: theme.colors.error, marginBottom: theme.spacing.m, textAlign: 'center' },
  hintBox: { marginTop: 40, padding: 10, backgroundColor: '#E0E7FF', borderRadius: 8 }
});

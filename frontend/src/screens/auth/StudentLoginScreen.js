import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AuthContainer from '../../components/AuthContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentLoginScreen({ navigation }) {
  const [email, setEmail] = useState('student@test.com');
  const [password, setPassword] = useState('student');
  const { login } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
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
    <AuthContainer>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Login to access your student dashboard
        </Text>
      </View>

      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <Input
        placeholder="Student Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        leftIcon="email-outline"
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon="lock-outline"
      />

      <Button 
        title="Login as Student" 
        onPress={handleLogin} 
        loading={isLoading}
        style={styles.loginButton}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('StudentSignup')}>
          <Text style={[styles.linkText, { color: theme.colors.primary }]}>
            Create an account
          </Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    padding: 4,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  error: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  }
});

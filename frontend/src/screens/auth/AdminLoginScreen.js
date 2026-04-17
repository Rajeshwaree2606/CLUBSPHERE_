import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AuthContainer from '../../components/AuthContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin');
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
        <View style={styles.iconRow}>
          <MaterialCommunityIcons name="shield-check" size={28} color={theme.colors.secondary} style={styles.icon} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Admin Portal</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Manage clubs, users, and events
        </Text>
      </View>

      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

      <Input
        placeholder="Administrator Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        leftIcon="shield-account-outline"
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon="lock-outline"
      />

      <Button 
        title="Secure Login" 
        variant="secondary"
        onPress={handleLogin} 
        loading={isLoading}
        style={styles.loginButton}
      />
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
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
  }
});

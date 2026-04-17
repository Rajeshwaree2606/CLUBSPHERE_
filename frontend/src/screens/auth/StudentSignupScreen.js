import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import AuthContainer from '../../components/AuthContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentSignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { signup } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    setError(null);
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill out all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    const result = await signup(name, email, password, 'student'); // Pass role
    setIsLoading(false);
    
    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <AuthContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Join your campus community today!
          </Text>
        </View>

        {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}

        <Input
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          leftIcon="account-outline"
        />

        <Input
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          leftIcon="email-outline"
        />
        
        <Input
          placeholder="Phone Number (Optional)"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          leftIcon="phone-outline"
        />

        <Input
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock-outline"
        />
        
        <Input
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon="lock-check-outline"
        />

        <Button 
          title="Sign Up" 
          onPress={handleSignup} 
          loading={isLoading}
          style={styles.signupButton}
        />

        <View style={styles.footer}>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('StudentLogin')}>
            <Text style={[styles.linkText, { color: theme.colors.primary }]}>
              Login here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 4,
  },
  header: {
    marginBottom: 24,
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
  signupButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '700',
  }
});

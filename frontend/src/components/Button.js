import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false, 
  icon = null,
  style, 
  textStyle 
}) {
  const { theme } = useContext(ThemeContext);

  const getColors = () => {
    if (disabled) return { bg: theme.colors.border, text: theme.colors.textSecondary };
    switch (variant) {
      case 'secondary': return { bg: theme.colors.secondary, text: theme.colors.surface };
      case 'outline': return { bg: 'transparent', text: theme.colors.primary, border: theme.colors.primary };
      case 'danger': return { bg: theme.colors.errorLight, text: theme.colors.error };
      case 'ghost': return { bg: theme.colors.primaryLight, text: theme.colors.primary };
      default: return { bg: theme.colors.primary, text: theme.colors.surface };
    }
  };

  const colors = getColors();

  return (
    <TouchableOpacity
      style={[
        {
          paddingVertical: 14,
          paddingHorizontal: theme.spacing.m,
          borderRadius: theme.borderRadius.round,
          alignItems: 'center',
          justifyContent: 'center',
        },
        { backgroundColor: colors.bg },
        variant === 'outline' && { borderWidth: 1, borderColor: colors.border },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && <MaterialCommunityIcons name={icon} size={20} color={colors.text} style={{ marginRight: theme.spacing.xs }} />}
          <Text style={[{ fontSize: 16, fontWeight: '700', letterSpacing: 0.3, color: colors.text }, textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

export default function Card({ children, style, onPress, noPadding = false }) {
  const { theme } = useContext(ThemeContext);
  const CardContainer = onPress ? TouchableOpacity : View;
  
  return (
    <CardContainer 
      onPress={onPress} 
      activeOpacity={0.8}
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.l,
          marginBottom: theme.spacing.m,
          ...theme.shadows.medium,
        },
        !noPadding && { padding: theme.spacing.m },
        style
      ]}
    >
      {children}
    </CardContainer>
  );
}

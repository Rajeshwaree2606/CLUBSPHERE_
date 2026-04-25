/**
 * Input.js — Legacy compatibility shim.
 * Forwards to the new PremiumInput component.
 */
import React from 'react';
import PremiumInput from './PremiumInput';

export default function Input({
  placeholder, value, onChangeText, secureTextEntry,
  keyboardType, leftIcon, multiline, editable, style,
  autoCapitalize,
}) {
  return (
    <PremiumInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      leftIcon={leftIcon}
      multiline={multiline}
      editable={editable}
      style={style}
      autoCapitalize={autoCapitalize}
    />
  );
}

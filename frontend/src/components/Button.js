/**
 * Button.js — Legacy compatibility shim.
 * Maps old variant/prop API to the new GradientButton component.
 */
import React from 'react';
import GradientButton from './GradientButton';

const VARIANT_MAP = {
  primary:   'gold',
  secondary: 'cobalt',
  danger:    'danger',
  outline:   'outline',
  ghost:     'ghost',
  success:   'success',
};

export default function Button({
  title, onPress, variant = 'primary', size = 'medium',
  loading, disabled, icon, style, textStyle,
}) {
  const mappedVariant = VARIANT_MAP[variant] || 'gold';
  return (
    <GradientButton
      title={title}
      onPress={onPress}
      variant={mappedVariant}
      size={size === 'sm' ? 'small' : size}
      loading={loading}
      disabled={disabled}
      icon={icon}
      style={style}
      textStyle={textStyle}
    />
  );
}

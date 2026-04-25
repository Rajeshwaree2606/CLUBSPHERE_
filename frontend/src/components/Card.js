/**
 * Card.js — Legacy compatibility shim.
 * Forwards to the new PremiumCard component.
 */
import React from 'react';
import PremiumCard from './PremiumCard';

export default function Card({ children, style, variant }) {
  return (
    <PremiumCard style={style} variant={variant}>
      {children}
    </PremiumCard>
  );
}

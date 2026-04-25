/**
 * ProgressBar.js — Legacy shim for XPBar.
 */
import React from 'react';
import XPBar from './XPBar';

export default function ProgressBar({ current = 0, max = 1000 }) {
  return <XPBar current={current} max={max} />;
}

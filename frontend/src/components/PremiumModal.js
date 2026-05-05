/**
 * PremiumModal.js — Fixed v4
 *
 * KEY FIX: The backdrop TouchableOpacity was using StyleSheet.absoluteFill
 * which on Android intercepts ALL touches including buttons inside the sheet.
 * Solution: Use a proper two-layer structure where the backdrop only covers
 * the area ABOVE the sheet, not the sheet itself.
 *
 * Also adds KeyboardAvoidingView + ScrollView for keyboard safety.
 */
import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, Animated,
  TouchableOpacity, TouchableWithoutFeedback, Dimensions,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../utils/theme';

const { height: SCREEN_H } = Dimensions.get('window');

export default function PremiumModal({
  visible,
  title,
  subtitle,
  onClose,
  children,
  footer,
  icon,
  iconColor = COLORS.gold,
  maxHeight,
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_H, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/*
        ── Structure ──────────────────────────────────────────────────────
        outer:  full-screen flex column, backdrop color animated
        inner:  flex:1 TouchableWithoutFeedback = tapping empty space closes
        sheet:  slides up from bottom, NOT wrapped in backdrop touch area
        ──────────────────────────────────────────────────────────────────
      */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Animated.View style={[styles.fullScreen, { opacity: fadeAnim }]}>

          {/* Backdrop — only the area above the sheet */}
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Sheet — slides up, receives all touches independently */}
          <Animated.View
            style={[
              styles.sheet,
              { transform: [{ translateY: slideAnim }] },
              maxHeight && { maxHeight },
            ]}
          >
            {/* Handle bar */}
            <View style={styles.handle} />

            {/* Header row */}
            <View style={styles.header}>
              {icon && (
                <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
                  <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                {title    && <Text style={styles.title}>{title}</Text>}
                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecond} />
              </TouchableOpacity>
            </View>

            {/* Gold divider */}
            <LinearGradient
              colors={['transparent', COLORS.gold, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.divider}
            />

            {/* Scrollable body — fields + footer inside scroll for keyboard safety */}
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              bounces={false}
              nestedScrollEnabled
            >
              {/* Form fields */}
              {children}

              {/* Footer buttons — inside scroll so keyboard can't hide them */}
              {footer && (
                <View style={styles.footerRow}>
                  {footer}
                </View>
              )}
            </ScrollView>
          </Animated.View>

        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',   // sheet sticks to bottom
  },
  backdrop: {
    // Takes up all space above the sheet — tapping this closes modal
    flex: 1,
  },
  sheet: {
    backgroundColor: COLORS.bgModal,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.modal,
    maxHeight: SCREEN_H * 0.92,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: SPACING.l, gap: SPACING.m,
  },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3, color: COLORS.textPrimary, fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.small, color: COLORS.textSecond, marginTop: 2,
  },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  divider: { height: 1, opacity: 0.4 },
  bodyScroll: { flexShrink: 1 },
  body: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  footerRow: {
    flexDirection: 'row',
    gap: SPACING.m,
    paddingTop: SPACING.l,
  },
});

import React, { useEffect, useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, Animated,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY, SHADOWS } from '../utils/theme';
import GradientButton from './GradientButton';

const { height } = Dimensions.get('window');

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
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: height, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
        <Animated.View style={[
          styles.sheet,
          { transform: [{ translateY: slideAnim }] },
          maxHeight && { maxHeight },
        ]}>
          {/* Handle bar */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            {icon && (
              <View style={[styles.iconCircle, { backgroundColor: `${iconColor}22` }]}>
                <MaterialCommunityIcons name={icon} size={24} color={iconColor} />
              </View>
            )}
            <View style={{ flex: 1 }}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textSecond} />
            </TouchableOpacity>
          </View>

          {/* Gold divider */}
          <LinearGradient
            colors={['transparent', COLORS.gold, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.divider}
          />

          {/* Content */}
          <View style={styles.body}>{children}</View>

          {/* Footer */}
          {footer && <View style={styles.footerRow}>{footer}</View>}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
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
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.l,
    gap: SPACING.m,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecond,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  divider: {
    height: 1,
    opacity: 0.4,
  },
  body: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
  },
  footerRow: {
    flexDirection: 'row',
    gap: SPACING.m,
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
  },
});

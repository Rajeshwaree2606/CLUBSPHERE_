import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Button from './Button';

const ConfirmModal = ({ visible, title, message, onCancel, onConfirm, theme }) => {
  if (!theme) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.l }]}>
          <Text style={[theme.typography.h3, { marginBottom: theme.spacing.s }]}>{title || 'Confirmation'}</Text>
          <Text style={[theme.typography.body, { marginBottom: theme.spacing.xl, textAlign: 'center' }]}>{message}</Text>
          
          <View style={styles.actions}>
            <Button 
              title="Cancel" 
              variant="ghost" 
              onPress={onCancel} 
              style={{ flex: 1 }} 
            />
            <Button 
              title="Delete" 
              variant="danger" 
              onPress={onConfirm} 
              style={{ flex: 1 }} 
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
});

export default ConfirmModal;

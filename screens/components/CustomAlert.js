import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const CustomAlert = ({ visible, title, message, onClose, type = 'success' }) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={[
            styles.headerStrip, 
            type === 'success' ? styles.successStrip : styles.errorStrip
          ]} />
          
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          <TouchableOpacity 
            style={[
              styles.button,
              type === 'success' ? styles.successButton : styles.errorButton
            ]} 
            onPress={onClose}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
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
  },
  alertContainer: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  headerStrip: {
    height: 4,
    width: '100%',
  },
  successStrip: {
    backgroundColor: '#BEB4FF',
  },
  errorStrip: {
    backgroundColor: '#FF4444',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E252B',
  },
  message: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  successButton: {
    backgroundColor: '#BEB4FF',
  },
  errorButton: {
    backgroundColor: '#FF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CustomAlert;
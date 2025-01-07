import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BlockProfileModal = ({ 
  isVisible, 
  onClose, 
  onBlock, 
  username = '@Admin',
  darkMode 
}) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  
  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      // Here you would typically make an API call to block the user
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      await onBlock();
      Alert.alert(
        'User Blocked',
        `${username} has been blocked. You will no longer see their content.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to block user. Please try again later.');
    } finally {
      setIsBlocking(false);
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      useNativeDriver
    >
      <View style={[styles.container, { backgroundColor }]}>
        <View style={styles.handle} />
        
        <View style={styles.header}>
          <MaterialCommunityIcons 
            name="block-helper" 
            size={32} 
            color="#FF3B30" 
          />
          <Text style={[styles.title, { color: textColor }]}>
            Block {username}
          </Text>
        </View>

        <Text style={[styles.description, { color: darkMode ? '#ccc' : '#666' }]}>
          When you block someone:
        </Text>
        
        <View style={styles.bulletPoints}>
          {[
            "They won't be able to see your posts",
            "They won't be able to message you",
            "They won't be able to follow you",
            "You won't see their content",
          ].map((text, index) => (
            <View key={index} style={styles.bulletPoint}>
              <MaterialCommunityIcons 
                name="minus" 
                size={16} 
                color={darkMode ? '#ccc' : '#666'} 
              />
              <Text style={[styles.bulletText, { color: darkMode ? '#ccc' : '#666' }]}>
                {text}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isBlocking}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.blockButton]}
            onPress={handleBlock}
            disabled={isBlocking}
          >
            {isBlocking ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.blockButtonText}>Block</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DFDFDF',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 12,
  },
  bulletPoints: {
    marginBottom: 24,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#E5E5E5',
  },
  blockButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BlockProfileModal;
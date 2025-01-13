import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Alert,
  Platform,
} from 'react-native';
import { useDarkMode } from './Context/DarkMode';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WritePostScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const { darkMode } = useDarkMode();
  const container = darkMode ? '#333' : '#f9f9f9';
  const text = darkMode ? '#fff' : '#000';
  const inputBackground = darkMode ? '#222' : '#fff';
  const inputBorder = darkMode ? '#555' : '#ccc';
  const placeholder = darkMode ? '#888' : '#666';

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        Alert.alert('Error', result.errorMessage);
        return;
      }

      if (result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const openModal = () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Error', 'Title and description are required');
      return;
    }
    setModalVisible(true);
  };

  const uploadImage = async (imageUri) => {
    try {
      const formData = new FormData();
      
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      formData.append('image', {
        uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
        type,
        name: filename,
      });

      const response = await fetch('http://192.168.151.27/TechForum/backend/upload_image.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.image_url;
      } else {
        throw new Error(data.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handlePost = async (type) => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Error', 'User not logged in');
        return;
      }
  
      let uploadedImageUrl = null;
      if (imageUri) {
        try {
          uploadedImageUrl = await uploadImage(imageUri);
        } catch (error) {
          console.error('Error uploading image:', error);
          Alert.alert('Error', 'Failed to upload image');
          return;
        }
      }
  
      const postData = {
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        image_url: uploadedImageUrl || null,
        external_link: link.trim() || null,
        post_type: type.toLowerCase()
      };
  
      const response = await fetch('http://192.168.151.27/TechForum/backend/user_posts.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        Alert.alert('Success', 'Post created successfully', [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]);
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post: ' + error.message);
    } finally {
      setIsLoading(false);
      setModalVisible(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: container }]} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>Write Posts</Text>
        <TouchableOpacity onPress={openModal} disabled={isLoading}>
          <Text style={[styles.postButton, { color: text }]}>
            {isLoading ? 'POSTING...' : 'POST'}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.inputTitle,
          { backgroundColor: inputBackground, borderColor: inputBorder, color: text },
        ]}
        placeholder="Title.... goes here"
        placeholderTextColor={placeholder}
        value={title}
        onChangeText={setTitle}
      />
      
      <TextInput
        style={[
          styles.inputDescription,
          { backgroundColor: inputBackground, borderColor: inputBorder, color: text },
        ]}
        placeholder="Description.. goes here"
        placeholderTextColor={placeholder}
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity style={styles.photoButton} onPress={handleImagePick}>
        <Icon name="photo-camera" size={24} color="#007bff" />
        <Text style={[styles.photoText, { color: text }]}> Add photo</Text>
      </TouchableOpacity>
      {imageUri && <Text style={[{ color: text }, styles.imageUriText]} numberOfLines={1}>Selected: {imageUri}</Text>}

      <Text style={[styles.linkTitle, { color: text }]}>Add external link to verify</Text>

      <TextInput
        style={[
          styles.inputLink,
          { backgroundColor: inputBackground, borderColor: inputBorder, color: text },
        ]}
        placeholder="External link here"
        placeholderTextColor={placeholder}
        value={link}
        onChangeText={setLink}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: container }]}>
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => handlePost('Post')}
              disabled={isLoading}
            >
              <Text style={[styles.modalText, { color: text }]}>Share as Post</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => handlePost('QA')}
              disabled={isLoading}
            >
              <Text style={[styles.modalText, { color: text }]}>Share as Q&A</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalOption, styles.cancelOption]} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalText, { color: '#ff4444' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    fontSize: 16,
  },
  inputTitle: {
    fontSize: 16,
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  inputDescription: {
    fontSize: 16,
    height: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
  photoButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoText: {
    marginLeft: 8,
  },
  linkTitle: {
    fontSize: 16,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  cancelOption: {
    borderBottomWidth: 0,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
  },
  inputLink: {
    fontSize: 16,
    marginBottom: 8,
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageUriText: {
    marginTop: 8,
  },
});

export default WritePostScreen;
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDarkMode } from './Context/DarkMode';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomToast from './components/customToast';

const WritePostScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { darkMode } = useDarkMode();
  const container = darkMode ? '#333' : '#f9f9f9';
  const text = darkMode ? '#fff' : '#000';
  const inputBackground = darkMode ? '#222' : '#fff';
  const inputBorder = darkMode ? '#555' : '#ccc';
  const placeholder = darkMode ? '#888' : '#666';

 
    
  
  const showToastAndNavigate = (message) => {
    setToast(
      <CustomToast 
        message={message} 
        icon={require('./assets/success.png')} 
        onHide={() => {
          setToast(null);
          navigation.goBack(); // Navigate back only after toast is hidden
        }} 
      />
    );
  };  
  const showToast = (message) => {
    setToast(
      <CustomToast 
        message={message}  
        icon={require('./assets/wrong.png')}      
        onHide={() => {
          setToast(null);
        }} 
      />
    );
  };  
  

  const handleImagePick = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel) return;

      if (result.errorCode) {
        showToast(result.errorMessage);
        return;
      }

      if (result.assets && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      showToast('Failed to pick image');
    }
  };

  const openModal = () => {
    if (!title.trim() || !description.trim()) {
      showToast('Title and description are required');
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

      const response = await fetch('http://192.168.133.11/TechForum/backend/upload_image.php', {
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
        setToast(
          <CustomToast 
            message="User not logged in" 
            icon={require('./assets/success.png')} 
            onHide={() => setToast(null)} 
          />
        );
        return;
      }

      if (type.toLowerCase() === 'qa' && link.trim()) {
        setToast(
          <CustomToast 
            message="External links are not allowed for Q&A posts" 
            icon={require('./assets/success.png')} 
            onHide={() => setToast(null)} 
          />
        );
        setIsLoading(false);
        setModalVisible(false);
        return;
      }
  
      let uploadedImageUrl = null;
      if (imageUri) {
        try {
          uploadedImageUrl = await uploadImage(imageUri);
        } catch (error) {
          console.error('Error uploading image:', error);
          setToast(
            <CustomToast 
              message="Failed to upload image" 
              icon={require('./assets/success.png')} 
              onHide={() => setToast(null)} 
            />
          );
          return;
        }
      }
  
      const postData = {
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        image_url: uploadedImageUrl || null,
        external_link: type.toLowerCase() === 'qa' ? null : link.trim(),
        post_type: type.toLowerCase()
      };
  
      const response = await fetch('http://192.168.133.11/TechForum/backend/user_posts.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        setModalVisible(false);
        // Show toast first, then navigate after toast is hidden
        showToastAndNavigate(type.toLowerCase() === 'qa' ? 'Q&A has been uploaded' : 'Post has been uploaded');
      } else {
        throw new Error(data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setToast(
        <CustomToast 
          message={`Failed to create post: ${error.message}`}
          icon={require('./assets/success.png')} 
          onHide={() => setToast(null)} 
        />
      );
    } finally {
      setIsLoading(false);
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
  
      <View style={styles.linkContainer}>
        <Text style={[styles.linkTitle, { color: text }]}>Add external link to verify</Text>
        <Text style={[styles.linkNote, { color: placeholder }]}>(External links are not available for Q&A)</Text>
      </View>
  
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
  
      {/* Show Custom Toast */}
      {toast}
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
  linkContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkTitle: {
    fontSize: 16,
  },
  linkNote: {
    
    paddingTop:35,
    position: 'absolute',
    marginRight:120,
    fontSize: 12,
    fontStyle: 'italic',
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
    marginTop: 18,
    borderRadius: 8,
    borderWidth: 1,
  },
  imageUriText: {
    marginTop: 8,
  },
});

export default WritePostScreen;
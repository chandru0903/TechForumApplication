import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useDarkMode } from './Context/DarkMode';
import { launchImageLibrary } from 'react-native-image-picker'; // For image picking
import Icon from 'react-native-vector-icons/MaterialIcons'; // For Material Icons

const WritePostScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null); // State to hold image URI

  const themeStyles = useDarkMode()
    ? {
        container: { backgroundColor: '#333' },
        text: { color: '#fff' },
        input: { backgroundColor: '#444', borderColor: '#555', color: '#fff' },
        placeholder: '#aaa',
        header: { color: '#fff' },
      }
    : {
        container: { backgroundColor: '#f9f9f9' },
        text: { color: '#000' },
        input: { backgroundColor: '#fff', borderColor: '#ddd', color: '#000' },
        placeholder: '#666',
        header: { color: '#003f8a' },
      };

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && response.assets) {
        setImageUri(response.assets[0].uri); // Update state with selected image URI
      }
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <Text style={styles.title}>Write Posts</Text>
        <TouchableOpacity onPress={openModal}>
          <Text style={styles.postButton}>POST</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[styles.inputTitle, { color: '#000' }]} // Set text color to black
        placeholder="Title.... goes here"
        placeholderTextColor="#aaa"
      />
      <TextInput
        style={[styles.inputDescription, { color: '#000' }]} // Set text color to black
        placeholder="Description.. goes here"
        placeholderTextColor="#aaa"
        multiline
      />

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Icon name="photo-camera" size={24} color="#007bff" />
        <Text style={styles.photoText}> Add photo</Text>
      </TouchableOpacity>
      {imageUri && <Text>Image URI: {imageUri}</Text>} {/* Display selected image URI */}
      
      <Text style={styles.linkTitle}>Add external link to verify</Text>
      
      <TextInput
        style={[styles.inputLink, { color: '#000' }]} // Set text color to black
        placeholder="External link here"
        placeholderTextColor="#aaa"
      />


      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={closeModal}>
              <Text style={styles.modalText}>Share as Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={closeModal}>
              <Text style={styles.modalText}>Share as Q&A</Text>
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
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  postButton: {
    fontSize: 16,
    color: '#007bff',
  },
  inputTitle: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  inputDescription: {
    fontSize: 16,
    height: 150, // Increased height for description box
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  photoButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoText: {
    color: '#000',
    marginLeft: 8,
  },
  linkTitle: {
    fontSize: 16, // Size similar to "Add photo"
    color: '#000',
    marginTop: 16,
   
  },
  linkButton: {
    marginTop: 8,
  },
  linkText: {
    color: '#000',
    fontSize: 16,
    marginLeft: 8,
    
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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
  modalText: {
    fontSize: 18,
    textAlign: '',
    color: '#000',
  },
  link: {
    marginTop:15,
    color: '#007bff',
    flexDirection: 'row',
  },
  inputLink: {
    fontSize: 16,
    marginBottom: 8,
    padding: 8,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
});

export default WritePostScreen;

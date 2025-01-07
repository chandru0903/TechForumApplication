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
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WritePostScreen = ({ navigation }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  const { darkMode } = useDarkMode();
  const container = darkMode ? '#333' : '#f9f9f9';
  const text = darkMode ? '#fff' : '#000';
  const inputBackground = darkMode ? '#222' : '#fff';
  const inputBorder = darkMode ? '#555' : '#ccc';
  const placeholder = darkMode ? '#888' : '#666';

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
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: container }]} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: text }]}>Write Posts</Text>
        <TouchableOpacity onPress={openModal}>
          <Text style={[styles.postButton, { color: text }]}>POST</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.inputTitle,
          { backgroundColor: inputBackground, borderColor: inputBorder, color: text },
        ]}
        placeholder="Title.... goes here"
        placeholderTextColor={placeholder}
      />
      <TextInput
        style={[
          styles.inputDescription,
          { backgroundColor: inputBackground, borderColor: inputBorder, color: text },
        ]}
        placeholder="Description.. goes here"
        placeholderTextColor={placeholder}
        multiline
      />

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Icon name="photo-camera" size={24} color="#007bff" />
        <Text style={[styles.photoText, { color: text }]}> Add photo</Text>
      </TouchableOpacity>
      {imageUri && <Text style={[{ color: text }, styles.imageUriText]}>Image URI: {imageUri}</Text>}

      <Text style={[styles.linkTitle, { color: text }]}>Add external link to verify</Text>

      <TextInput
        style={[
          styles.inputLink,
          { backgroundColor: inputBackground, borderColor: inputBorder, color: text },
        ]}
        placeholder="External link here"
        placeholderTextColor={placeholder}
      />

      <Modal animationType="slide" transparent={true} visible={isModalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={closeModal}>
              <Text style={[styles.modalText, { color: text }]}>Share as Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={closeModal}>
              <Text style={[styles.modalText, { color: text }]}>Share as Q&A</Text>
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
    borderBottomWidth: 1,
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
  },
  inputLink: {
    fontSize: 16,
    marginBottom: 8,
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  imageUriText: {
    marginTop: 8,
  },
});

export default WritePostScreen;

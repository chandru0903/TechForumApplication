import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useDarkMode } from './Context/DarkMode';

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [website, setWebsite] = useState('');
  const { darkMode } = useDarkMode();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log("User ID: ", userId); 
      const response = await fetch(`http://192.168.151.27/TechForum/backend/get_profile.php?id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        const profile = data.profile;
        setName(profile.full_name);
        setUsername(profile.username);
        setEmail(profile.email);
        setBio(profile.bio);
        setWebsite(profile.website);
        setProfileImage(profile.profile_image);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch profile data');
    }
  };

  const pickImage = () => {
    const options = { mediaType: 'photo', maxWidth: 300, maxHeight: 300, quality: 1 };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const formData = new FormData();
  
      formData.append('user_id', userId);
      formData.append('name', name);
      formData.append('username', username);
      formData.append('email', email);
      formData.append('bio', bio);
      formData.append('website', website);
  
      // Handle profile image upload with support for both JPEG and PNG formats
      if (profileImage && !profileImage.startsWith('http')) {
        const fileExtension = profileImage.split('.').pop().toLowerCase(); // Get file extension
        const fileType = fileExtension === 'png' ? 'image/png' : 'image/jpeg'; // Determine MIME type
  
        formData.append('profile_pictures', {
          uri: profileImage,
          type: fileType,
          name: `profile.${fileExtension}`, // Use the correct extension
        });
      }
  
      const response = await fetch('http://192.168.151.27/TechForum/backend/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
       // Log the server response for debugging
      
  
      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Profile updated successfully');
       

      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
    navigation.goBack();
  };
 
  

  const themeStyles = darkMode ? {
    container: { backgroundColor: '#333' },
    text: { color: '#fff' },
    input: { backgroundColor: '#444', borderColor: '#555', color: '#fff' },
    placeholder: '#aaa',
    header: { color: '#fff' },
  } : {
    container: { backgroundColor: '#f9f9f9' },
    text: { color: '#000' },
    input: { backgroundColor: '#fff', borderColor: '#ddd', color: '#000' },
    placeholder: '#666',
    header: { color: '#003f8a' },
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, themeStyles.container]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, themeStyles.header]}>Edit Profile</Text>
      </View>

      <View style={styles.profileImageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={profileImage ? { uri: profileImage } : require('./assets/Profile.png')}
            style={styles.profileImage}
          />
          <Text style={[styles.changePhotoText, themeStyles.text]}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/** Input Fields */}
        <Text style={[styles.label, themeStyles.text]}>Full Name</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={themeStyles.placeholder}
        />

        <Text style={[styles.label, themeStyles.text]}>Username</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
          placeholderTextColor={themeStyles.placeholder}
        />

        <Text style={[styles.label, themeStyles.text]}>Email</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={themeStyles.placeholder}
          keyboardType="email-address"
        />

        <Text style={[styles.label, themeStyles.text]}>Bio</Text>
        <TextInput
          style={[styles.input, styles.bioInput, themeStyles.input]}
          value={bio}
          onChangeText={setBio}
          placeholder="Write something about yourself"
          placeholderTextColor={themeStyles.placeholder}
          multiline
        />

        <Text style={[styles.label, themeStyles.text]}>Website</Text>
        <TextInput
          style={[styles.input, themeStyles.input]}
          value={website}
          onChangeText={setWebsite}
          placeholder="Enter your website link"
          placeholderTextColor={themeStyles.placeholder}
          keyboardType="url"
        />

      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 24, fontWeight: 'bold' },
  profileImageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 2 },
  changePhotoText: { fontSize: 14, textDecorationLine: 'underline' },
  form: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 5, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 15 },
  bioInput: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#003f8a', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;

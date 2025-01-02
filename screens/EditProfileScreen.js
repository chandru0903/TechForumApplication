import React, { useState } from 'react';
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
import { launchImageLibrary } from 'react-native-image-picker';
import { useDarkMode } from './Context/DarkMode'; // Import the dark mode context

const EditProfileScreen = () => {
  const [name, setName] = useState('Chandru');
  const [username, setUsername] = useState('chandru.tech');
  const [email, setEmail] = useState('chandru@techforum.com');
  const [bio, setBio] = useState('Tech enthusiast and lifelong learner.');
  const [profileImage, setProfileImage] = useState(null);
  const [website, setWebsite] = useState('https://techforum.com');
  const [socialLinks, setSocialLinks] = useState([{ link: '', description: '' }]);
  const { darkMode } = useDarkMode(); // Get dark mode state

  const themeStyles = darkMode
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

  const handleSave = () => {
    Alert.alert('Profile Updated', 'Your changes have been saved successfully!');
  };

  const pickImage = () => {
    const options = { mediaType: 'photo', maxWidth: 300, maxHeight: 300, quality: 1 };
    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const addSocialLink = () => setSocialLinks([...socialLinks, { link: '', description: '' }]);

  const updateSocialLink = (index, field, value) => {
    const updatedLinks = socialLinks.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setSocialLinks(updatedLinks);
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

        {/** Social Links */}
        <Text style={[styles.label, themeStyles.text]}>Social Links</Text>
        {socialLinks.map((socialLink, index) => (
          <View key={index} style={styles.socialLinkSection}>
            <Text style={[styles.label, { color: '#757575' }]}>Link</Text>
            <TextInput
              style={[styles.input, themeStyles.input]}
              value={socialLink.link}
              onChangeText={(text) => updateSocialLink(index, 'link', text)}
              placeholder="Enter link"
              placeholderTextColor={themeStyles.placeholder}
            />
            <Text style={[styles.label, { color: '#757575' }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput, themeStyles.input]}
              value={socialLink.description}
              onChangeText={(text) => updateSocialLink(index, 'description', text)}
              placeholder="Enter description"
              placeholderTextColor={themeStyles.placeholder}
              multiline
            />
          </View>
        ))}

        <TouchableOpacity style={styles.addLinkButton} onPress={addSocialLink}>
          <Text style={[styles.addLinkButtonText, themeStyles.text]}>+ Add another link</Text>
        </TouchableOpacity>
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
  socialLinkSection: { marginBottom: 20 },
  descriptionInput: { height: 60, textAlignVertical: 'top' },
  addLinkButton: { alignItems: 'center', paddingVertical: 10, marginTop: 10, borderRadius: 5 },
  addLinkButtonText: { fontSize: 16, fontWeight: 'bold' },
  saveButton: { backgroundColor: '#003f8a', paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default EditProfileScreen;

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker'; // Install: npm install @react-native-picker/picker
import { CommonActions } from '@react-navigation/native'; // For resetting navigation stack

const WelcomeScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);

  const popularCategories = [
    'Gaming',
    'PC Assembly',
    'PC Doc',
    'Programming',
    'Mobile Updates',
    'AI & ML',
    'Startups',
  ];

  const toggleTagSelection = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((item) => item !== tag) // Remove if already selected
        : [...prevTags, tag] // Add if not selected
    );
  };

  const navigateToHome = () => {
    // Reset the navigation stack and navigate to HomeScreen
    navigation.dispatch(
      CommonActions.reset({
        index: 0, // Set the HomeScreen as the only route
        routes: [{ name: 'HomeScreen' }],
      })
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Greeting Section */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, ABC</Text>
        <Text style={styles.subtext}>
          We are excited by your arrival, give a minute of time and choose your field of interest
        </Text>
      </View>

      {/* Dropdown */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Choose the category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            style={styles.picker}
            dropdownIconColor="#fff"
          >
            <Picker.Item label="Select a category" value="" />
            <Picker.Item label="Gaming" value="Gaming" />
            <Picker.Item label="Programming" value="Programming" />
            <Picker.Item label="AI & ML" value="AI & ML" />
            <Picker.Item label="Mobile Development" value="Mobile Development" />
            <Picker.Item label="PC Assembly" value="PC Assembly" />
          </Picker>
        </View>
      </View>

      {/* Popular Categories */}
      <Text style={styles.popularLabel}>Some most popular categories</Text>
      <FlatList
        data={popularCategories}
        horizontal={false}
        numColumns={3}
        contentContainerStyle={styles.tagsContainer}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.tag,
              selectedTags.includes(item) && styles.selectedTag,
            ]}
            onPress={() => toggleTagSelection(item)}
          >
            <Text
              style={[
                styles.tagText,
                selectedTags.includes(item) && styles.selectedTagText,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={navigateToHome}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={navigateToHome}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#33394F',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtext: {
    fontSize: 16,
    color: '#B0B3C6',
    marginTop: 10,
  },
  dropdownContainer: {
    marginTop: 20,
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#B0B3C6',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: '#444B5E',
    borderRadius: 8,
  },
  picker: {
    color: '#fff',
  },
  popularLabel: {
    fontSize: 16,
    color: '#B0B3C6',
    marginVertical: 20,
  },
  tagsContainer: {
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: '#555C73',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    margin: 5,
  },
  selectedTag: {
    backgroundColor: '#6C5CE7',
  },
  tagText: {
    color: '#B0B3C6',
    fontSize: 14,
  },
  selectedTagText: {
    color: '#fff',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6C5CE7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  skipButtonText: {
    color: '#6C5CE7',
    fontSize: 16,
  },
  continueButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default WelcomeScreen;

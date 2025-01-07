import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDarkMode } from './Context/DarkMode';

const reasons = [
  { id: '1', reason: 'It’s spam' },
  { id: '2', reason: 'Nudity or sexual activity' },
  { id: '3', reason: 'Hate speech or symbols' },
  { id: '4', reason: 'Violence or dangerous organizations' },
  { id: '5', reason: 'Harassment or bullying' },
  { id: '6', reason: 'Suicide or self-injury' },
  { id: '7', reason: 'False information' },
  { id: '8', reason: 'Scam or fraud' },
  { id: '9', reason: 'I just don’t like it' },
];

const ReportScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { darkMode } = useDarkMode();
  const [selectedReason, setSelectedReason] = useState(null);

  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const dividerColor = darkMode ? '#555' : '#E5E5E5';
  const activeColor = '#6C5CE7';

  const handleConfirmBlock = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason to block the user.');
      return;
    }

    // Perform block action here
    Alert.alert(
      'User Reported',
      `You have blocked the user for the reason: "${selectedReason}"`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.reasonItem,
        { backgroundColor: selectedReason === item.reason ? activeColor : backgroundColor },
      ]}
      onPress={() => setSelectedReason(item.reason)}
    >
      <Text style={[styles.reasonText, { color: selectedReason === item.reason ? '#fff' : textColor }]}>
        {item.reason}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Report User</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for alignment */}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={[styles.title, { color: textColor }]}>Why are you reporting this user?</Text>
        <FlatList
          data={reasons}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.reasonList}
          ItemSeparatorComponent={() => <View style={[styles.divider, { backgroundColor: dividerColor }]} />}
        />
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: activeColor }]}
          onPress={handleConfirmBlock}
        >
          <Text style={styles.confirmButtonText}>Block</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  reasonList: {
    flexGrow: 1,
    marginBottom: 20,
  },
  reasonItem: {
    paddingVertical: 15,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  reasonText: {
    fontSize: 15,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 5,
  },
  confirmButton: {
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 10,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportScreen;

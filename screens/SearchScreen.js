import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { apiUrl } from './config';
import { useDarkMode } from './Context/DarkMode';

const SearchScreen = ({ route, navigation }) => {
  const initialChar = route.params?.initialChar || '';
  const [searchQuery, setSearchQuery] = useState(initialChar);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { darkMode } = useDarkMode();

  // Dynamic color variables
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#fff';
  const inputBgColor = darkMode ? '#444' : '#f0f0f0';
  const inputTextColor = darkMode ? '#ddd' : '#000';
  const borderColor = darkMode ? '#555' : '#eee';
  const placeholderColor = darkMode ? '#888' : '#666';

  const searchUsers = async (query) => {
    if (!query) {
      setUsers([]);
      return;
    }

    const searchTerm = query.startsWith('@') ? query.substring(1) : query;
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${apiUrl}/search_users.php?query=${searchTerm}`);
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Failed to fetch users');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.userCard, { borderBottomColor: borderColor }]}
      onPress={() => navigation.navigate('Profile', { userId: item.id })}
    >
      <Image
        source={
          item.profile_image
            ? { uri: item.profile_image }
            : require('./assets/Profile.png')
        }
        style={styles.profileImage}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: textColor }]}>
          @{item.username}
        </Text>
        <Text style={[styles.fullName, { color: placeholderColor }]}>
          {item.full_name}
        </Text>
        {item.bio && (
          <Text style={[styles.bio, { color: placeholderColor }]} numberOfLines={1}>
            {item.bio}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const handleClearSearch = () => {
    setSearchQuery(initialChar);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View style={[styles.searchContainer, { backgroundColor: inputBgColor }]}>
          <MaterialIcons name="search" size={20} color={placeholderColor} />
          <TextInput
            style={[styles.searchInput, { color: inputTextColor }]}
            placeholder={initialChar ? "Search users..." : "Search..."}
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
          />
          {searchQuery.length > (initialChar ? 1 : 0) && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
            >
              <MaterialIcons name="close" size={20} color={placeholderColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#0000ff" />
      ) : error ? (
        <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() =>
            searchQuery.length > (initialChar ? 1 : 0) ? (
              <Text style={[styles.noResults, { color: placeholderColor }]}>
                No users found
              </Text>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    padding: 10,
  },
  userCard: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  fullName: {
    fontSize: 14,
    marginBottom: 2,
  },
  bio: {
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default SearchScreen;

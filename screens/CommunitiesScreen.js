import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Searchbar } from 'react-native-paper';
import { useDarkMode } from './Context/DarkMode'; // Make sure to import your context

// Add example data for testing
const sampleCommunities = [
  {
    id: '1',
    name: 'Tech Enthusiasts',
    description: 'A community for tech lovers and innovators sharing latest trends and discoveries',
    profileImage: 'https://via.placeholder.com/50',
    followers: 1234
  },
  {
    id: '2',
    name: 'Digital Artists',
    description: 'Creative space for digital artists to share work and collaborate',
    profileImage: 'https://via.placeholder.com/50',
    followers: 2345
  }
];

const CommunitiesScreen = () => {
  const { darkMode } = useDarkMode();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState(sampleCommunities);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setCommunities(sampleCommunities);
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderCommunityItem = ({ item }) => (
    <TouchableOpacity style={[styles.communityCard, { backgroundColor: darkMode ? '#2d2d2d' : '#fff' }]}>
      <Image
        source={{ uri: item.profileImage }}
        style={styles.profileImage}
      />
      <View style={styles.contentContainer}>
        <Text style={[styles.communityName, { color: darkMode ? '#fff' : '#1a1a1a' }]}>{item.name}</Text>
        <Text numberOfLines={2} style={[styles.description, { color: darkMode ? '#ccc' : '#666' }]}>
          {item.description}
        </Text>
      </View>
      <View style={styles.followersContainer}>
        <Text style={[styles.followersCount, { color: darkMode ? '#fff' : '#1a1a1a' }]}>
          {item.followers.toLocaleString()}
        </Text>
        <Text style={[styles.followersLabel, { color: darkMode ? '#aaa' : '#666' }]}>Followers</Text>
      </View>
    </TouchableOpacity>
  );

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="group-off" size={64} color={darkMode ? '#ccc' : '#666'} />
      <Text style={[styles.emptyText, { color: darkMode ? '#ccc' : '#666' }]}>
        Currently no available community to display
      </Text>
    </View>
  );

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#F5F5F5' }]}>
      <Searchbar
        placeholder="Search communities"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: darkMode ? '#333' : '#fff' }]}
      />
      <FlatList
        data={filteredCommunities}
        renderItem={renderCommunityItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={EmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  communityCard: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  followersContainer: {
    alignItems: 'center',
    minWidth: 70,
  },
  followersCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  followersLabel: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CommunitiesScreen;

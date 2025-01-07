import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from './Context/DarkMode';

const UserProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const windowWidth = Dimensions.get('window').width;

  const { darkMode } = useDarkMode();
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';
  const tabInactiveColor = darkMode ? '#888' : '#666';
  const dividerColor = darkMode ? '#555' : '#E5E5E5';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate data fetching
    setTimeout(() => {
      // Here you would typically fetch new data
      setRefreshing(false);
    }, 2000);
  }, []);

  const renderEmptyState = (type) => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons
        name={type === 'posts' ? 'post-outline' : 'help-circle-outline'}
        size={50}
        color={darkMode ? '#aaa' : '#666'}
      />
      <Text style={[styles.emptyStateText, { color: textColor }]}>
        {type === 'posts' ? 'No posts available' : 'No questions available'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {/* Background Image */}
      <Image
        source={require('./assets/HomeBackground.png')}
        style={styles.backgroundImage}
      />

      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color='0000' />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={24} color='0000' />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C5CE7"
            colors={['#6C5CE7']}
            progressBackgroundColor={darkMode ? '#555' : '#fff'}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Image
              source={require('./assets/Profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.displayName, { color: textColor }]}>
                Chandru <Text style={styles.badge}>WARLORD</Text>
              </Text>
              <Text style={[styles.username, { color: darkMode ? '#aaa' : '#666' }]}>
                @cant.be.better
              </Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: darkMode ? '#ccc' : '#444' }]}>
            Web | Graphics | UI/UX Designer.{'\n'}Tweets about tech, startups, and innovation.
          </Text>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderColor: dividerColor }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>12k</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>1.2k</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>3k</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>forums</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>200</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>following</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabContainer, { borderBottomColor: dividerColor }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => setActiveTab('posts')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'posts' ? '#6C5CE7' : tabInactiveColor },
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'qa' && styles.activeTab]}
            onPress={() => setActiveTab('qa')}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'qa' ? '#6C5CE7' : tabInactiveColor },
              ]}
            >
              Q&A
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {refreshing ? (
            <ActivityIndicator color="#6C5CE7" style={styles.loadingIndicator} />
          ) : activeTab === 'posts' ? (
            posts.length > 0 ? (
              posts.map((post) => renderPost(post))
            ) : (
              renderEmptyState('posts')
            )
          ) : questions.length > 0 ? (
            questions.map((question) => renderPost(question))
          ) : (
            renderEmptyState('qa')
          )}
        </View>
      </ScrollView>

      {/* Write Button */}
      <TouchableOpacity style={[styles.writeButton, { backgroundColor: darkMode ? '#444' : '#2D3436' }]} onPress={() => navigation.navigate('WritePost')}>
        <Text style={[styles.writeButtonText, { color: textColor }]}>Write</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainScroll: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 125,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    zIndex: 1,
  },
  profileContainer: {
    padding: 16,
    marginTop: 40
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  nameContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  badge: {
    fontSize: 12,
    color: '#6C5CE7',
    fontWeight: '600',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  bio: {
    fontSize: 14,
    color: '#444',
    marginBottom: 16,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly', // Ensures equal spacing between stats
    paddingHorizontal: 5,
    marginVertical: 5,
    marginHorizontal: -5,
    marginRight: 10,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  statDivider: {
    width: 4,
    height: 4,
    borderRadius: 1,
    backgroundColor: '#666',
    marginHorizontal: -10, // Adds consistent spacing around the divider
  },
  followingContainer: {
    alignItems: 'center',
    marginTop: 16, // Ensures proper spacing above the following section
  },
  followingCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  followingNumber: {
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6C5CE7',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#6C5CE7',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    minHeight: 300, // Ensure there's enough space to scroll
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  writeButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2D3436',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  writeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    padding: 20,
  },
});

export default UserProfileScreen;
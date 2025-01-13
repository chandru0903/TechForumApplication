import React, { useState, useCallback, useEffect } from 'react';
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
  Modal,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'timeago.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from './Context/DarkMode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from './components/PostCard';


const UserProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const { darkMode } = useDarkMode();
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';
  const tabInactiveColor = darkMode ? '#888' : '#666';
  const dividerColor = darkMode ? '#555' : '#E5E5E5';

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      setUserId(userId);
      
      if (!userId) {
        return;
      }
      
      const response = await fetch('http://192.168.151.27/TechForum/backend/profile.php?id=' + userId);
      const data = await response.json();
      
      if (data.success && data.data) {
        setProfileData(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      if (!userId) return;
      
      const response = await fetch('http://192.168.151.27/TechForum/backend/post_type.php?action=bookmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        fetchUserPosts();
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
    }
  };

  const handleLike = async (postId) => {
    try {
      if (!userId) return;
      
      const response = await fetch('http://192.168.151.27/TechForum/backend/post_type.php?action=react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          reaction_type: 'like'
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        fetchUserPosts();
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };
  
  const handleDislike = async (postId) => {
    try {
      if (!userId) return;
      
      const response = await fetch('http://192.168.151.27/TechForum/backend/post_type.php?action=react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          reaction_type: 'dislike'
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        fetchUserPosts();
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
  
      const response = await fetch(
        `http://192.168.151.27/TechForum/backend/posts_view.php?user_id=${userId}&post_type=${activeTab === 'posts' ? 'post' : 'qa'}`
      );
      const data = await response.json();
      
      if (data.success) {
        if (activeTab === 'posts') {
          setPosts(data.data);
        } else {
          setQuestions(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      fetchProfileData(),
      fetchUserPosts()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [activeTab]);

  useEffect(() => {
    fetchUserPosts();
  }, [activeTab]);

  useEffect(() => {
    fetchProfileData();
    fetchUserPosts();
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
        <Image
          source={require('./assets/HomeBackground.png')}
          style={styles.backgroundImage}
        />

        <View style={[styles.header]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color='0000' />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.menuButton}>
            <MaterialCommunityIcons name="menu" size={24} color='0000' />
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileContainer}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <Image
              source={profileData?.profile_image ? { uri: profileData.profile_image } : require('./assets/Profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.displayName, { color: textColor }]}>
                {profileData?.full_name || profileData?.username || 'Loading...'} <Text style={styles.badge}>WARLORD</Text>
              </Text>
              <Text style={[styles.username, { color: darkMode ? '#aaa' : '#666' }]}>
                @{profileData?.username || 'loading...'}
              </Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: darkMode ? '#ccc' : '#444' }]}>
            {profileData?.bio || 'No bio available'}
          </Text>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderColor: dividerColor }]}>
            {/* Stats items... */}
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
          {loading ? (
            <ActivityIndicator color="#6C5CE7" style={styles.loadingIndicator} />
          ) : activeTab === 'posts' ? (
            posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  darkMode={darkMode}
                  userId={userId}
                  onLike={handleLike}
                  onDislike={handleDislike}
                  onBookmark={handleBookmark}
                  onRefresh={fetchUserPosts}
                />
              ))
            ) : (
              renderEmptyState('posts')
            )
          ) : questions.length > 0 ? (
            questions.map(question => (
              <PostCard
                key={question.id}
                post={question}
                darkMode={darkMode}
                userId={userId}
                onLike={handleLike}
                onDislike={handleDislike}
                onBookmark={handleBookmark}
                onRefresh={fetchUserPosts}
              />
            ))
          ) : (
            renderEmptyState('qa')
          )}
        </View>
      </ScrollView>

      {/* Write Button */}
      <TouchableOpacity 
        style={[styles.writeButton, { backgroundColor: darkMode ? '#444' : '#2D3436' }]} 
        onPress={() => navigation.navigate('WritePost')}
      >
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
  postContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    marginTop: 2,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingTop:20,
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    
    right: 10,
    zIndex: 1,
    padding: 0,
  },
  readMoreText: {
    marginTop: 5,
    fontWeight: '500',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});

export default UserProfileScreen;
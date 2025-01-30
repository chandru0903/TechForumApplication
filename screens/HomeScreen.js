import React, { useState, useEffect,useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView, Image, StyleSheet, 
  TouchableOpacity, SafeAreaView, Dimensions, Modal,
  ActivityIndicator, Animated, RefreshControl, Alert
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { useDarkMode } from './Context/DarkMode';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from './components/PostCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const OverlayMenu = ({ isVisible, onClose, darkMode, navigation }) => {
  const slideAnimation = React.useRef(new Animated.Value(-width)).current;
  const menuItems = [
    { icon: 'question-answer', label: 'Q&A', route: 'Forum' },
    { icon: 'person', label: 'Profile', route: 'UserProfile' },
    { icon: 'group', label: 'Community', route: 'Communities' },
    { icon: 'settings', label: 'Settings', route: 'Settings' },
    { icon: 'notifications', label: 'Notifications', route: 'Notifications' },
  
  ];
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: isVisible ? 0 : -width,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, [isVisible]);

  return (
    <Animated.View style={[styles.overlay, {
      transform: [{ translateX: slideAnimation }],
      backgroundColor: darkMode ? '#1a1a1a' : '#fff'
    }]}>
      <View style={styles.overlayHeader}>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
      </View>
      
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.overlayItem, { backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5' }]}
          onPress={() => {
            if (item.onPress) {
              item.onPress();
            } else {
              navigation.navigate(item.route);
            }
            onClose();
          }}
        >
          <MaterialIcons name={item.icon} size={24} color={darkMode ? '#fff' : '#000'} />
          <Text style={[styles.overlayText, { color: darkMode ? '#fff' : '#000' }]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [menuVisible, setMenuVisible] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [trendingNews, setTrendingNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  const [profileData, setProfileData] = useState(null);
  const [searchInput, setSearchInput] = useState('');
   const [refreshing, setRefreshing] = useState(false);
   const [posts, setPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [postsError, setPostsError] = useState(null);
 

  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`http://192.168.133.11/TechForum/backend/comment4post.php?post_id=${postId}`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      } else {
        console.error('Failed to fetch comments');
        Alert.alert('Error', 'Could not load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Network error while fetching comments');
    }
  };

  // Function to post a new comment
  const postComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await fetch('http://192.168.133.11/TechForum/backend/comment4post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: selectedPostId,
          user_id: userId,
          comment_text: newComment.trim(),
          comment_type: 'comment'
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh comments after posting
        await fetchComments(selectedPostId);
        setNewComment('');
      } else {
        Alert.alert('Error', data.message || 'Could not post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Could not post comment');
    }
  };

  const handleSearchPress = (text) => {
  
      navigation.navigate('Search', { initialChar: '@' });
      setSearchInput(''); // Clear the text input
  
   };

   const fetchProfileData = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`http://192.168.133.11/TechForum/backend/profile.php?id=${userId}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setProfileData(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Could not load profile data');
    }
  };


    useEffect(() => {
        fetchProfileData();
      }, []);
  
      const welcomePost = {
        id: 'welcome',
        user_id: 'admin',
        username: 'Admin',
        profile_image: require('./assets/Admin.png'),
        title: 'Welcome 👋',
        description: "Welcome to the TechForum community—we're glad to get you as part of us. This is a space to build community with other enthusiastic and knowledgeable...",
        created_at: '25d',
        
        isAdmin: true
      };

  
    // Initial fetch when the screen loads for the first time
    useEffect(() => {
      fetchProfileData();
    }, []);

  

  const [communities] = useState([
    { id: 1, name: 'C++', members: '7,800', icon: require('./assets/CPP.png') },
    { id: 2, name: 'Space X', members: '14,240', icon: require('./assets/space.png') },
    { id: 3, name: 'Figma', members: '22,150', icon: require('./assets/Figma.png') },
    { id: 4, name: 'GamesToDate', members: '35,600', icon: require('./assets/GamesToDate.png') }
  ]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`http://192.168.133.11/TechForum/backend/home.php?user_id=${userId}&post_type=post`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      } else {
        Alert.alert('Error', 'Could not fetch posts');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Network error while fetching posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId, reactionDetails) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await fetch('http://192.168.133.11/TechForum/backend/post_reaction.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionDetails.newReaction || null
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? {
                  ...post, 
                  user_reaction: reactionDetails.newReaction,
                  likes_count: post.likes_count + (reactionDetails.likesDelta || 0),
                  dislikes_count: post.dislikes_count + (reactionDetails.dislikesDelta || 0)
                }
              : post
          )
        );
      } else {
        Alert.alert('Error', data.message || 'Could not process reaction');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      Alert.alert('Error', 'Network error processing like');
    }
  };

  // Handle Dislike Reaction
  const handleDislike = async (postId, reactionDetails) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      const response = await fetch('http://192.168.133.11/TechForum/backend/post_reaction.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionDetails.newReaction || null
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? {
                  ...post, 
                  user_reaction: reactionDetails.newReaction,
                  dislikes_count: post.dislikes_count + (reactionDetails.dislikesDelta || 0),
                  likes_count: post.likes_count + (reactionDetails.likesDelta || 0)
                }
              : post
          )
        );
      } else {
        Alert.alert('Error', data.message || 'Could not process reaction');
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
      Alert.alert('Error', 'Network error processing dislike');
    }
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([fetchProfileData(), fetchPosts()])
      .finally(() => setRefreshing(false));
  }, []);

  // Lifecycle Effects
  useEffect(() => {
    fetchProfileData();
    fetchPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      fetchPosts();
    }, [])
  );

  const renderPosts = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#6C5CE7" />;
    }

    return posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        darkMode={darkMode}
        userId={profileData?.id}
        onLike={handleLike}
        onDislike={handleDislike}
        onRefresh={fetchPosts}
        navigation={navigation}
      />
    ));
  };


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}>
      <ScrollView
        style={[styles.scrollView, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6C5CE7"
            colors={['#6C5CE7']}
            progressBackgroundColor={darkMode ? '#2d2d2d' : '#fff'}
          />
        }
      >
        <View style={styles.bgImageContainer}>
          <Image source={require('./assets/HomeBackground.png')} style={styles.bgImage} />
        </View>

        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
            <MaterialIcons name="menu" size={24} color={darkMode ? '#010' : '#000'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile')}>
            <Image
                          source={profileData?.profile_image ? { uri: profileData.profile_image } : require('./assets/Profile.png')}
                          style={styles.profilePic}
                        />
          </TouchableOpacity>
        </View>

        <Text style={[styles.headerText, { color: darkMode ? '#000' : '#000' }]}><Text style={[styles.headerText, { color: darkMode ? '#000' : '#000' }]}>Hi, </Text>
                        {profileData?.full_name || profileData?.username || 'Loading...'} 
                      </Text>

                      <TouchableOpacity
        style={[
          styles.searchContainer,
          {
            backgroundColor: darkMode ? '#2d2d2d' : '#fff',
            borderColor: darkMode ? '#444' : '#e5e5e5',
          },
        ]}
        onPress={() => {
          // Allow normal search navigation if no @ is pressed
          navigation.navigate('Search', { initialChar: '@' });
        }}
      >
        <MaterialIcons
          name="search"
          size={20}
          color={darkMode ? '#fff' : '#666'}
        />
        
        <TextInput
  style={[
    styles.searchInput,
    {
      color: darkMode ? '#888' : '#666',
    },
  ]}
  placeholder="Search users..."
  placeholderTextColor={darkMode ? '#888' : '#666'}
  onChangeText={handleSearchPress}
  value={searchInput}
/>

      </TouchableOpacity>




{/* Top Communities */}
<View style={styles.section}>
  <Text
    style={[
      styles.sectionTitle,
      { color: darkMode ? '#fff' : '#000' },
    ]}
  >
    Top Communities
  </Text>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.communitiesContainer}
  >
    {communities.map((community) => (
      <TouchableOpacity
        onPress={() => navigation.navigate('Community')}
        key={community.id}
        style={[
          styles.communityCard,
          { backgroundColor: darkMode ? '#2d2d2d' : '#fff' },
        ]}
      >
        <Image source={community.icon} style={styles.communityIcon} />
        <Text
          style={[
            styles.communityName,
            { color: darkMode ? '#fff' : '#000' },
          ]}
        >
          {community.name}
        </Text>
        <Text
          style={[
            styles.communityMembers,
            { color: darkMode ? '#ccc' : '#666' },
          ]}
        >
          <MaterialIcons name="groups" size={12} color={darkMode ? '#ccc' : '#666'} />{' '}
          {community.members} members
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>

{/* Welcome Post */}
<View style={styles.section}>
  <Text
    style={[
      styles.sectionTitle,
      { color: darkMode ? '#fff' : '#000' },
    ]}
  >
    Welcome Post
  </Text>
  <View
    style={[
      styles.postCard,
      { backgroundColor: darkMode ? '#2d2d2d' : '#fff' },
    ]}
  >
    <View style={styles.postHeader}>
      <View style={styles.postAuthor}>
          <Image
            source={require('./assets/Admin.png')}
            style={styles.authorAvatar}
          />
        
        <View>
          <Text
            style={[
              styles.authorName,
              { color: darkMode ? '#fff' : '#000' },
            ]}
          >
            Admin
          </Text>
          <Text
            style={[
              styles.postTime,
              { color: darkMode ? '#ccc' : '#666' },
            ]}
          >
            25d
          </Text>
        </View>
      </View>
    </View>
    <Text
      style={[
        styles.postTitle,
        { color: darkMode ? '#fff' : '#000' },
      ]}
    >
      Welcome 👋
    </Text>
    <Text
      style={[
        styles.postContent,
        { color: darkMode ? '#ccc' : '#666' },
      ]}
    >
      Welcome to the TechForum community—we're glad to get you as part of
      us. This is a space to build community with other enthusiastic and
      knowledgeable...
    </Text>
  </View>
</View>

        {/* Today's Trending */}
        {/* Posts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#000' }]}>
            Recent Posts
          </Text>
          {renderPosts()}
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <OverlayMenu
        isVisible={menuVisible}
        onClose={() => setMenuVisible(false)}
        darkMode={darkMode}
        navigation={navigation}
      />

<Modal
      animationType="slide"
      transparent={true}
      visible={isCommentsVisible}
      onRequestClose={() => setIsCommentsVisible(false)}
    >
      <View
        style={[
          styles.modalContainer,
          { backgroundColor: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            { backgroundColor: darkMode ? '#1a1a1a' : '#fff' },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                styles.modalTitle,
                { color: darkMode ? '#fff' : '#000' },
              ]}
            >
              Comments
            </Text>
            <TouchableOpacity onPress={() => setIsCommentsVisible(false)}>
              <MaterialIcons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.commentsList}>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <View
                  key={comment.id}
                  style={[
                    styles.commentItem,
                    { borderBottomColor: darkMode ? '#333' : '#ccc' },
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <Image
                      source={
                        comment.profile_image 
                          ? { uri: comment.profile_image }
                          : require('./assets/Profile.png')
                      }
                      style={styles.commentAuthorAvatar}
                    />
                    <Text
                      style={[
                        styles.commentAuthorName,
                        { color: darkMode ? '#fff' : '#000' },
                      ]}
                    >
                      {comment.username}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.commentText,
                      { color: darkMode ? '#ccc' : '#333' },
                    ]}
                  >
                    {comment.comment_text}
                  </Text>
                  <Text
                    style={[
                      styles.commentTime,
                      { color: darkMode ? '#666' : '#999' },
                    ]}
                  >
                    {new Date(comment.created_at).toLocaleString()}
                  </Text>
                </View>
              ))
            ) : (
              <Text 
                style={[
                  styles.noCommentsText, 
                  { color: darkMode ? '#ccc' : '#666' }
                ]}
              >
                No comments yet. Be the first to comment!
              </Text>
            )}
          </ScrollView>
          <View
            style={[
              styles.commentInputContainer,
              { backgroundColor: darkMode ? '#2a2a2a' : '#f7f7f7' },
            ]}
          >
            <TextInput
              style={[
                styles.commentInput,
                { color: darkMode ? '#fff' : '#000' },
              ]}
              placeholder="Write a comment..."
              placeholderTextColor={darkMode ? '#777' : '#666'}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={postComment}
            >
              <MaterialIcons 
                name="send" 
                size={24} 
                color={darkMode ? '#4da6ff' : '#007AFF'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.75,
    paddingTop: 50,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlayHeader: {
    marginBottom: 30,
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  overlayText: {
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  bgImageContainer: {
    position: 'absolute',
    top: 0,
    bottom: 100,
    right: 0,
    width: 400,
    height: 150,
    opacity: 10.0,
    
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerText: {
    marginRight: 100,
    marginLeft: 20,
    marginTop: 10,
    fontSize: 24,
    fontWeight: '600',
    alignContent: 'center',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 5,
  },
  actionButtonActive: {
    opacity: 1,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  actionTextActive: {
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
    marginBottom: 10,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e5e5e5',
    padding: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  communitiesContainer: {
    paddingRight: 20,
    marginBottom: 10,
  },
  communityCard: {
    width: width * 0.35,
    backgroundColor: '#fff',
    marginRight: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  communityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  communityMembers: {
    fontSize: 12,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
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
    marginBottom: 15,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  trendingAuthorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  trendingPost: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  trendingAuthorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  noNewsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});

const additionalStyles = StyleSheet.create({
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  loader: {
    marginVertical: 20,
  },
  loadMoreButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  loadMoreButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentAuthorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentAuthorName: {
    fontWeight: '500',
    fontSize: 14,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 15,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    padding: 5,
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
  noPostsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontSize: 16,
  },
});


// Merge the additional styles with the existing styles
Object.assign(styles, additionalStyles);
export default HomeScreen;
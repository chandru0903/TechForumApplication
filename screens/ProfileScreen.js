import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert, 
  Dimensions,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from './Context/DarkMode';
import { apiUrl } from './config';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from './components/PostCard';
import QNA_Card from './components/QNA_Card';

const ProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [slideAnim] = useState(new Animated.Value(0));
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const screenWidth = Dimensions.get('window').width;

  const { darkMode } = useDarkMode();
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';
  const tabInactiveColor = darkMode ? '#888' : '#666';
  const dividerColor = darkMode ? '#555' : '#E5E5E5';

  const dynamicStyles = {
    contentWrapper: {
      flex: 1,
      width: '100%',
      overflow: 'hidden',
    },
    animatedContainer: {
      flex: 1,
      width: screenWidth * 2,
    },
    tabContent: {
      width: screenWidth,
    },
    emptyStateContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      backgroundColor: 'transparent',
      minHeight: 200,
      width: screenWidth,
    },
  };

  const getCurrentUserId = async () => {
    try {
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setCurrentUserId(userData.id);
        return userData.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  };

  const fetchUserPosts = async () => {
    try {
      console.log('Fetching posts for user:', userId);
      
      // Fetch posts
      const postsResponse = await fetch(
        `${apiUrl}/posts_view.php?user_id=${userId}&post_type=post`
      );
      
      // Fetch questions
      const questionsResponse = await fetch(
        `${apiUrl}/posts_view.php?user_id=${userId}&post_type=qa`
      );
  
      const postsData = await postsResponse.json();
      const questionsData = await questionsResponse.json();
  
      console.log('Posts response:', postsData);
      console.log('Questions response:', questionsData);
  
      if (postsData.success) {
        // Ensure comments_count is properly converted to a number
        const processedPosts = postsData.data.map(post => ({
          ...post,
          comments_count: post.comments_count ? parseInt(post.comments_count, 10) : 0
        }));
        setPosts(processedPosts);
      }
      if (questionsData.success) {
        // Ensure comments_count is properly converted to a number
        const processedQuestions = questionsData.data.map(question => ({
          ...question,
          comments_count: question.comments_count ? parseInt(question.comments_count, 10) : 0
        }));
        setQuestions(processedQuestions);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const switchTab = (tab) => {
    Animated.spring(slideAnim, {
      toValue: tab === 'posts' ? 0 : -screenWidth,
      useNativeDriver: true,
      friction: 8,
      tension: 50
    }).start();
    
    setActiveTab(tab);
  };

  const handleLike = async (postId) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId'); // Add this line to get userId
      if (!authToken || !userId) return;
  
      const response = await fetch(`http://192.168.133.11/TechForum/backend/post_reaction.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: parseInt(userId), // Add user_id to the request
          reaction_type: 'like'
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Like response:', result); // Add this for debugging
        fetchUserPosts();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };
  
  const handleDislike = async (postId) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      const userId = await AsyncStorage.getItem('userId'); // Add this line to get userId
      if (!authToken || !userId) return;
  
      const response = await fetch(`http://192.168.133.11/TechForum/backend/post_reaction.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: parseInt(userId), // Add user_id to the request
          reaction_type: 'dislike'
        }),
      });
  
      if (response.ok) {
        const result = await response.json();
        console.log('Dislike response:', result); // Add this for debugging
        fetchUserPosts();
      } else {
        const errorData = await response.json();
        console.error('Server error:', errorData);
      }
    } catch (error) {
      console.error('Error handling dislike:', error);
    }
  };

  const handleBookmark = async (postId) => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) return;

      const response = await fetch(`${apiUrl}/post_bookmark.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          post_id: postId
        }),
      });

      if (response.ok) {
        fetchUserPosts();
      }
    } catch (error) {
      console.error('Error handling bookmark:', error);
    }
  };

  const lightThemeStyles = {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    secondaryTextColor: '#666666',
  };

  const darkThemeStyles = {
    backgroundColor: '#2C2C2C',
    textColor: '#FFFFFF',
    secondaryTextColor: '#CCCCCC',
  };

  const handleVote = async (postId, voteType) => {
    try {
      if (!userId) return;
      
      const response = await fetch('http://192.168.133.11/TechForum/backend/post_reaction.php?action=react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          reaction_type: voteType === 'upvote' ? 'like' : 'dislike'
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        setQuestions(prevQuestions => {
          return prevQuestions.map(question => {
            if (question.id === postId) {
              // Check if user already had a vote
              const hadUpvote = question.user_reaction === 'like';
              const hadDownvote = question.user_reaction === 'dislike';
              
              let likes = question.likes_count || 0;
              let dislikes = question.dislikes_count || 0;
              let newUserReaction = null;
  
              // Remove existing vote if clicking same button
              if ((voteType === 'upvote' && hadUpvote) || 
                  (voteType === 'downvote' && hadDownvote)) {
                if (hadUpvote) likes--;
                if (hadDownvote) dislikes--;
                newUserReaction = null;
              } 
              // Switch vote if clicking different button
              else {
                if (voteType === 'upvote') {
                  likes++;
                  if (hadDownvote) dislikes--;
                  newUserReaction = 'like';
                } else {
                  dislikes++;
                  if (hadUpvote) likes--;
                  newUserReaction = 'dislike';
                }
              }
  
              return {
                ...question,
                likes_count: likes,
                dislikes_count: dislikes,
                user_reaction: newUserReaction
              };
            }
            return question;
          });
        });
      }
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };
  const renderContent = () => (
    <View style={dynamicStyles.contentWrapper}>
      <Animated.View 
        style={[
          dynamicStyles.animatedContainer,
          {
            transform: [{ translateX: slideAnim }],
            flexDirection: 'row',
          }
        ]}
      >
        {/* Posts Tab Content */}
        <View style={dynamicStyles.tabContent}>
          {loading ? (
            <ActivityIndicator color="#6C5CE7" style={styles.loadingIndicator} />
          ) : posts.length > 0 ? (
            posts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                darkMode={darkMode}
                userId={currentUserId}
                onLike={handleLike}
                onDislike={handleDislike}
                onBookmark={handleBookmark}
                onRefresh={fetchUserPosts}
              />
            ))
          ) : (
            renderEmptyState('posts')
          )}
        </View>

        {/* Q&A Tab Content */}
        <View style={dynamicStyles.tabContent}>
          {loading ? (
            <ActivityIndicator color="#6C5CE7" style={styles.loadingIndicator} />
          ) : questions.length > 0 ? (
            questions.map(question => (
              <QNA_Card
                key={question.id}
                item={question}
                darkMode={darkMode}
                onPress={() => navigation.navigate('QuestionDetail', { questionId: question.id })}
                onVote={handleVote}
                currentUser={userId}
                themeStyles={{
                  backgroundColor: darkMode ? '#333' : '#f9f9f9',
                  textColor: darkMode ? '#fff' : '#000'
                }}
              />
            ))
          ) : (
            renderEmptyState('qa')
          )}
        </View>
      </Animated.View>
    </View>
  );

  useEffect(() => {
    Promise.all([fetchUserProfile(), fetchUserPosts()]);
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const authToken = await AsyncStorage.getItem('authToken');
      const currentUserId = await AsyncStorage.getItem('userId');
  
      if (!authToken || !currentUserId) {
        navigation.replace('Search');
        return;
      }
  
      const response = await fetch(
        `${apiUrl}/user_profile.php?userId=${userId}&currentUserId=${currentUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
      }
  
      const data = await response.json();
  
      if (data.success) {
        setUserData(data.user);
        setIsFollowing(data.user.isFollowing);
      } else {
        setError(data.message || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.message.includes('not authenticated')) {
        navigation.replace('Search');
      } else {
        setError('Failed to fetch user profile. Please try again later.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const handleFollow = async () => {
    try {
      const [authToken, loggedInUserId] = await Promise.all([
        AsyncStorage.getItem('authToken'),
        AsyncStorage.getItem('userId')
      ]);
  
      if (!authToken || !loggedInUserId) {
        navigation.replace('Search');
        return;
      }
  
      // Don't set loading to true since we're not refreshing the whole screen
      const requestUrl = `${apiUrl}/toggle_follow.php`;
      const requestData = {
        follower_id: loggedInUserId,
        following_id: userId,
      };
  
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestData)
      });
  
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid server response: ${responseText}`);
      }
  
      if (!response.ok) {
        throw new Error(data?.message || `Server error: ${response.status}`);
      }
  
      if (data.success) {
        // Update only the following status and followers count
        setIsFollowing(data.isFollowing);
        setUserData(prevData => ({
          ...prevData,
          stats: {
            ...prevData.stats,
            followers: data.updatedCounts.followers
          }
        }));
      } else {
        throw new Error(data.message || 'Failed to update follow status');
      }
    } catch (err) {
      console.error('Follow error:', err);
      Alert.alert(
        'Error',
        err.message || 'Unable to update follow status. Please try again later.'
      );
    }
  
    
  
  
  };  const renderEmptyState = (type) => (
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

 
  

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      
      fetchUserPosts()
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [userId]);

  useFocusEffect(
      useCallback(() => {
        fetchUserProfile(); // Call the API when the screen is focused
      }, [])
    );
  
    // Initial fetch when the screen loads for the first time
    useEffect(() => {
      fetchUserProfile();
    }, []);
  
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <Text style={[styles.errorText, { color: textColor }]}>{error}</Text>
      </View>
    );
  }

  const toggleModal = () => setModalVisible(!isModalVisible);

  const shareProfile = async () => {
    const shareOptions = {
      title: 'Share Profile',
      message: 'Check out this amazing profile on TechForum!',
      url: 'https://example.com/admin-profile', // Replace with dynamic URL if available
    };
    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.log('Error sharing profile:', error);
    }
  };

  const copyProfileURI = () => {
    Alert.alert('Copied', 'Profile URI copied to clipboard.');
    // Clipboard functionality can be added here if needed
  };

  const reportProfile = () => {
    Alert.alert('Reported', 'Profile has been reported.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const restrictProfile = () => {
    Alert.alert('Restricted', 'Profile has been restricted.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    
      <SafeAreaView style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      <ScrollView
        style={styles.mainScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6C5CE7']}
            progressBackgroundColor={darkMode ? '#555' : '#fff'}
          />
        }
      >
        
      <Image
        source={require('./assets/HomeBackground.png')}
        style={styles.backgroundImage}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color='0000' />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleModal} style={styles.menuButton}>
          <MaterialCommunityIcons name="dots-horizontal" size={24} color='0000' />
        </TouchableOpacity>
      </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Image
              source={userData?.profile_image ? { uri: userData.profile_image } : require('./assets/Admin.png')}
              style={styles.profileImage}
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.displayName, { color: textColor }]}>
                {userData?.full_name || 'Loading...'} 
                <Text style={styles.badge}> WARLORD</Text>
              </Text>
              <Text style={[styles.username, { color: darkMode ? '#aaa' : '#666' }]}>
                @{userData?.username || 'loading...'}
              </Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: darkMode ? '#ccc' : '#444' }]}>
            {userData?.bio || 'Loading bio...'}
          </Text>

          

          <View style={[styles.statsRow, { borderColor: dividerColor }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {userData?.stats?.followers || 0}
              </Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{userData?.stats?.posts || 0}</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>{userData?.stats?.qna || 0}</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>Q&A</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>
                {userData?.stats?.following || 0}
              </Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>following</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
            style={[
              styles.followButton,
              { backgroundColor: isFollowing ? '#E0E0E0' : '#6C5CE7' }
            ]}
            onPress={handleFollow}
          >
            <Text style={[styles.followButtonText, { color: isFollowing ? '#000' : '#fff' }]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.tabContainer, { borderBottomColor: dividerColor }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
            onPress={() => switchTab('posts')}
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
            onPress={() => switchTab('qa')}
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

        {renderContent()}

        
      </ScrollView>

      <Modal
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        style={styles.modal}
        useNativeDriver
      >
        <View style={[styles.modalContent, { backgroundColor }]}>
          <TouchableOpacity style={styles.modalOption} onPress={shareProfile}>
            <MaterialCommunityIcons name="share-variant" size={20} color={textColor} />
            <Text style={[styles.modalOptionText, { color: textColor }]}>Share Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={copyProfileURI}>
            <MaterialCommunityIcons name="link-variant" size={20} color={textColor} />
            <Text style={[styles.modalOptionText, { color: textColor }]}>Copy Profile URI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={reportProfile}>
            <MaterialCommunityIcons name="flag" size={20} color="#FF3B30" />
            <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={restrictProfile}>
            <MaterialCommunityIcons name="lock" size={20} color={textColor} />
            <Text style={[styles.modalOptionText, { color: textColor }]}>Restrict</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
    marginTop: 40,
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
    justifyContent: 'space-evenly',
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 16,
  },
  followButton: {
    marginTop: 10,
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  content: {
    flex: 1,
    minHeight: 300,
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
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  animatedContainer: {
    flex: 1,
    width: Dimensions.get('window').width * 2,
  },
  tabContent: {
    width: Dimensions.get('window').width,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: 'transparent',
    minHeight: 200,
    width: Dimensions.get('window').width,
  },
});
export default ProfileScreen;

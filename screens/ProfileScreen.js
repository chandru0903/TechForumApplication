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
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import Share from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from './Context/DarkMode';
import { apiUrl } from './config';
import { useFocusEffect } from '@react-navigation/native';

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

  const { darkMode } = useDarkMode();
  const backgroundColor = darkMode ? '#333' : '#f9f9f9';
  const textColor = darkMode ? '#fff' : '#000';
  const headerColor = darkMode ? '#222' : '#003f8a';
  const tabInactiveColor = darkMode ? '#888' : '#666';
  const dividerColor = darkMode ? '#555' : '#E5E5E5';

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

  const renderContent = () => {
    if (!userData) return null;

    return (
      <View style={styles.content}>
        {activeTab === 'posts' ? (
          Array.isArray(userData.posts) && userData.posts.length > 0 ? (
            userData.posts.map((post) => renderPost(post))
          ) : (
            renderEmptyState('posts')
          )
        ) : (
          Array.isArray(userData.questions) && userData.questions.length > 0 ? (
            userData.questions.map((question) => renderQuestion(question))
          ) : (
            renderEmptyState('qa')
          )
        )}
      </View>
    );
  };

  

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserProfile();
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
              <Text style={[styles.statNumber, { color: textColor }]}>1.2k</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>3k</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>forums</Text>
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
});
export default ProfileScreen;

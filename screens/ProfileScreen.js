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
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Modal from 'react-native-modal';
import Share from 'react-native-share';
import { useDarkMode } from './Context/DarkMode';

const ProfileScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [isModalVisible, setModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false); // State for Follow button
    const windowWidth = Dimensions.get('window').width;
  
    const { darkMode } = useDarkMode();
    const backgroundColor = darkMode ? '#333' : '#f9f9f9';
    const textColor = darkMode ? '#fff' : '#000';
    const followButton = darkMode ? '#222' : '#003f8a';
    const tabInactiveColor = darkMode ? '#888' : '#666';
    const dividerColor = darkMode ? '#555' : '#E5E5E5';

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
    
      const handleFollow = () => {
        setIsFollowing(!isFollowing); // Toggle the follow state
      };
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      // Simulate data fetching
      setTimeout(() => {
        // Here you would typically fetch new data
        setRefreshing(false);
      }, 2000);
    }, []);
  
  
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
    Alert.alert('Reported', 'Profile has been reported.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const restrictProfile = () => {
    Alert.alert('Restricted', 'Profile has been restricted.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {/* Background Image */}
      <Image
        source={require('./assets/Background2.png')}
        style={styles.backgroundImage}
      />

      {/* Header */}
      <View style={[styles.header]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color='#fff' />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleModal} style={styles.menuButton}>
          <MaterialCommunityIcons name="menu" size={24} color='#fff' />
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
              source={require('./assets/Admin.png')}
              style={styles.profileImage}
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.displayName, { color: textColor }]}>
                Admin <Text style={styles.badge}>TECH ENTHUSIAST</Text>
              </Text>
              <Text style={[styles.username, { color: darkMode ? '#aaa' : '#666' }]}>
                @Admin
              </Text>
            </View>
          </View>

          <Text style={[styles.bio, { color: darkMode ? '#ccc' : '#444' }]}>
            Developer | Innovator | Lifelong Learner.{"\n"}Passionate about tech, AI, and startups.
          </Text>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderColor: dividerColor }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>5k</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>300</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: textColor }]}>150</Text>
              <Text style={[styles.statLabel, { color: tabInactiveColor }]}>questions</Text>
            </View>
          </View>

          {/* Follow Button */}
          <TouchableOpacity
            onPress={handleFollow} color={darkMode ? '#aaa' : '#666'}
            style={[styles.followButton, { backgroundColor: isFollowing ? '#6C5CE7' : '#2D3436' }]}
          >
            <Text style={[styles.followButtonText, { color: '#fff' }]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
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

      {/* Modal for menu options */}
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
          <TouchableOpacity style={styles.modalOption} onPress={()=> navigation.navigate('Report')}>
            <MaterialCommunityIcons name="flag" size={20} color='#FF3B30' />
            <Text style={[styles.modalOptionText, { color: '#FF3B30' }]}>Report</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={reportProfile} >
            <MaterialCommunityIcons name="block-helper" size={20} color={textColor} />
            <Text style={[styles.modalOptionText, { color: textColor }]}>Block</Text>
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
  container: { flex: 1 },
  mainScroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuButton: { padding: 8 },
  modal: { justifyContent: 'flex-end', margin: 0, },
  modalContent: {
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    alignItems: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
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
    marginTop: 20
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
  followButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  followButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingIndicator: {
    padding: 20,
  },
});


export default ProfileScreen;

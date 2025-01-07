import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDarkMode } from './Context/DarkMode';
import Share from 'react-native-share';

const CommunityScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const { darkMode } = useDarkMode();
  const [isBlocked, setIsBlocked] = useState(false);

  // Dark mode color scheme
  const theme = {
    background: darkMode ? '#121212' : '#D9DAE9',
    surface: darkMode ? '#1E1E1E' : '#FFFFFF',
    primary: darkMode ? '#BB86FC' : '#6C5CE7',
    primaryVariant: darkMode ? '#3700B3' : '#4C3FD1',
    secondary: darkMode ? '#03DAC6' : '#007AFF',
    textPrimary: darkMode ? '#FFFFFF' : '#000000',
    textSecondary: darkMode ? '#B0B0B0' : '#666666',
    border: darkMode ? '#2C2C2C' : '#E5E5E5',
    overlay: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    card: darkMode ? '#2C2C2C' : '#FFFFFF',
    error: '#CF6679',
    headerOverlay: darkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
    tabInactive: darkMode ? '#4A4A4A' : '#F0F0F0',
  };

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
  


  const handleLike = (id, type) => {
    if (type === 'posts') {
      setPosts(posts.map(post => {
        if (post.id === id) {
          if (post.isDisliked) {
            return {
              ...post,
              isLiked: !post.isLiked,
              isDisliked: false,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              dislikes: post.dislikes - 1,
            };
          }
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      }));
    } else {
      setQuestions(questions.map(question => {
        if (question.id === id) {
          if (question.isDisliked) {
            return {
              ...question,
              isLiked: !question.isLiked,
              isDisliked: false,
              likes: question.isLiked ? question.likes - 1 : question.likes + 1,
              dislikes: question.dislikes - 1,
            };
          }
          return {
            ...question,
            isLiked: !question.isLiked,
            likes: question.isLiked ? question.likes - 1 : question.likes + 1,
          };
        }
        return question;
      }));
    }
  };

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    setShowOverlay(false);
  };
  
  const handleDislike = (id, type) => {
    if (type === 'posts') {
      setPosts(posts.map(post => {
        if (post.id === id) {
          if (post.isLiked) {
            return {
              ...post,
              isDisliked: !post.isDisliked,
              isLiked: false,
              dislikes: post.isDisliked ? post.dislikes - 1 : post.dislikes + 1,
              likes: post.likes - 1,
            };
          }
          return {
            ...post,
            isDisliked: !post.isDisliked,
            dislikes: post.isDisliked ? post.dislikes - 1 : post.dislikes + 1,
          };
        }
        return post;
      }));
    } else {
      setQuestions(questions.map(question => {
        if (question.id === id) {
          if (question.isLiked) {
            return {
              ...question,
              isDisliked: !post.isDisliked,
              isLiked: false,
              dislikes: question.isDisliked ? question.dislikes - 1 : question.dislikes + 1,
              likes: question.likes - 1,
            };
          }
          return {
            ...question,
            isDisliked: !post.isDisliked,
            dislikes: question.isDisliked ? question.dislikes - 1 : question.dislikes + 1,
          };
        }
        return question;
      }));
    }
  };

  const renderEmptyState = (type) => (
    <View style={styles.emptyStateContainer}>
      <MaterialCommunityIcons
        name={type === 'posts' ? 'post-outline' : 'help-circle-outline'}
        size={50}
        color="#666"
      />
      <Text style={styles.emptyStateText}>
        {type === 'posts' ? 'No posts available' : 'No questions available'}
      </Text>
      <Text style={styles.emptyStateSubText}>
        {type === 'posts'
          ? 'Posts will appear here once available'
          : 'Questions will appear here once available'}
      </Text>
    </View>
  );

  const renderPost = (item, type) => (
    <View key={item.id} style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <Image source={{ uri: item.authorImage }} style={styles.authorImage} />
          <View>
            <Text style={styles.authorName}>{item.author}</Text>
            <Text style={styles.postTime}>{item.time}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.postImage} />
      )}
      <Text style={styles.postContent}>{item.content}</Text>

      <View style={styles.postFooter}>
        <View style={styles.interactions}>
          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => handleLike(item.id, type)}
          >
            <MaterialCommunityIcons
              name={item.isLiked ? 'thumb-up' : 'thumb-up-outline'}
              size={20}
              color={item.isLiked ? '#007AFF' : '#666'}
            />
            <Text style={styles.interactionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.interactionButton}>
            <MaterialCommunityIcons name="comment-outline" size={20} color="#666" />
            <Text style={styles.interactionText}>{item.comments}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.interactionButton}
            onPress={() => handleDislike(item.id, type)}
          >
            <MaterialCommunityIcons
              name={item.isDisliked ? 'thumb-down' : 'thumb-down-outline'}
              size={20}
              color={item.isDisliked ? '#FF3B30' : '#666'}
            />
            <Text style={styles.interactionText}>{item.dislikes}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagContainer}>
          <Text style={styles.tag}>{item.tag}</Text>
        </View>
      </View>
    </View>
  );

  const description = 'The biggest video game news, rumors, previews, and info about the PC, PlayStation, Xbox, Ninte...';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Header Background and Navigation */}
      <View style={styles.headerContainer}>
        <Image
          source={require('./assets/Community.png')}
          style={styles.headerBackground}
        />
        <View style={[styles.headerOverlay, { backgroundColor: theme.headerOverlay }]}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('UserProfile')}>
                <Image
                  source={require('./assets/Profile.png')}
                  style={styles.profileImage}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => setShowOverlay(true)}>
                <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Updated Community Info Layout */}
          <View style={styles.communityInfoContainer}>
            <View style={styles.communityHeaderRow}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/150?img=10' }}
                style={styles.communityIcon}
              />
              <View style={styles.communityTextContainer}>
                <Text style={styles.communityName}>GamesToDate</Text>
                <Text style={styles.communityMembers}>2.3k members</Text>
              </View>
              <TouchableOpacity
                style={[styles.followButton, isFollowing && styles.followingButton]}
                onPress={() => setIsFollowing(!isFollowing)}
              >
                <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                  {isFollowing ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.descriptionContainer}>
              <Text
                style={styles.communityDescription}
                numberOfLines={showFullDescription ? undefined : 4}
              >
                {description}
              </Text>
              {description.length > 200 && (
                <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
                  <Text style={styles.moreText}>
                    {showFullDescription ? 'Show less' : 'More'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      
      {/* Stats Bar */}
      <View style={[styles.statsContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.statsItem}>
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>324</Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Posts</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={[styles.statsNumber, { color: theme.textPrimary }]}>1.2k</Text>
          <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Forums</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: theme.surface }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'posts' ? theme.primary : theme.tabInactive }
          ]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'posts' ? '#FFFFFF' : theme.textSecondary }
          ]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            { backgroundColor: activeTab === 'qa' ? theme.primary : theme.tabInactive }
          ]}
          onPress={() => setActiveTab('qa')}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === 'qa' ? '#FFFFFF' : theme.textSecondary }
          ]}>Q&A</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {isBlocked ? (
          <View style={[styles.blockedContainer, { backgroundColor: theme.surface }]}>
            <MaterialCommunityIcons name="lock" size={50} color={theme.textSecondary} />
            <Text style={[styles.blockedText, { color: theme.textSecondary }]}>
              This community is blocked
            </Text>
            <TouchableOpacity 
              style={[styles.unblockButton, { backgroundColor: theme.secondary }]}
              onPress={handleBlock}
            >
              <Text style={styles.unblockButtonText}>Unblock Community</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Post rendering with updated styles
          <View style={styles.postsContainer}>
            {activeTab === 'posts'
              ? posts.length > 0
                ? posts.map(post => (
                    <View key={post.id} style={[styles.postContainer, { backgroundColor: theme.surface }]}>
                      <View style={styles.postHeader}>
                        <View style={styles.authorInfo}>
                          <Image source={{ uri: post.authorImage }} style={styles.authorImage} />
                          <View>
                            <Text style={[styles.authorName, { color: theme.textPrimary }]}>{post.author}</Text>
                            <Text style={[styles.postTime, { color: theme.textSecondary }]}>{post.time}</Text>
                          </View>
                        </View>
                        <TouchableOpacity>
                          <MaterialCommunityIcons name="dots-vertical" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.postTitle, { color: theme.textPrimary }]}>{post.title}</Text>
                      {post.image && (
                        <Image source={{ uri: post.image }} style={styles.postImage} />
                      )}
                      <Text style={[styles.postContent, { color: theme.textSecondary }]}>{post.content}</Text>
                      <View style={styles.postFooter}>
                        <View style={styles.interactions}>
                          <TouchableOpacity
                            style={styles.interactionButton}
                            onPress={() => handleLike(post.id, 'posts')}
                          >
                            <MaterialCommunityIcons
                              name={post.isLiked ? 'thumb-up' : 'thumb-up-outline'}
                              size={20}
                              color={post.isLiked ? theme.secondary : theme.textSecondary}
                            />
                            <Text style={[styles.interactionText, { color: theme.textSecondary }]}>{post.likes}</Text>
                          </TouchableOpacity>
                          {/* Other interaction buttons... */}
                        </View>
                        <View style={[styles.tagContainer, { backgroundColor: theme.tabInactive }]}>
                          <Text style={[styles.tag, { color: theme.textSecondary }]}>{post.tag}</Text>
                        </View>
                      </View>
                    </View>
                  ))
                : renderEmptyState('posts')
              : questions.length > 0
              ? questions.map(question => (hi))
              : renderEmptyState('qa')}
          </View>
        )}
      </ScrollView>

      {/* Create Button */}
      {isFollowing && (
        <TouchableOpacity 
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('WritePost')}
        >
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      )}

      {/* Overlay Menu */}
      {showOverlay && (
        <TouchableOpacity 
          style={[styles.overlay, { backgroundColor: theme.overlay }]}
          activeOpacity={1}
          onPress={() => setShowOverlay(false)}
        >
          <View style={[styles.bottomMenu, { backgroundColor: theme.surface }]}>
            <TouchableOpacity style={styles.menuItem} onPress={shareProfile}>
              <MaterialCommunityIcons name="share-variant" size={24} color={theme.textPrimary} />
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Share Community</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
              <MaterialCommunityIcons 
                name={isBlocked ? "lock-open" : "lock"}
                size={24}
                color={theme.textPrimary}
              />
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>
                {isBlocked ? "Unblock Community" : "Block Community"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, styles.reportItem]} onPress={() => navigation.navigate('Report')}>
              <MaterialCommunityIcons name="flag" size={24} color={theme.error} />
              <Text style={[styles.menuText, { color: theme.error }]}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9DAE9',
  },
  communityHeader: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  communityIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  communityInfo: {
    flex: 1,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  communityMembers: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  communityDescription: {
    fontSize: 14,
    color: '#444',
    marginTop: 5,
  },
  followButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    margin: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  followingButton: {
    backgroundColor: '#007AFF',
  },
  followButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 5,
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 5,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  tabText: {
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    marginLeft: 8,
    flex: 1,
  },
  postContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorName: {
    fontWeight: '600',
    fontSize: 16,
  },
  postTime: {
    color: '#666',
    fontSize: 12,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#444',
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  interactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  interactionText: {
    marginLeft: 5,
    color: '#666',
  },
  tagContainer: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  tag: {
    fontSize: 12,
    color: '#666',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 20,
    padding: 30,
    borderRadius: 10,
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 15,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 15,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  communityInfoContainer: {
    padding: 15,
  },
  communityHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  communityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  communityTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  communityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  communityMembers: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  descriptionContainer: {
    marginTop: 10,
  },
  communityDescription: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  moreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  followButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 15,
  },
  followingButton: {
    backgroundColor: '#fff',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  followingButtonText: {
    color: '#6C5CE7',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 10,
    padding: 15,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statsItem: {
    alignItems: 'center',
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    
  },
  bottomMenu: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
   
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    
    
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#000',
  },
  reportItem: {
    borderBottomWidth: 0,
  },
  reportText: {
    color: '#FF3B30',
  },
  // Add blocked styles
  blockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    minHeight: 200,
  },
  blockedText: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  unblockButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  unblockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
;

// 

export default CommunityScreen;
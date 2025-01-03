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

const CommunityScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [posts, setPosts] = useState([]);
  const [questions, setQuestions] = useState([]);


  

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
              dislikes: post.dislikes - 1
            };
          }
          return {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
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
              dislikes: question.dislikes - 1
            };
          }
          return {
            ...question,
            isLiked: !question.isLiked,
            likes: question.isLiked ? question.likes - 1 : question.likes + 1
          };
        }
        return question;
      }));
    }
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
              likes: post.likes - 1
            };
          }
          return {
            ...post,
            isDisliked: !post.isDisliked,
            dislikes: post.isDisliked ? post.dislikes - 1 : post.dislikes + 1
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
              isDisliked: !question.isDisliked,
              isLiked: false,
              dislikes: question.isDisliked ? question.dislikes - 1 : question.dislikes + 1,
              likes: question.likes - 1
            };
          }
          return {
            ...question,
            isDisliked: !question.isDisliked,
            dislikes: question.isDisliked ? question.dislikes - 1 : question.dislikes + 1
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
              name={item.isLiked ? "thumb-up" : "thumb-up-outline"} 
              size={20} 
              color={item.isLiked ? "#007AFF" : "#666"} 
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
              name={item.isDisliked ? "thumb-down" : "thumb-down-outline"} 
              size={20} 
              color={item.isDisliked ? "#FF3B30" : "#666"} 
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

  const description = "The biggest video game news, rumors, previews, and info about the PC, PlayStation, Xbox, Ninte...";

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header Background and Navigation */}
      <View style={styles.headerContainer}>
        <Image 
          source={require('./assets/Community.png')} 
          style={styles.headerBackground}
        />
        <View style={styles.headerOverlay}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.iconButton}>
                <MaterialCommunityIcons name="magnify" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <Image 
                  source={require('./assets/Profile.png')} 
                  style={styles.profileImage}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
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
      <View style={styles.statsContainer}>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>324</Text>
          <Text style={styles.statsLabel}>Posts</Text>
        </View>
        <View style={styles.statsItem}>
          <Text style={styles.statsNumber}>1.2k</Text>
          <Text style={styles.statsLabel}>Forums</Text>
        </View>
      </View>

      

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'qa' && styles.activeTab]}
          onPress={() => setActiveTab('qa')}
        >
          <Text style={[styles.tabText, activeTab === 'qa' && styles.activeTabText]}>Q&A</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'posts' 
          ? (posts.length > 0 
              ? posts.map(post => renderPost(post, 'posts'))
              : renderEmptyState('posts'))
          : (questions.length > 0 
              ? questions.map(question => renderPost(question, 'qa'))
              : renderEmptyState('qa'))
        }
      </ScrollView>

      {/* Create Button */}
      {isFollowing && (
        <TouchableOpacity style={styles.createButton}>
          
          <Text onPress={() => navigation.navigate('WritePost')} style={styles.createButtonText}>Create</Text>
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
    marginTop:5,
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
    paddingTop:10,
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
});


// Mock data

export default CommunityScreen;
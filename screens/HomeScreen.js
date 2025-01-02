import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';


const { width } = Dimensions.get('window');
const api = axios.create({
  baseURL: 'https://newsdata.io/api/1/news?apikey=pub_6352813b93c086b17c8e10b8cf1924b21507e&q=technology', 
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    
  }
});

const HomeScreen = () => {
  const [communities] = useState([
    { 
      id: 1, 
      name: 'C++', 
      members: '7,800',
      icon: require('./assets/CPP.png')
    },
    { 
      id: 2, 
      name: 'Space X', 
      members: '14,240',
      icon: require('./assets/space.png')
    },
    { 
      id: 3, 
      name: 'Figma', 
      members: '22,150',
      icon: require('./assets/Figma.png')
    }
  ]);

  const [welcomePost, setWelcomePost] = useState({
    likes: 1500,
    comments: 889,
    dislikes: 48,
    isLiked: false,
    isDisliked: false
  });

  

  const [trendingPosts, setTrendingPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isPostDetailVisible, setIsPostDetailVisible] = useState(false);


  // Fetch posts when component mounts and when page changes
  useEffect(() => {
    fetchTrendingPosts();
  }, [page]);

  const fetchTrendingPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get('/posts', {
        params: {
          page,
          limit: 10,
          sort: 'trending'
        }
      });

      const newPosts = response.data.posts.map(post => ({
        ...post,
        interactions: {
          isLiked: false,
          isDisliked: false,
          likes: post.likes || 0,
          dislikes: post.dislikes || 0,
          comments: post.comments || []
        }
      }));

      setTrendingPosts(prev => 
        page === 1 ? newPosts : [...prev, ...newPosts]
      );
      setHasMore(response.data.hasMore);
    } catch (err) {
      setError('Failed to fetch posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      
      setTrendingPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            interactions: {
              ...post.interactions,
              isLiked: !post.interactions.isLiked,
              likes: post.interactions.isLiked 
                ? post.interactions.likes - 1 
                : post.interactions.likes + 1,
              isDisliked: false,
              dislikes: post.interactions.isDisliked 
                ? post.interactions.dislikes - 1 
                : post.interactions.dislikes
            }
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error liking post:', err);
      // Show error toast/alert to user
    }
  };

  const handleDislike = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/dislike`);
      
      setTrendingPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            interactions: {
              ...post.interactions,
              isDisliked: !post.interactions.isDisliked,
              dislikes: post.interactions.isDisliked 
                ? post.interactions.dislikes - 1 
                : post.interactions.dislikes + 1,
              isLiked: false,
              likes: post.interactions.isLiked 
                ? post.interactions.likes - 1 
                : post.interactions.likes
            }
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error disliking post:', err);
      // Show error toast/alert to user
    }
  };

  const handleComment = async (postId, comment) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        content: comment
      });
      
      setTrendingPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            interactions: {
              ...post.interactions,
              comments: [...post.interactions.comments, response.data.comment]
            }
          };
        }
        return post;
      }));
    } catch (err) {
      console.error('Error adding comment:', err);
      // Show error toast/alert to user
    }
  };

  const loadMorePosts = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}`);
      return response.data.post;
    } catch (err) {
      console.error('Error fetching post details:', err);
      throw new Error('Failed to fetch post details');
    }
  };

  const CommentsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isCommentsVisible}
      onRequestClose={() => setIsCommentsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Comments</Text>
            <TouchableOpacity onPress={() => setIsCommentsVisible(false)}>
              <MaterialIcons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.commentsList}>
            {selectedPost?.interactions.comments.map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Image
                    source={{ uri: comment.author?.avatarUrl || 'https://via.placeholder.com/30' }}
                    style={styles.commentAuthorAvatar}
                  />
                  <Text style={styles.commentAuthorName}>
                    {comment.author?.name || 'Anonymous'}
                  </Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
                <Text style={styles.commentTime}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              placeholderTextColor="#666"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={() => {
                if (selectedPost && newComment.trim()) {
                  handleComment(selectedPost.id, newComment);
                  setNewComment('');
                }
              }}
            >
              <MaterialIcons name="send" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );


  const renderTrendingSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Trending</Text>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setPage(1);
              fetchTrendingPosts();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {trendingPosts.map((post) => (
        <TouchableOpacity 
          key={post.id} 
          style={[styles.postCard, { marginBottom: 15 }]}
          onPress={async () => {
            try {
              const details = await fetchPostDetails(post.id);
              setSelectedPost(details);
              setIsPostDetailVisible(true);
            } catch (err) {
              // Show error toast/alert to user
            }
          }}
        >
          <View style={styles.postHeader}>
            <View style={styles.postAuthor}>
              <Image
                source={{ uri: post.author.avatarUrl || 'https://via.placeholder.com/40' }}
                style={styles.authorAvatar}
              />
              <View>
                <Text style={styles.authorName}>{post.author.name}</Text>
                <Text style={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="bookmark" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {post.imageUrl && (
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postContent} numberOfLines={3}>
            {post.content}
          </Text>

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                post.interactions.isLiked && styles.actionButtonActive
              ]}
              onPress={() => handleLike(post.id)}
            >
              <MaterialIcons 
                name="thumb-up" 
                size={16} 
                color={post.interactions.isLiked ? "#007AFF" : "#666"} 
              />
              <Text style={[
                styles.actionText, 
                post.interactions.isLiked && styles.actionTextActive
              ]}>
                {post.interactions.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setSelectedPost(post);
                setIsCommentsVisible(true);
              }}
            >
              <MaterialIcons name="comment" size={16} color="#666" />
              <Text style={styles.actionText}>
                {post.interactions.comments.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.actionButton, 
                post.interactions.isDisliked && styles.actionButtonActive
              ]}
              onPress={() => handleDislike(post.id)}
            >
              <MaterialIcons 
                name="thumb-down" 
                size={16} 
                color={post.interactions.isDisliked ? "#007AFF" : "#666"} 
              />
              <Text style={[
                styles.actionText, 
                post.interactions.isDisliked && styles.actionTextActive
              ]}>
                {post.interactions.dislikes}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      {isLoading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}

      {!isLoading && hasMore && (
        <TouchableOpacity 
          style={styles.loadMoreButton}
          onPress={loadMorePosts}
        >
          <Text style={styles.loadMoreButtonText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Cherry Blossom Background */}
        <View style={styles.bgImageContainer}>
          <Image 
            source={require('./assets/HomeBackground.png')}
            style={styles.bgImage}
            resizeMode="cover"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Hi, ABC</Text>
          <TouchableOpacity>
            <Image 
              source={require('./assets/Profile.png')}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Try searching topics like 'Tesla'"
            placeholderTextColor="#666"
          />
        </View>

        {/* Top Communities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Communities</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.communitiesContainer}
          >
            {communities.map((community) => (
              <TouchableOpacity key={community.id} style={styles.communityCard}>
                <Image source={community.icon} style={styles.communityIcon} />
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityMembers}>
                  <MaterialIcons name="groups" size={12} color="#666" /> {community.members} members
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Welcome Post */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome Post</Text>
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <Image
                  source={require('./assets/Admin.png')}
                  style={styles.authorAvatar}
                />
                <View>
                  <Text style={styles.authorName}>Admin</Text>
                  <Text style={styles.postTime}>25d</Text>
                </View>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="bookmark" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.postTitle}>Welcome 👋</Text>
            <Text style={styles.postContent}>
              Welcome to the TechForum community—we're glad to get you as part of us. This is a space to build community with other enthusiastic and knowledgeable...
            </Text>
            <View style={styles.postActions}>
              <TouchableOpacity 
                style={[styles.actionButton, welcomePost.isLiked && styles.actionButtonActive]}
                onPress={handleLike}
              >
                <MaterialIcons 
                  name="thumb-up" 
                  size={16} 
                  color={welcomePost.isLiked ? "#007AFF" : "#666"} 
                />
                <Text style={[styles.actionText, welcomePost.isLiked && styles.actionTextActive]}>
                  {welcomePost.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setIsCommentsVisible(true)}
              >
                <MaterialIcons name="comment" size={16} color="#666" />
                <Text style={styles.actionText}>{welcomePost.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, welcomePost.isDisliked && styles.actionButtonActive]}
                onPress={handleDislike}
              >
                <MaterialIcons 
                  name="thumb-down" 
                  size={16} 
                  color={welcomePost.isDisliked ? "#007AFF" : "#666"} 
                />
                <Text style={[styles.actionText, welcomePost.isDisliked && styles.actionTextActive]}>
                  {welcomePost.dislikes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {/* Today's Trending */}
<View style={styles.section}>
  <Text style={styles.sectionTitle}>Today's Trending</Text>
  {isLoading ? (
    <ActivityIndicator size="large" color="#007AFF" />
  ) : trendingNews ? (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          <Image
            source={{ uri: trendingNews.image_url || 'https://via.placeholder.com/40' }}
            style={styles.trendingAuthorAvatar}
          />
          <View>
            <Text style={styles.authorName}>{trendingNews.source_id}</Text>
            <Text style={styles.postTime}>{new Date(trendingNews.pubDate).toLocaleDateString()}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="bookmark" size={20} color="#666" />
        </TouchableOpacity>
      </View>
      <Text style={styles.postTitle}>{trendingNews.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {trendingNews.description}
      </Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="thumb-up" size={16} color="#666" />
          <Text style={styles.actionText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="comment" size={16} color="#666" />
          <Text style={styles.actionText}>Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="share" size={16} color="#666" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  ) : (
    <Text style={styles.noNewsText}>No trending news available at the moment.</Text>
  )}
</View>

      </ScrollView>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentsVisible}
        onRequestClose={() => setIsCommentsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setIsCommentsVisible(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.commentsList}>
              {comments.map((comment, index) => (
                <Text key={index} style={styles.commentText}>{comment}</Text>
              ))}
            </ScrollView>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#666"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={handleAddComment}>
                <MaterialIcons name="send" size={24} color="#007AFF" />
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
    backgroundColor: '#f5f5f5',
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
    right: 0,
    width: 200,
    height: 200,
    opacity: 0.5,
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
    fontSize: 24,
    fontWeight: '600',
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
    marginTop: 20,
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
});


// Merge the additional styles with the existing styles
Object.assign(styles, additionalStyles);
export default HomeScreen;
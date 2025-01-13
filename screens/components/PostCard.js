import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'timeago.js';

// Comment Modal Component
const CommentModal = ({ visible, postId, onClose, darkMode, userId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.151.27/TechForum/backend/comments.php?post_id=${postId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch('http://192.168.151.27/TechForum/backend/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          content: newComment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  React.useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>Comments</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsContainer}>
            {loading ? (
              <ActivityIndicator color="#6C5CE7" />
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image
                    source={comment.profile_image ? { uri: comment.profile_image } : require('../assets/Profile.png')}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <Text style={[styles.commentUsername, { color: darkMode ? '#fff' : '#000' }]}>
                      {comment.username}
                    </Text>
                    <Text style={[styles.commentText, { color: darkMode ? '#ccc' : '#666' }]}>
                      {comment.content}
                    </Text>
                    <Text style={styles.commentTime}>{format(comment.created_at)}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.noComments, { color: darkMode ? '#ccc' : '#666' }]}>
                No comments yet
              </Text>
            )}
          </ScrollView>

          <View style={styles.commentInput}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: darkMode ? '#444' : '#f0f0f0',
                  color: darkMode ? '#fff' : '#000'
                }
              ]}
              placeholder="Add a comment..."
              placeholderTextColor={darkMode ? '#999' : '#666'}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { opacity: newComment.trim() ? 1 : 0.5 }]}
              onPress={handleAddComment}
              disabled={!newComment.trim()}
            >
              <MaterialCommunityIcons name="send" size={24} color="#6C5CE7" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main PostCard Component
const PostCard = ({ 
  post, 
  darkMode, 
  userId,
  onLike,
  onDislike,
  onBookmark,
  onRefresh,
}) => {
  const [isFullPostVisible, setIsFullPostVisible] = useState(false);
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const MAX_WORDS = 10;
  const words = post.description ? post.description.split(' ') : [];
  const isLongText = words.length > MAX_WORDS;
  const displayText = isLongText ? words.slice(0, MAX_WORDS).join(' ') + '...' : post.description;

  const handleImagePress = () => {
    setIsImageViewerVisible(true);
  };

  const handleLike = async () => {
    try {
      await onLike(post.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await onDislike(post.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error handling dislike:', error);
    }
  };

  const handleBookmark = async () => {
    try {
      await onBookmark(post.id);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error handling bookmark:', error);
    }
  };

  return (
    <View style={[styles.postContainer, { backgroundColor: darkMode ? '#444' : '#fff' }]}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
          <Image
            source={post.profile_image ? { uri: post.profile_image } : require('../assets/Profile.png')}
            style={styles.authorAvatar}
          />
          <View>
            <Text style={[styles.authorName, { color: darkMode ? '#fff' : '#000' }]}>{post.username}</Text>
            <Text style={[styles.postTime, { color: darkMode ? '#ccc' : '#666' }]}>{post.created_at}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <MaterialCommunityIcons 
            name={post.is_bookmarked ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={post.is_bookmarked ? '#6C5CE7' : darkMode ? '#ccc' : '#666'} 
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.postTitle, { color: darkMode ? '#fff' : '#000' }]}>{post.title}</Text>

      {post.image_url && (
        <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
          <Image
            source={{ uri: `http://192.168.151.27/TechForum/backend/${post.image_url}` }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      )}

      <Text style={[styles.postContent, { color: darkMode ? '#ccc' : '#666' }]}>
        {displayText}
      </Text>
      
      {isLongText && (
        <TouchableOpacity onPress={() => setIsFullPostVisible(true)}>
          <Text style={[styles.readMoreText, { color: '#6C5CE7' }]}>Read more</Text>
        </TouchableOpacity>
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
        >
          <MaterialCommunityIcons
            name={post.user_reaction === 'like' ? "thumb-up" : "thumb-up-outline"}
            size={20}
            color={post.user_reaction === 'like' ? '#6C5CE7' : darkMode ? '#ccc' : '#666'}
          />
          <Text style={[styles.actionText, { color: darkMode ? '#ccc' : '#666' }]}>
            {post.likes_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDislike}
        >
          <MaterialCommunityIcons
            name={post.user_reaction === 'dislike' ? "thumb-down" : "thumb-down-outline"}
            size={20}
            color={post.user_reaction === 'dislike' ? '#6C5CE7' : darkMode ? '#ccc' : '#666'}
          />
          <Text style={[styles.actionText, { color: darkMode ? '#ccc' : '#666' }]}>
            {post.dislikes_count || 0}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowComments(true)}
        >
          <MaterialCommunityIcons
            name="comment-outline"
            size={20}
            color={darkMode ? '#ccc' : '#666'}
          />
          <Text style={[styles.actionText, { color: darkMode ? '#ccc' : '#666' }]}>
            {post.comments_count || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Post Modal */}
      <Modal
        visible={isFullPostVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsFullPostVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: darkMode ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.8)' }]}>
          <ScrollView style={[styles.modalContent, { backgroundColor: darkMode ? '#333' : '#fff' }]}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsFullPostVisible(false)}
            >
              <MaterialCommunityIcons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: darkMode ? '#fff' : '#000' }]}>{post.title}</Text>
            {post.image_url && (
              <Image
                source={{ uri: `http://192.168.151.27/TechForum/backend/${post.image_url}` }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            )}
            <Text style={[styles.modalDescription, { color: darkMode ? '#ccc' : '#666' }]}>
              {post.description}
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View style={styles.imageViewerContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setIsImageViewerVisible(false)}
          >
            <MaterialCommunityIcons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: `http://192.168.151.27/TechForum/backend/${post.image_url}` }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      {/* Comments Modal */}
      <CommentModal
        visible={showComments}
        postId={post.id}
        userId={userId}
        onClose={() => setShowComments(false)}
        darkMode={darkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  readMoreText: {
    marginTop: -8,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
  },
  modalImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginVertical: 16,
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
    padding: 8,
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  // Comment Modal Styles
  commentsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  noComments: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    fontSize: 14,
  },
  sendButton: {
    padding: 8,
  }
});

export default PostCard;
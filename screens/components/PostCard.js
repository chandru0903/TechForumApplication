import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'timeago.js';

const ReplyInput = ({ darkMode, comment, onCancel, onSubmit, value, onChangeText, navigation }) => (
  <View style={[styles.replyInput, { marginLeft: 40 }]}>
    <TextInput
      style={[
        styles.input,
        {
          backgroundColor: darkMode ? '#444' : '#f0f0f0',
          color: darkMode ? '#fff' : '#000'
        }
      ]}
      placeholder="Write a reply..."
      placeholderTextColor={darkMode ? '#999' : '#666'}
      value={value}
      onChangeText={onChangeText}
      multiline
    />
    <View style={styles.replyActions}>
      <TouchableOpacity
        style={[styles.replyButton, { backgroundColor: darkMode ? '#444' : '#f0f0f0' }]}
        onPress={onCancel}
      >
        <Text style={{ color: darkMode ? '#fff' : '#000' }}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.replyButton, { backgroundColor: '#6C5CE7' }]}
        onPress={onSubmit}
      >
        <Text style={{ color: '#fff' }}>Reply</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Comment = ({ comment, darkMode, userId, onReply, onEdit, onDelete, level = 0, navigation }) => {
  const handleDelete = () => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => onDelete(comment.id)
        }
      ]
    );
  };

  return (
    <View style={[styles.commentItem, { marginLeft: level === 0 ? 0 : 40 }]}>
      <Image
        source={comment.profile_image ? { uri: comment.profile_image } : require('../assets/Profile.png')}
        style={styles.commentAvatar}
      />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={[styles.commentUsername, { color: darkMode ? '#fff' : '#000' }]}>
            {comment.username}
          </Text>
          <View style={styles.commentActions}>
            {comment.user_id === userId && (
              <>
                <TouchableOpacity onPress={() => onEdit(comment)} style={styles.actionButton}>
                  <MaterialCommunityIcons name="pencil" size={16} color={darkMode ? '#ccc' : '#666'} />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <MaterialCommunityIcons name="delete" size={16} color={darkMode ? '#ccc' : '#666'} />
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity onPress={() => onReply(comment)} style={styles.replyWrapper}>
              <MaterialCommunityIcons name="reply" size={16} color={darkMode ? '#ccc' : '#666'} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[styles.commentText, { color: darkMode ? '#ccc' : '#666' }]}>
          {comment.content}
        </Text>
        <View style={styles.commentMeta}>
          <Text style={[styles.commentTime, { color: darkMode ? '#999' : '#666' }]}>
            {format(new Date(comment.created_at))}
          </Text>
          {comment.is_edited && (
            <Text style={[styles.editedLabel, { color: darkMode ? '#999' : '#666' }]}>
              (edited)
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const CommentModal = ({ visible, postId, onClose, darkMode, userId, navigation }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://192.168.133.11/TechForum/backend/comment4post.php?postId=${postId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  const handleAddComment = async (parentId = null) => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch('http://192.168.133.11/TechForum/backend/comment4post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          postId,
          userId,
          content: newComment,
          parentId
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        setReplyingTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = async (commentId, content) => {
    try {
      const response = await fetch('http://192.168.133.11/TechForum/backend/comment4post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'edit',
          commentId,
          userId,
          content,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingComment(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error editing comment:', error);
      Alert.alert('Error', 'Failed to edit comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch('http://192.168.133.11/TechForum/backend/comment4post.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          commentId,
          userId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchComments();
      } else {
        Alert.alert('Error', 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };

  const renderCommentThread = (comment) => (
    <View key={comment.id}>
      {editingComment?.id === comment.id ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[styles.editInput, {
              backgroundColor: darkMode ? '#444' : '#f0f0f0',
              color: darkMode ? '#fff' : '#000'
            }]}
            value={editingComment.content}
            onChangeText={(text) => setEditingComment({ ...editingComment, content: text })}
            multiline
            placeholder="Edit your comment..."
            placeholderTextColor={darkMode ? '#999' : '#666'}
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={() => setEditingComment(null)}
              style={[styles.editButton, { backgroundColor: darkMode ? '#444' : '#f0f0f0' }]}
            >
              <Text style={{ color: darkMode ? '#fff' : '#000' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleEditComment(comment.id, editingComment.content)}
              style={[styles.editButton, { backgroundColor: '#6C5CE7' }]}
            >
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <Comment
          comment={comment}
          darkMode={darkMode}
          userId={userId}
          onReply={setReplyingTo}
          onEdit={setEditingComment}
          onDelete={handleDeleteComment}
          level={0}
          navigation={navigation}
        />
      )}

        {replyingTo?.id === comment.id && (
          <ReplyInput
            darkMode={darkMode}
            comment={comment}
            onCancel={() => setReplyingTo(null)}
            onSubmit={() => handleAddComment(comment.id)}
            value={newComment}
            onChangeText={setNewComment}
            navigation={navigation}
          />
        )}

        {comment.replies && (
          <View style={styles.repliesContainer}>
            {comment.replies.map(reply => (
              <View key={reply.id}>
                <Comment
                  comment={reply}
                  darkMode={darkMode}
                  userId={userId}
                  onReply={setReplyingTo}
                  onEdit={setEditingComment}
                  onDelete={handleDeleteComment}
                  level={1}
                  navigation={navigation}
                />
                
                {replyingTo?.id === reply.id && (
                  <ReplyInput
                    darkMode={darkMode}
                    comment={reply}
                    onCancel={() => setReplyingTo(null)}
                    onSubmit={() => handleAddComment(reply.id)}
                    value={newComment}
                    onChangeText={setNewComment}
                    navigation={navigation}
                  />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );

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
                comments.map(comment => renderCommentThread(comment))
              ) : (
                <Text style={[styles.noComments, { color: darkMode ? '#ccc' : '#666' }]}>
                  No comments yet
                </Text>
              )}
            </ScrollView>

            {!replyingTo && (
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
                  onPress={() => handleAddComment()}
                  disabled={!newComment.trim()}
                >
                  <MaterialCommunityIcons name="send" size={24} color="#6C5CE7" />
                </TouchableOpacity>
              </View>
            )}
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
  onRefresh,
  navigation,
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
      // Optimistically update the local state before API call
      const newReaction = post.user_reaction === 'like' ? null : 'like';
      const likesDelta = newReaction === 'like' ? 1 : (post.user_reaction === 'like' ? -1 : 0);
      const dislikesDelta = post.user_reaction === 'dislike' ? -1 : 0;
  
      // Call onLike with updated state information
      await onLike(post.id, {
        newReaction,
        likesDelta,
        dislikesDelta
      });
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };
  
  const handleDislike = async () => {
    try {
      // Optimistically update the local state before API call
      const newReaction = post.user_reaction === 'dislike' ? null : 'dislike';
      const dislikesDelta = newReaction === 'dislike' ? 1 : (post.user_reaction === 'dislike' ? -1 : 0);
      const likesDelta = post.user_reaction === 'like' ? -1 : 0;
  
      // Call onDislike with updated state information
      await onDislike(post.id, {
        newReaction,
        dislikesDelta,
        likesDelta
      });
    } catch (error) {
      console.error('Error handling dislike:', error);
    }
  };

  

  return (
    <View style={[styles.postContainer, { backgroundColor: darkMode ? '#444' : '#fff' }]}>
      <View style={styles.postHeader}>
        <View style={styles.postAuthor}>
        <TouchableOpacity 
  onPress={() => {
    if (post.user_id === userId) {
      navigation.navigate('UserProfile');
    } else {
      navigation.navigate('Profile', { userId: post.user_id });
    }
  }}
>
  <Image
    source={post.profile_image ? { uri: post.profile_image } : require('../assets/Profile.png')}
    style={styles.authorAvatar}
  />
</TouchableOpacity>
          <View>
            <Text style={[styles.authorName, { color: darkMode ? '#fff' : '#000' }]}>{post.username}</Text>
            <Text style={[styles.postTime, { color: darkMode ? '#ccc' : '#666' }]}>{post.created_at}</Text>
          </View>
        </View>
       
      </View>

      <Text style={[styles.postTitle, { color: darkMode ? '#fff' : '#000' }]}>{post.title}</Text>

      {post.image_url && (
        <TouchableOpacity activeOpacity={0.9} onPress={handleImagePress}>
          <Image
            source={{ uri: `http://192.168.133.11/TechForum/backend/${post.image_url}` }}
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
                source={{ uri: `http://192.168.133.11/TechForum/backend/${post.image_url}` }}
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
            source={{ uri: `http://192.168.133.11/TechForum/backend/${post.image_url}` }}
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
  navigation={navigation}
/>
    </View>
  );
};

const styles = StyleSheet.create({
  postContainer: {
    padding: 16,
    marginBottom: 16,
    marginVertical: 8,
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
    marginTop: 16,
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
    right: 0,
    top: -16,
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
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editedLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  replyInput: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#6C5CE7',
    marginLeft: 20,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  replyButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  
});

export default PostCard;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'timeago.js';

const Comment = ({ comment, onReply, onEdit, onDelete, currentUser, themeStyles, level = 0, navigation }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState(`@${comment.username} `);
  const [timeAgo, setTimeAgo] = useState('');
  
  const isLoggedIn = !!currentUser;
  const isCommentOwner = currentUser?.id === comment.user_id;
  const showReplyButton = level === 0;
  
  useEffect(() => {
    const updateTimestamp = () => {
      const date = new Date(comment.created_at);
      const minutesElapsed = Math.floor((new Date() - date) / (1000 * 60));
      
      let formattedTime;
      formattedTime = format(date).replace(/\d+$/, '');
      if (minutesElapsed < 1) {
        formattedTime = 'just now';
      } else if (minutesElapsed < 60) {
        formattedTime = `${minutesElapsed}m ago`;
      } else if (minutesElapsed < 1440) {
        const hours = Math.floor(minutesElapsed / 60);
        formattedTime = `${hours}h ago `;
      } else {
        // Remove any trailing numbers from the timeago.js format
        
      }
      
      setTimeAgo(formattedTime);
    };

    updateTimestamp();
    const interval = setInterval(updateTimestamp, 60000);
    return () => clearInterval(interval);
  }, [comment.created_at]);


  const handleEdit = async () => {
    try {
      const success = await onEdit(comment.id, editedContent);
      if (success) {
        comment.content = editedContent;
        comment.is_edited = true;
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to edit comment');
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      Alert.alert('Error', 'Reply cannot be empty');
      return;
    }

    try {
      const parentId = level === 0 ? comment.parent_id : comment.id;
      const newReply = await onReply(parentId, replyContent);
      if (newReply) {
        if (level === 0 && comment.replies) {
          comment.replies.push(newReply);
        }
        setShowReplyInput(false);
        setReplyContent(`@${comment.username} `);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  return (
    <View style={styles.commentWrapper}>
      <View style={styles.commentContainer}>
        <TouchableOpacity
          onPress={() => {
            if (comment.user_id === currentUser?.id) {
              navigation.navigate('UserProfile');
            } else {
              navigation.navigate('Profile', { userId: comment.user_id });
            }
          }}
        >
          <Image
            source={{ uri: comment.profile_image }}
            style={styles.userAvatar}
          />
        </TouchableOpacity>
        
        <View style={styles.commentContentWrapper}>
          <View style={styles.commentHeader}>
            <TouchableOpacity
              onPress={() => {
                if (comment.user_id === currentUser?.id) {
                  navigation.navigate('UserProfile');
                } else {
                  navigation.navigate('Profile', { userId: comment.user_id });
                }
              }}
            >
              <Text style={[styles.username, themeStyles.text]}>
                {comment.username}
              </Text>
            </TouchableOpacity>
            <Text style={styles.timestamp}>
    {timeAgo}
    {comment.is_edited && ' (edited)'}
  </Text>
          </View>

          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={[styles.editInput, themeStyles.text]}
                value={editedContent}
                onChangeText={setEditedContent}
                multiline
              />
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <Text style={[styles.commentText, themeStyles.text]}>
              {comment.content}
            </Text>
          )}

          <View style={styles.actionBar}>
            {isLoggedIn && (
              <TouchableOpacity 
                onPress={() => setShowReplyInput(!showReplyInput)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>Reply</Text>
              </TouchableOpacity>
            )}
            {isCommentOwner && (
              <>
                <TouchableOpacity 
                  onPress={() => setIsEditing(true)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => onDelete(comment.id)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {showReplyInput && (
            <View style={styles.replyInputContainer}>
              <TextInput
                style={[styles.replyInput, themeStyles.text]}
                value={replyContent}
                onChangeText={setReplyContent}
                placeholder="Add a reply..."
                placeholderTextColor="#666"
                multiline
              />
              <View style={styles.replyButtons}>
                <TouchableOpacity 
                  onPress={() => setShowReplyInput(false)}
                  style={styles.cancelReplyButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleReply}
                  style={[styles.replyButton, !replyContent.trim() && styles.disabledButton]}
                  disabled={!replyContent.trim()}
                >
                  <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>

      {level === 0 && comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              currentUser={currentUser}
              themeStyles={themeStyles}
              level={1}
              navigation={navigation}
            />
          ))}
        </View>
      )}
    </View>
  );
};


const CommentModal = ({ visible, postId, onClose, darkMode, userId, navigation }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = { id: userId };
  const fetchComments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await fetch(`http://192.168.133.11/TechForum/backend/comment4post.php?postId=${postId}`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      if (!silent) {
        Alert.alert('Error', 'Failed to fetch comments');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible]);

  const handleAddComment = async (parentId = null) => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
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
        // First, add a temporary version of the comment
        const tempCommentObj = {
          id: data.commentId,
          content: newComment,
          user_id: userId,
          username: "...", // Temporary placeholder
          profile_image: null, // Temporary placeholder
          created_at: new Date().toISOString(), // Current timestamp for immediate timeago display
          is_edited: false,
          replies: [],
          parent_id: parentId
        };

        if (parentId) {
          setComments(prevComments => 
            prevComments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), tempCommentObj]
                };
              }
              return comment;
            })
          );
        } else {
          setComments(prevComments => [tempCommentObj, ...prevComments]);
        }
        
        setNewComment('');

        // Silently fetch updated comments to get the proper user data
        setTimeout(() => {
          fetchComments(true);
        }, 100);

      } else if (data.toxicity) {
        Alert.alert('Content Warning', data.message, [{ text: 'OK', style: 'default' }]);
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
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
        // Update immediately with the edited content
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, content, is_edited: true };
            }
            if (comment.replies) {
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId 
                    ? { ...reply, content, is_edited: true }
                    : reply
                )
              };
            }
            return comment;
          })
        );

        // Silently fetch updated comments
        setTimeout(() => {
          fetchComments(true);
        }, 100);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error editing comment:', error);
      Alert.alert('Error', 'Failed to edit comment');
      return false;
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
        setComments(prevComments => {
          // First, check if it's a top-level comment
          const filtered = prevComments.filter(comment => comment.id !== commentId);
          
          // If the length is the same, it might be a reply
          if (filtered.length === prevComments.length) {
            return prevComments.map(comment => ({
              ...comment,
              replies: (comment.replies || []).filter(reply => reply.id !== commentId)
            }));
          }
          
          return filtered;
        });

        // Silently fetch updated comments
        setTimeout(() => {
          fetchComments(true);
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };
  const themeStyles = {
    text: { color: darkMode ? '#fff' : '#000' },
    background: { backgroundColor: darkMode ? '#333' : '#fff' },
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: darkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, themeStyles.background]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, themeStyles.text]}>Comments</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <MaterialCommunityIcons name="close" size={24} color={darkMode ? '#fff' : '#000'} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsContainer}>
            {loading ? (
              <ActivityIndicator color="#6C5CE7" />
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onReply={handleAddComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  currentUser={currentUser}
                  themeStyles={themeStyles}
                  navigation={navigation}
                />
              ))
            ) : (
              <Text style={[styles.noComments, { color: darkMode ? '#ccc' : '#666' }]}>
                No comments yet
              </Text>
            )}
          </ScrollView>

          <View style={styles.commentInputContainer}>
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
              editable={!isSubmitting}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                { opacity: newComment.trim() && !isSubmitting ? 1 : 0.5 }
              ]}
              onPress={() => handleAddComment()}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#6C5CE7" />
              ) : (
                <MaterialCommunityIcons name="send" size={24} color="#6C5CE7" />
              )}
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
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  Username: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorActions: {
    flexDirection: 'row',
    marginRight: 8,
  },
  actionButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentTime: {
    fontSize: 12,
  },
  editedLabel: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  mentionsList: {
    maxHeight: 200,
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mentionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sendButtonLoading: {
    opacity: 0.7,
  },
  disabledInput: {
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  commentsContainer: {
    flex: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
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
  noComments: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  commentWrapper: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userAvatar: {
    width: 25,
    height: 25,
    borderRadius: 20,
  },
  commentContentWrapper: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    marginLeft: 10,
    lineHeight: 20,
    marginVertical: 4,
  },
  actionBar: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 16,
  },
  actionButton: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButtonText: {
    color: '#6C5CE7',
    fontWeight: '500',
  },
  replyInputContainer: {
    marginTop: 8,
    marginLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#6C5CE7',
    paddingLeft: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    marginBottom: 8,
  },
  replyButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  replyButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  cancelReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cancelButtonText: {
    color: '#666',
  },
  disabledButton: {
    opacity: 0.5,
  },
  repliesContainer: {
    marginLeft: 32,
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
    paddingLeft: 16,
  },
  // Updated Modal styles for fullscreen
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noComments: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  }
});

export default PostCard;
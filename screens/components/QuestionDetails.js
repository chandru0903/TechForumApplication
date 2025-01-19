import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from '../Context/DarkMode';

const Comment = ({ comment, onReply, onEdit, onDelete, currentUser, themeStyles, level = 0  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    
    
    
  
    const isLoggedIn = !!currentUser;
  const isCommentOwner = currentUser?.id === comment.user_id; 
  const maxReplyLevel = 5; // Maximum nesting level
  const handleEdit = async () => {
    try {
        const success = await onEdit(comment.id, editedContent);
        if (success) {
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
        const success = await onReply(comment.id, replyContent);
        if (success) {
            setShowReplyInput(false);
            setReplyContent('');
        }
    } catch (error) {
        Alert.alert('Error', 'Failed to post reply');
    }
};
  const getLineColor = (level) => {
    const colors = ['#FF4500', '#00A6A5', '#9F44D3', '#3F9FE0', '#E07A5F'];
    return colors[level % colors.length];
};
  
  return (
    <View style={[
        styles.commentWrapper,
        level > 0 && styles.nestedCommentWrapper,
    ]}>
        {level > 0 && (
            <View
                style={[
                    styles.verticalLine,
                    { backgroundColor: getLineColor(level - 1) }
                ]}
            />
        )}
        <View style={[
            styles.commentContainer,
            themeStyles.card,
            level > 0 && styles.nestedComment
        ]}>
            <View style={styles.commentHeader}>
                <Image
                    source={{ uri: comment.author_image || 'https://via.placeholder.com/30' }}
                    style={styles.commentAuthorImage}
                />
                <Text style={[styles.commentAuthorName, themeStyles.text]}>
                    {comment.username}
                </Text>
                <Text style={[styles.commentTimestamp, themeStyles.secondaryText]}>
                    {new Date(comment.created_at).toLocaleDateString()}
                    {comment.is_edited && <Text style={styles.editedText}> (edited)</Text>}
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
                    <View style={styles.editButtons}>
                        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                            <Text style={styles.editButtonText}>Save</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.cancelButton}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <Text style={[styles.commentContent, themeStyles.text]}>
                    {comment.content}
                </Text>
            )}

            <View style={styles.commentActions}>
                {isLoggedIn && level < maxReplyLevel && (
                    <>
                        <TouchableOpacity onPress={() => setShowReplyInput(!showReplyInput)}>
                            <Text style={styles.actionText}>Reply</Text>
                        </TouchableOpacity>
                        {isCommentOwner && (
                            <>
                                <TouchableOpacity onPress={() => setIsEditing(true)}>
                                    <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => onDelete(comment.id)}>
                                    <Text style={styles.actionText}>Delete</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                )}
            </View>

            {showReplyInput && (
                <View style={styles.replyContainer}>
                    <TextInput
                        style={[styles.replyInput, themeStyles.text]}
                        value={replyContent}
                        onChangeText={setReplyContent}
                        placeholder={`Reply to @${comment.username}...`}
                        placeholderTextColor={themeStyles.secondaryText.color}
                        multiline
                    />
                    <TouchableOpacity
                        onPress={handleReply}
                        style={[
                            styles.replyButton,
                            !replyContent.trim() && styles.replyButtonDisabled
                        ]}
                        disabled={!replyContent.trim()}
                    >
                        <Text style={styles.replyButtonText}>Post Reply</Text>
                    </TouchableOpacity>
                </View>
            )}

            {comment.replies && comment.replies.length > 0 && (
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
                            level={level + 1}
                        />
                    ))}
                </View>
            )}
        </View>
    </View>
);
};

const QuestionDetailScreen = ({ route, navigation }) => {
  const { questionId } = route.params;
  const { darkMode } = useDarkMode();
  const [question, setQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showNestedReplyInput, setShowNestedReplyInput] = useState(false);
  const [nestedReplyContent, setNestedReplyContent] = useState('');
  const fetchCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        console.log('No user ID found in AsyncStorage');
        setCurrentUser(null);
        return;
      }
  
      const response = await fetch(
        `http://192.168.151.27/TechForum/backend/profile.php?id=${userId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = await response.json();
      
      // Check for data in the correct location of the response
      if (responseData.success && responseData.data) {
        setCurrentUser(responseData.data); // Set the data directly from responseData.data
        console.log('Current user set:', responseData.data);
      } else {
        console.log('Failed to fetch user data:', responseData.message);
        console.log('API Response:', responseData);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      setCurrentUser(null);
    }
  };
  
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          fetchQuestionDetails(),
          fetchCurrentUser(),
          fetchComments()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setHasError(true);
      }
    };

    loadData();
  }, [questionId]);

  // Add error boundary render
  if (hasError) {
    return (
      <View style={[styles.errorContainer, themeStyles.container]}>
        <Text style={[styles.errorText, themeStyles.text]}>
          Something went wrong. Please try again later.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setHasError(false);
            fetchCurrentUser();
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
 

  const fetchComments = async () => {
    try {
      const response = await fetch(
        `http://192.168.151.27/TechForum/backend/comments.php?postId=${questionId}`
      );
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    
    // Check if user is logged in by checking currentUser
    if (!currentUser || !currentUser.id) {
      Alert.alert('Error', 'Please log in to post a comment');
      return;
    }
  
    try {
      setIsPostingComment(true);
      const response = await fetch('http://192.168.151.27/TechForum/backend/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          userId: currentUser.id,
          content: newComment,
          postId: questionId,
          mentionIds: extractMentionIds(newComment),
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      } else {
        Alert.alert('Error', data.message || 'Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment. Please try again later.');
    } finally {
      setIsPostingComment(false);
    }
  };
  
  const handleReplyToComment = async (parentCommentId, content) => {
    if (!currentUser || !currentUser.id) {
      Alert.alert('Error', 'Please log in to reply');
      return false;
    }
  
    try {
      setIsPostingComment(true);
      const response = await fetch('http://192.168.151.27/TechForum/backend/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          userId: currentUser.id,
          content: content,
          postId: questionId,
          parentId: parentCommentId,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        await fetchComments(); // Refresh comments after successful reply
        return true;
      } else {
        Alert.alert('Error', data.message || 'Failed to post reply');
        return false;
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      Alert.alert('Error', 'Failed to post reply');
      return false;
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleNestedReply = async (parentReplyId) => {
    if (!nestedReplyContent.trim()) {
      Alert.alert('Error', 'Reply cannot be empty');
      return;
    }

    try {
      const success = await onReply(parentReplyId, nestedReplyContent);
      if (success) {
        setShowNestedReplyInput(false);
        setNestedReplyContent('');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to post reply');
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      const response = await fetch('http://192.168.151.27/TechForum/backend/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'edit',
          commentId,
          userId: currentUser.id,
          content: newContent,
          is_edited: true // Add this flag
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        fetchComments(); // Refresh comments after successful edit
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error editing comment:', error);
      return false;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch('http://192.168.151.27/TechForum/backend/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete',
          commentId,
          userId: currentUser.id,
        }),
      });
  
      const data = await response.json();
      if (data.success) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  };
  const handleMentionSearch = async (text) => {
    const mentionMatch = text.match(/@(\w+)$/);
    if (mentionMatch) {
      try {
        const response = await fetch(
          `http://192.168.151.27/TechForum/backend/search_users.php?query=${mentionMatch[1]}`
        );
        const data = await response.json();
        if (data.success) {
          setMentionSuggestions(data.users);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      }
    } else {
      setMentionSuggestions([]);
    }
  };

  const extractMentionIds = (content) => {
    const mentions = content.match(/@(\w+)/g) || [];
    return mentions.map(mention => mention.substring(1)); // Remove @ symbol
  };

 

  
  const fetchQuestionDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://192.168.151.27/TechForum/backend/get_question_details.php?questionId=${questionId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuestion(data.question);
      } else {
        Alert.alert('Error', 'Failed to fetch question details');
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      Alert.alert('Error', 'Failed to fetch question details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const themeStyles = darkMode ? {
    container: { backgroundColor: '#1a1a1a' },
    text: { color: '#fff' },
    card: { backgroundColor: '#2d2d2d' },
    separator: { backgroundColor: '#404040' },
    secondaryText: { color: '#b3b3b3' },
  } : {
    container: { backgroundColor: '#f8f9fa' },
    text: { color: '#2c3e50' },
    card: { backgroundColor: '#fff' },
    separator: { backgroundColor: '#e1e8ed' },
    secondaryText: { color: '#647687' },
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, themeStyles.container]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!question) {
    return (
      <View style={[styles.errorContainer, themeStyles.container]}>
        <Text style={[styles.errorText, themeStyles.text]}>Question not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, themeStyles.container]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        {question && (
          <View style={[styles.questionCard, themeStyles.card]}>
            <View style={styles.questionHeader}>
              <Text style={[styles.title, themeStyles.text]}>{question.title}</Text>
              <Text style={[styles.timestamp, themeStyles.secondaryText]}>
                {formatDate(question.created_at)}
              </Text>
            </View>

            <Text style={[styles.description, themeStyles.text]}>
              {question.description}
            </Text>

            {question.image_url && (
              <Image
                source={{ uri: question.image_url }}
                style={styles.questionImage}
                resizeMode="contain"
              />
            )}

            <View style={styles.authorInfo}>
              <Image
                source={{ uri: question.profile_image || 'https://via.placeholder.com/40' }}
                style={styles.authorImage}
              />
              <Text style={[styles.authorName, themeStyles.secondaryText]}>
                {question.username}
              </Text>
            </View>
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={[styles.commentsTitle, themeStyles.text]}>
          Comments ({comments.reduce((total, comment) => 
    total + 1 + (comment.replies?.length || 0), 0
  )})
          </Text>

          <View style={[styles.commentInputContainer, themeStyles.card]}>
            <TextInput
              style={[styles.commentInput, themeStyles.text]}
              value={newComment}
              onChangeText={(text) => {
                setNewComment(text);
                handleMentionSearch(text);
              }}
              placeholder="Write a comment..."
              placeholderTextColor={themeStyles.secondaryText.color}
              multiline
            />
            {mentionSuggestions.length > 0 && (
              <View style={[styles.mentionSuggestions, themeStyles.card]}>
                {mentionSuggestions.map((user) => (
                  <TouchableOpacity
                    key={user.id}
                    style={styles.mentionItem}
                    onPress={() => {
                      const commentWithoutMention = newComment.replace(/@\w+$/, '');
                      setNewComment(commentWithoutMention + '@' + user.username + ' ');
                      setMentionSuggestions([]);
                    }}
                  >
                    <Image
                      source={{ uri: user.profile_image || 'https://via.placeholder.com/30' }}
                      style={styles.mentionUserImage}
                    />
                    <Text style={[styles.mentionUsername, themeStyles.text]}>{user.username}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={[styles.postButton, isPostingComment && styles.postButtonDisabled]}
              onPress={handlePostComment}
              disabled={isPostingComment}
            >
              <Text style={styles.postButtonText}>
                {isPostingComment ? 'Posting...' : 'Post Comment'}
              </Text>
            </TouchableOpacity>
          </View>

          {comments.map((comment) => (
  <Comment
    key={comment.id}
    comment={comment}
    onReply={handleReplyToComment}
    onEdit={handleEditComment}
    onDelete={handleDeleteComment}
    currentUser={currentUser}
    themeStyles={themeStyles}
    // level prop will default to 0
  />
))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
    padding: 12,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  questionHeader: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  commentInputContainer: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  commentInput: {
    minHeight: 80,
    fontSize: 16,
    padding: 8,
    textAlignVertical: 'top',
  },
  postButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  postButtonDisabled: {
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  commentContainer: {
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAuthorImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  commentAuthorName: {
    fontWeight: '600',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
  },
  commentContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 16,
  },
  actionText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '500',
  },
  replyContainer: {
    marginTop: 8,
    marginLeft: 16,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  replyButton: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  replyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  repliesContainer: {
    marginLeft: 16,
    marginTop: 8,
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#e1e8ed',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    minHeight: 60,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2563eb',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  mention: {
    color: '#2563eb',
    fontWeight: '500',
  },
  mentionSuggestions: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '100%',
    maxHeight: 200,
    borderRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mentionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  mentionUserImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  mentionUsername: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 12,
  },
  questionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  questionHeader: {
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  authorImage: {
    width: 20,
    height: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  replyWrapper: {
    flexDirection: 'row',
    marginTop: 8,
    marginLeft: 16,
  },
  replyIndicator: {
    width: 2,
    backgroundColor: '#e1e8ed',
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyButtonDisabled: {
    opacity: 0.5,
  },
  editedText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#647687',
  },
  commentWrapper: {
    marginBottom: 12,
},
nestedCommentWrapper: {
    flexDirection: 'row',
    marginLeft: 16,
},
verticalLine: {
    width: 2,
    marginRight: 8,
    marginLeft: 8,
    borderRadius: 1,
},
nestedComment: {
    flex: 1,
},
repliesContainer: {
    marginTop: 8,
},
});

export default QuestionDetailScreen;
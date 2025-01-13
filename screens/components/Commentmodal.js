import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'timeago.js'; // Import format function from timeago.js

const CommentModal = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Fetch comments from backend
  const fetchComments = async () => {
    try {
      const response = await fetch(`YOUR_API_URL/comments/${postId}`);
      const data = await response.json();
      setComments(organizeComments(data));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Organize comments into nested structure
  const organizeComments = (flatComments) => {
    const commentMap = {};
    const rootComments = [];

    flatComments.forEach(comment => {
      comment.replies = [];
      commentMap[comment.id] = comment;

      if (comment.parent_id === null) {
        rootComments.push(comment);
      } else {
        const parent = commentMap[comment.parent_id];
        if (parent) {
          parent.replies.push(comment);
        }
      }
    });

    return rootComments;
  };

  // Handle new comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch('YOUR_API_URL/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          user_id: currentUser.id,
          parent_id: replyTo?.id || null,
          mention_ids: mentionedUsers.map(user => user.id),
        }),
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        setMentionedUsers([]);
        fetchComments();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  // Handle reaction to comment
  const handleReaction = async (commentId, reactionType) => {
    try {
      await fetch(`YOUR_API_URL/comments/${commentId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          reaction_type: reactionType,
        }),
      });
      fetchComments();
    } catch (error) {
      console.error('Error reacting to comment:', error);
    }
  };

  // Handle report comment
  const handleReport = (comment) => {
    Alert.alert(
      'Report Comment',
      'Why are you reporting this comment?',
      [
        { text: 'Spam', onPress: () => submitReport(comment.id, 'spam') },
        { text: 'Harassment', onPress: () => submitReport(comment.id, 'harassment') },
        { text: 'Inappropriate', onPress: () => submitReport(comment.id, 'inappropriate') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const submitReport = async (commentId, reason) => {
    try {
      await fetch(`YOUR_API_URL/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reporter_id: currentUser.id,
          reason: reason,
        }),
      });
      Alert.alert('Thank you', 'Your report has been submitted');
    } catch (error) {
      console.error('Error reporting comment:', error);
    }
  };

  // Render single comment
  const renderComment = ({ item, depth = 0 }) => {
    return (
      <View style={[styles.commentContainer, { marginLeft: depth * 20 }]}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: item.user.profile_image }}
            style={styles.profileImage}
          />
          <View style={styles.commentContent}>
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
            
            <View style={styles.commentActions}>
              {/* Use timeago.js for formatting timestamps */}
              <Text>{format(item.created_at)}</Text> 
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleReaction(item.id, 'like')}
                  style={styles.actionButton}
                >
                  <Icon name="thumb-up-outline" size={16} />
                  <Text>{item.likes_count || 0}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setReplyTo(item)}
                  style={styles.actionButton}
                >
                  <Icon name="reply" size={16} />
                  <Text>Reply</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => handleReport(item)}
                  style={styles.actionButton}
                >
                  <Icon name="flag-outline" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {item.replies?.map(reply => (
          renderComment({ item: reply, depth: depth + 1 })
        ))}
      </View>
    );
  };

  // Comment input component
  const CommentInput = () => (
    <View style={styles.inputContainer}>
      {replyTo && (
        <View style={styles.replyingTo}>
          <Text>Replying to @{replyTo.user.username}</Text>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Icon name="close" size={20} />
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.inputRow}>
        <Image
          source={{ uri: currentUser.profile_image }}
          style={styles.profileImage}
        />
        <TextInput
          style={styles.input}
          value={newComment}
          onChangeText={setNewComment}
          placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
          multiline
        />
        <TouchableOpacity
          onPress={handleSubmitComment}
          style={styles.submitButton}
          disabled={!newComment.trim()}
        >
          <Icon name="send" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  useEffect(() => {
    fetchComments();
  }, [postId]);

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={item => item.id.toString()}
        ListFooterComponent={CommentInput}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  commentContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userInfo: {
    flexDirection: 'row',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  username: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  replyingTo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  submitButton: {
    padding: 5,
  },
});

export default CommentModal;
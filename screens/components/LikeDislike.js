// LikeDislikeButton.js
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const LikeDislikeButton = ({ 
  itemId, 
  initialLikes = 0, 
  initialDislikes = 0, 
  initialUserVote = null, // can be 'like', 'dislike', or null
  onVoteChange 
}) => {
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [userVote, setUserVote] = useState(initialUserVote);

  const handleVote = async (voteType) => {
    try {
      // If user clicks the same button again, remove their vote
      if (userVote === voteType) {
        const response = await fetch('YOUR_API_URL/remove_vote.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: itemId,
            vote_type: voteType,
            // Include user authentication token/ID as needed
          }),
        });

        if (response.ok) {
          if (voteType === 'like') {
            setLikes(likes - 1);
          } else {
            setDislikes(dislikes - 1);
          }
          setUserVote(null);
          onVoteChange && onVoteChange(null);
        }
      } 
      // Handle new vote
      else {
        const response = await fetch('YOUR_API_URL/add_vote.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            item_id: itemId,
            vote_type: voteType,
            // Include user authentication token/ID as needed
          }),
        });

        if (response.ok) {
          // If user had previous opposite vote, remove it
          if (userVote) {
            if (userVote === 'like') {
              setLikes(likes - 1);
            } else {
              setDislikes(dislikes - 1);
            }
          }

          // Add new vote
          if (voteType === 'like') {
            setLikes(likes + 1);
          } else {
            setDislikes(dislikes + 1);
          }
          
          setUserVote(voteType);
          onVoteChange && onVoteChange(voteType);
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Handle error (show toast/alert to user)
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[
          styles.buttonContainer,
          userVote === 'like' && styles.activeButton
        ]}
        onPress={() => handleVote('like')}
      >
        <Icon 
          name={userVote === 'like' ? 'thumb-up' : 'thumb-up-outline'} 
          size={24} 
          color={userVote === 'like' ? '#2196F3' : '#757575'} 
        />
        <Text style={[
          styles.count,
          userVote === 'like' && styles.activeText
        ]}>
          {likes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[
          styles.buttonContainer,
          userVote === 'dislike' && styles.activeButton
        ]}
        onPress={() => handleVote('dislike')}
      >
        <Icon 
          name={userVote === 'dislike' ? 'thumb-down' : 'thumb-down-outline'} 
          size={24} 
          color={userVote === 'dislike' ? '#F44336' : '#757575'} 
        />
        <Text style={[
          styles.count,
          userVote === 'dislike' && styles.activeText
        ]}>
          {dislikes}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  activeButton: {
    backgroundColor: '#F5F5F5',
  },
  count: {
    marginLeft: 4,
    fontSize: 16,
    color: '#757575',
  },
  activeText: {
    fontWeight: 'bold',
  },
});

export default LikeDislikeButton;
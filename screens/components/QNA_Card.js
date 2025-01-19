import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const QNA_Card = ({
  item,
  darkMode,
  onPress,
  onVote,
  themeStyles,
  currentUser,
}) => {
  const handleUpvote = () => {
    onVote(item.id, 'upvote');
  };

  const handleDownvote = () => {
    onVote(item.id, 'downvote');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  console.log('Raw profile_image value:', item.profile_image);
  // Get user info from the item
  // Get user info from the item
const username = item.username || 'Anonymous';
const profilePic = item.profile_image ;

  return (
    <TouchableOpacity 
      style={[
        styles.card,
        { backgroundColor: darkMode ? '#2C2C2C' : '#FFFFFF' }
      ]}
      onPress={onPress}
    >
      <View style={styles.cardContent}>
        {/* Left side voting section */}
        <View style={styles.votingSection}>
          <TouchableOpacity onPress={handleUpvote} style={styles.voteButton}>
            <MaterialIcons 
              name="arrow-upward" 
              size={24} 
              color={darkMode ? '#FFFFFF' : '#666666'} 
            />
          </TouchableOpacity>
          <Text style={[styles.voteCount, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
            {item.votes || 0}
          </Text>
          <TouchableOpacity onPress={handleDownvote} style={styles.voteButton}>
            <MaterialIcons 
              name="arrow-downward" 
              size={24} 
              color={darkMode ? '#FFFFFF' : '#666666'} 
            />
          </TouchableOpacity>
        </View>

        {/* Right side content */}
        <View style={styles.mainContent}>
          {/* User info section */}
          <View style={styles.userInfoContainer}>
          <Image 
  source={{ uri: profilePic }}
  style={styles.avatar}
  defaultSource={require('../assets/Profile.png')}
  onError={(e) => {
    console.log('Profile image path:', profilePic);
    console.log('Image loading error:', e.nativeEvent.error);
  }}
/>
            <View style={styles.userTextInfo}>
              <Text style={[styles.username, { color: darkMode ? '#FFFFFF' : '#000000' }]}>
                {username}
              </Text>
              <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: darkMode ? '#444444' : '#EEEEEE' }]} />

          {/* Question content */}
          <Text 
            style={[styles.title, { color: darkMode ? '#FFFFFF' : '#000000' }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text 
            style={[styles.description, { color: darkMode ? '#CCCCCC' : '#666666' }]}
            numberOfLines={3}
          >
            {item.description}
          </Text>

          {/* Footer stats */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.answerButton}
              onPress={onPress}
            >
              <Text style={styles.answerButtonText}>Answer</Text>
            </TouchableOpacity>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <MaterialIcons name="visibility" size={16} color="#666666" />
                <Text style={styles.statText}>{item.views || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    marginVertical: 8,
    
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 200, // Fixed height
  },
  cardContent: {
    flexDirection: 'row',
    height: '100%',
  },
  votingSection: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#EEEEEE',
    width: 50, // Fixed width for voting section
  },
  mainContent: {
    flex: 1,
    padding: 12,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#E1E1E1', // Placeholder color
  },
  userTextInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#666666',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
  },
  answerButton: {
    backgroundColor: '#6B4EFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 4,
  },
  answerButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    marginVertical: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default QNA_Card;
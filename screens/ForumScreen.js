import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from './Context/DarkMode';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ForumScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [topQuestions, setTopQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Example data structure - replace with actual API data
  const dummyQuestions = [
    {
      id: 1,
      title: 'How to implement WebSocket in React Native?',
      description: 'I am trying to implement real-time chat functionality using WebSocket in React Native...',
      user: {
        id: 1,
        name: 'John Doe',
        profile_image: 'http://example.com/profile.jpg'
      },
      upvotes: 25,
      downvotes: 2,
      created_at: '2024-01-09T10:00:00',
      answers_count: 5,
    },
    {
      id: 2,
      title: 'How to implement WebSocket in React Native?',
      description: 'I am trying to implement real-time chat functionality using WebSocket in React Native...',
      user: {
        id: 1,
        name: 'John Doe',
        profile_image: 'http://example.com/profile.jpg'
      },
      upvotes: 25,
      downvotes: 2,
      created_at: '2024-01-09T10:00:00',
      answers_count: 5,
    },
    // Add more dummy questions...
  ];

  useEffect(() => {
    fetchQuestions();
    fetchTopQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://192.168.151.27/TechForum/backend/get_questions.php');
      const data = await response.json();
      if (data.success) {
        setQuestions(data.questions);
        setFilteredQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions(dummyQuestions);
      setFilteredQuestions(dummyQuestions);
    }
  };
  
  const fetchTopQuestions = async () => {
    try {
      const response = await fetch('http://192.168.151.27/TechForum/backend/get_questions.php?type=top');
      const data = await response.json();
      if (data.success) {
        setTopQuestions(data.questions);
      }
    } catch (error) {
      console.error('Error fetching top questions:', error);
      setTopQuestions(dummyQuestions.slice(0, 3));
    }
  };
  
  // For search functionality:
  

  const handleSearch = (text) => {
    setSearchQuery(text);
    const filtered = questions.filter(question =>
      question.title.toLowerCase().includes(text.toLowerCase()) ||
      question.description.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredQuestions(filtered);
  };

  const handleVote = async (questionId, voteType) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch('http://192.168.151.27/TechForum/backend/vote_question.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          user_id: userId,
          vote_type: voteType, // 'up' or 'down'
        }),
      });
      const data = await response.json();
      if (data.success) {
        fetchQuestions(); // Refresh questions to update vote counts
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to register vote');
    }
  };


  // ... keep existing state and data fetching logic ...

  const themeStyles = darkMode ? {
    container: { backgroundColor: '#1a1a1a' },
    text: { color: '#fff' },
    card: { backgroundColor: '#2d2d2d' },
    input: { backgroundColor: '#2d2d2d', color: '#fff', borderColor: '#404040' },
    separator: { backgroundColor: '#404040' },
    secondaryText: { color: '#b3b3b3' },
  } : {
    container: { backgroundColor: '#f8f9fa' },
    text: { color: '#2c3e50' },
    card: { backgroundColor: '#fff' },
    input: { backgroundColor: '#fff', color: '#2c3e50', borderColor: '#e1e8ed' },
    separator: { backgroundColor: '#e1e8ed' },
    secondaryText: { color: '#647687' },
  };

  const renderQuestionCard = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, themeStyles.card]}
      onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
    >
      {/* Voting Section */}
      <View style={styles.votingSection}>
        <TouchableOpacity onPress={() => handleVote(item.id, 'up')}>
          <MaterialIcons 
            name="keyboard-arrow-up" 
            size={24} 
            color={darkMode ? '#b3b3b3' : '#647687'} 
          />
        </TouchableOpacity>
        <Text style={[styles.voteCount, themeStyles.text]}>{item.upvotes}</Text>
        <TouchableOpacity onPress={() => handleVote(item.id, 'down')}>
          <MaterialIcons 
            name="keyboard-arrow-down" 
            size={24} 
            color={darkMode ? '#b3b3b3' : '#647687'} 
          />
        </TouchableOpacity>
        <Text style={[styles.voteCount, themeStyles.text]}>{item.downvotes}</Text>
      </View>

      <View style={styles.cardContent}>
        {/* Question Title and Preview */}
        <Text style={[styles.title, themeStyles.text]} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={[styles.description, themeStyles.secondaryText]} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Footer with User Info and Stats */}
        <View style={styles.cardFooter}>
          <View style={styles.userInfo}>
            <Image
              source={item.user.profile_image ? { uri: item.user.profile_image } : require('./assets/Profile.png')}
              style={styles.profileImage}
            />
            <Text style={[styles.username, themeStyles.secondaryText]}>{item.user.name}</Text>
            <Text style={[styles.dot, themeStyles.secondaryText]}> • </Text>
            <Text style={[styles.timeText, themeStyles.secondaryText]}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.stats}>
            <MaterialIcons 
              name="question-answer" 
              size={18} 
              color={darkMode ? '#b3b3b3' : '#647687'} 
            />
            <Text style={[styles.statText, themeStyles.secondaryText]}>
              {item.answers_count}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, themeStyles.container]}>
      <View style={styles.searchContainer}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={darkMode ? '#b3b3b3' : '#647687'} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={[styles.searchInput, themeStyles.input]}
          placeholder="Search questions..."
          placeholderTextColor={darkMode ? '#b3b3b3' : '#647687'}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {topQuestions.length > 0 && !searchQuery && (
        <>
          <Text style={[styles.sectionTitle, themeStyles.text]}>
            <MaterialIcons name="trending-up" size={24} color={darkMode ? '#fff' : '#2c3e50'} />
            {' '}Trending Questions
          </Text>
          <FlatList
            data={topQuestions}
            renderItem={renderQuestionCard}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.topQuestionsContainer}
          />
        </>
      )}

<FlatList
        data={filteredQuestions}
        renderItem={renderQuestionCard}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={[styles.separator, themeStyles.separator]} />}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('WritePost')}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 15,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  votingSection: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e1e8ed',
  },
  voteCount: {
    fontSize: 12,
    marginVertical: 2,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  username: {
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  statText: {
    marginLeft: 4,
    fontSize: 12,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#2563eb',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  separator: {
    height: 1,
    marginVertical: 4,
  },
});
export default ForumScreen;
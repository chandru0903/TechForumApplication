import React, { useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDarkMode } from './Context/DarkMode';
import { debounce } from 'lodash';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import QNA_Card from './components/QNA_Card';

const ForumScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUserId = await AsyncStorage.getItem('userId');
      const response = await fetch(
        `http://192.168.151.27/TechForum/backend/get_questions.php?user_id=${currentUserId}`
      );
      const data = await response.json();
      
      if (data.status === 'success') {
        setQuestions(data.data);
      } else {
        Alert.alert('Error', 'Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  const [debouncedSearch] = useState(() => 
    debounce(async (searchText, userId) => {
      try {
        const response = await fetch(
          `http://192.168.151.27/TechForum/backend/get_questions.php?user_id=${userId}&search=${encodeURIComponent(searchText)}`
        );
        const data = await response.json();
        if (data.status === 'success') {
          setQuestions(data.data);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
    }, 500)
  );

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);
  
  

  useEffect(() => {
   
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const getUserId = async () => {
      const id = await AsyncStorage.getItem('userId');
      setUserId(id);
    };
    getUserId();
  }, []);
  const fetchCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const response = await fetch(`http://192.168.151.27/TechForum/backend/profile.php?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };


  
const handleRefresh = () => {
    setIsRefreshing(true);
    fetchQuestions();
  };

const handleSearch = (text) => {
  setSearchQuery(text);
  if (userId) {
    debouncedSearch(text, userId);
  }
};

  
  const handleVote = async (postId, voteType) => {
    try {
      const response = await fetch('http://192.168.151.27/TechForum/backend/post_reaction.php?action=react', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId, // Use userId directly instead of currentUser.id
          reaction_type: voteType === 'upvote' ? 'like' : 'dislike'
        }),
      });
  
      const data = await response.json();
      
      if (data.success) {
        setQuestions(prevQuestions => {
          return prevQuestions.map(question => {
            if (question.id === postId) {
              const hadUpvote = question.user_reaction === 'like';
              const hadDownvote = question.user_reaction === 'dislike';
              
              let likes = question.likes_count || 0;
              let dislikes = question.dislikes_count || 0;
              
              // If clicking the same button, remove the vote
              if ((voteType === 'upvote' && hadUpvote) || 
                  (voteType === 'downvote' && hadDownvote)) {
                if (hadUpvote) likes--;
                if (hadDownvote) dislikes--;
                return {
                  ...question,
                  likes_count: likes,
                  dislikes_count: dislikes,
                  user_reaction: null
                };
              }
              
              // If changing vote
              if (voteType === 'upvote') {
                likes++;
                if (hadDownvote) dislikes--;
                return {
                  ...question,
                  likes_count: likes,
                  dislikes_count: dislikes,
                  user_reaction: 'like'
                };
              } else {
                dislikes++;
                if (hadUpvote) likes--;
                return {
                  ...question,
                  likes_count: likes,
                  dislikes_count: dislikes,
                  user_reaction: 'dislike'
                };
              }
            }
            return question;
          });
        });
      } else {
        console.error('Vote update failed:', data.message);
      }
    } catch (error) {
      console.error('Error handling vote:', error);
    }
  };


  const themeStyles = darkMode ? {
    container: { backgroundColor: '#1a1a1a' },
    text: { color: '#fff' },
    card: { backgroundColor: '#2d2d2d' },
    input: { backgroundColor: '#2d2d2d', color: '#fff', borderColor: '#404040' },
    separator: { backgroundColor: '#404040' },
    secondaryText: { color: '#b3b3b3' },
    cardBackground: { backgroundColor: '#2d2d2d' },
    background: { backgroundColor: '#1a1a1a' },
  } : {
    container: { backgroundColor: '#f8f9fa' },
    text: { color: '#2c3e50' },
    card: { backgroundColor: '#fff' },
    input: { backgroundColor: '#fff', color: '#2c3e50', borderColor: '#e1e8ed' },
    separator: { backgroundColor: '#e1e8ed' },
    secondaryText: { color: '#647687' },
    cardBackground: { backgroundColor: '#fff' },
    background: { backgroundColor: '#f8f9fa' },
  };

  const renderQuestionCard = ({ item }) => (
    <QNA_Card
      item={item}
      darkMode={darkMode}
      onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
      onVote={handleVote}
      themeStyles={themeStyles}
      currentUser={currentUser} 
    />
  );

  const renderEmptyState = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={[styles.emptyStateText, themeStyles.text]}>
            Loading questions...
          </Text>
        </View>
      );
    }

    if (searchQuery && questions.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons 
            name="search-off" 
            size={48} 
            color={darkMode ? '#4a4a4a' : '#ccc'} 
          />
          <Text style={[styles.emptyStateText, themeStyles.text]}>
            Nothing there to show at the moment
          </Text>
          <Text style={[styles.emptyStateSubText, themeStyles.secondaryText]}>
            Try different keywords or check your spelling
          </Text>
        </View>
      );
    }

    return null;
  };

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
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton} 
            onPress={() => {
              setSearchQuery('');
              fetchQuestions();
            }}
          >
            <MaterialIcons 
              name="close" 
              size={20} 
              color={darkMode ? '#b3b3b3' : '#647687'} 
            />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={questions}
        renderItem={renderQuestionCard}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={() => <View style={[styles.separator, themeStyles.separator]} />}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={questions.length === 0 && styles.emptyList}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
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
  separator: {
    height: 1,
    marginVertical: 4,
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyList: {
    flexGrow: 1,
  },
});

export default ForumScreen;
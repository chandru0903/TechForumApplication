import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDarkMode } from './Context/DarkMode';

const { width } = Dimensions.get('window');

const SavedScreen = ({ navigation }) => {
  const { darkMode } = useDarkMode();
  const [savedPosts, setSavedPosts] = useState([]);
  const [collections, setCollections] = useState([
    { 
      id: 1, 
      name: 'Tech News', 
      posts: [
        {
          id: 1,
          title: 'Latest in AI',
          author: 'TechGuru',
          image: require('./assets/CPP.png'),
          timestamp: '2d ago'
        }
      ] 
    },
    { 
      id: 2, 
      name: 'Community Posts',
      posts: [
        {
          id: 2,
          title: 'Web Development Tips',
          author: 'CodeMaster',
          image: require('./assets/Figma.png'),
          timestamp: '1w ago'
        }
      ]
    },
    { 
      id: 3, 
      name: 'Tutorials',
      posts: [] 
    }
  ]);

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name="bookmark-border" 
        size={80} 
        color={darkMode ? '#666' : '#999'}
      />
      <Text style={[styles.emptyTitle, { color: darkMode ? '#fff' : '#000' }]}>
        No Saved Forums Yet
      </Text>
      <Text style={[styles.emptyText, { color: darkMode ? '#ccc' : '#666' }]}>
        Save forums to organize and access them later
      </Text>
      <TouchableOpacity 
        style={[styles.browseButton, { backgroundColor: darkMode ? '#4da6ff' : '#007AFF' }]}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.browseButtonText}>Browse Forums</Text>
      </TouchableOpacity>
    </View>
  );

  const SavedPost = ({ post }) => (
    <TouchableOpacity 
      style={[styles.savedPost, { backgroundColor: darkMode ? '#2d2d2d' : '#fff' }]}
      onPress={() => navigation.navigate('PostDetail', { post })}
    >
      <Image source={post.image} style={styles.postImage} />
      <View style={styles.postInfo}>
        <Text style={[styles.postTitle, { color: darkMode ? '#fff' : '#000' }]} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={[styles.postAuthor, { color: darkMode ? '#ccc' : '#666' }]}>
          {post.author}
        </Text>
        <Text style={[styles.postTimestamp, { color: darkMode ? '#999' : '#999' }]}>
          {post.timestamp}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? '#121212' : '#f5f5f5' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={darkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: darkMode ? '#fff' : '#000' }]}>Saved</Text>
       
      </View>
      
      {collections.every(collection => collection.posts.length === 0) ? (
        <EmptyState />
      ) : (
        <ScrollView>
          {collections.map(collection => (
            <View key={collection.id} style={styles.collectionContainer}>
              <Text style={[styles.collectionTitle, { color: darkMode ? '#fff' : '#000' }]}>
                {collection.name}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {collection.posts.length === 0 ? (
                  <View style={[styles.emptyCollection, { backgroundColor: darkMode ? '#2d2d2d' : '#fff' }]}>
                    <MaterialIcons name="bookmark-border" size={24} color={darkMode ? '#666' : '#999'} />
                    <Text style={[styles.emptyCollectionText, { color: darkMode ? '#ccc' : '#666' }]}>
                      No saved items
                    </Text>
                  </View>
                ) : (
                  collection.posts.map(post => (
                    <SavedPost key={post.id} post={post} />
                  ))
                )}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  collectionContainer: {
    padding: 16,
  },
  collectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyCollection: {
    width: width * 0.4,
    height: width * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emptyCollectionText: {
    marginTop: 8,
    fontSize: 14,
  },
  savedPost: {
    width: width * 0.4,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postImage: {
    width: '100%',
    height: width * 0.4,
    resizeMode: 'cover',
  },
  postInfo: {
    padding: 12,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  postAuthor: {
    fontSize: 12,
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: 11,
  },
});

export default SavedScreen;
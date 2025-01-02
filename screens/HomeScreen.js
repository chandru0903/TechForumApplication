import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';


const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const [communities] = useState([
    { 
      id: 1, 
      name: 'C++', 
      members: '7,800',
      icon: require('./assets/CPP.png')
    },
    { 
      id: 2, 
      name: 'Space X', 
      members: '14,240',
      icon: require('./assets/space.png')
    },
    { 
      id: 3, 
      name: 'Figma', 
      members: '22,150',
      icon: require('./assets/Figma.png')
    }
  ]);

  const [welcomePost, setWelcomePost] = useState({
    likes: 1500,
    comments: 889,
    dislikes: 48,
    isLiked: false,
    isDisliked: false
  });

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);

  const handleLike = () => {
    setWelcomePost(prev => ({
      ...prev,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      isLiked: !prev.isLiked,
      isDisliked: false,
      dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes
    }));
  };

  const handleDislike = () => {
    setWelcomePost(prev => ({
      ...prev,
      dislikes: prev.isDisliked ? prev.dislikes - 1 : prev.dislikes + 1,
      isDisliked: !prev.isDisliked,
      isLiked: false,
      likes: prev.isLiked ? prev.likes - 1 : prev.likes
    }));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment.trim()]);
      setNewComment('');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Cherry Blossom Background */}
        <View style={styles.bgImageContainer}>
          <Image 
            source={require('./assets/HomeBackground.png')}
            style={styles.bgImage}
            resizeMode="cover"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuButton}>
            <MaterialIcons name="menu" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Hi, ABC</Text>
          <TouchableOpacity>
            <Image 
              source={require('./assets/Profile.png')}
              style={styles.profilePic}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Try searching topics like 'Tesla'"
            placeholderTextColor="#666"
          />
        </View>

        {/* Top Communities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Communities</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.communitiesContainer}
          >
            {communities.map((community) => (
              <TouchableOpacity key={community.id} style={styles.communityCard}>
                <Image source={community.icon} style={styles.communityIcon} />
                <Text style={styles.communityName}>{community.name}</Text>
                <Text style={styles.communityMembers}>
                  <MaterialIcons name="groups" size={12} color="#666" /> {community.members} members
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Welcome Post */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome Post</Text>
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.postAuthor}>
                <Image
                  source={require('./assets/Admin.png')}
                  style={styles.authorAvatar}
                />
                <View>
                  <Text style={styles.authorName}>Admin</Text>
                  <Text style={styles.postTime}>25d</Text>
                </View>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="bookmark" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.postTitle}>Welcome 👋</Text>
            <Text style={styles.postContent}>
              Welcome to the TechForum community—we're glad to get you as part of us. This is a space to build community with other enthusiastic and knowledgeable...
            </Text>
            <View style={styles.postActions}>
              <TouchableOpacity 
                style={[styles.actionButton, welcomePost.isLiked && styles.actionButtonActive]}
                onPress={handleLike}
              >
                <MaterialIcons 
                  name="thumb-up" 
                  size={16} 
                  color={welcomePost.isLiked ? "#007AFF" : "#666"} 
                />
                <Text style={[styles.actionText, welcomePost.isLiked && styles.actionTextActive]}>
                  {welcomePost.likes}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => setIsCommentsVisible(true)}
              >
                <MaterialIcons name="comment" size={16} color="#666" />
                <Text style={styles.actionText}>{welcomePost.comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, welcomePost.isDisliked && styles.actionButtonActive]}
                onPress={handleDislike}
              >
                <MaterialIcons 
                  name="thumb-down" 
                  size={16} 
                  color={welcomePost.isDisliked ? "#007AFF" : "#666"} 
                />
                <Text style={[styles.actionText, welcomePost.isDisliked && styles.actionTextActive]}>
                  {welcomePost.dislikes}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCommentsVisible}
        onRequestClose={() => setIsCommentsVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setIsCommentsVisible(false)}>
                <MaterialIcons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.commentsList}>
              {comments.map((comment, index) => (
                <Text key={index} style={styles.commentText}>{comment}</Text>
              ))}
            </ScrollView>
            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#666"
                value={newComment}
                onChangeText={setNewComment}
              />
              <TouchableOpacity onPress={handleAddComment}>
                <MaterialIcons name="send" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  bgImageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 200,
    height: 200,
    opacity: 0.5,
  },
  bgImage: {
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 15,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 5,
  },
  actionButtonActive: {
    opacity: 1,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  actionTextActive: {
    color: '#007AFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  commentsList: {
    flex: 1,
    marginBottom: 10,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#e5e5e5',
    padding: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  communitiesContainer: {
    paddingRight: 20,
  },
  communityCard: {
    width: width * 0.35,
    backgroundColor: '#fff',
    marginRight: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  communityIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  communityName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  communityMembers: {
    fontSize: 12,
    color: '#666',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
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
    marginBottom: 15,
  },
  postAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  trendingAuthorAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  postTime: {
    fontSize: 12,
    color: '#666',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  postContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 15,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  trendingPost: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HomeScreen;
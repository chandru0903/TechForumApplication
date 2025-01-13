import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator 
} from 'react-native';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateGmail = (email) => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return gmailRegex.test(email.toLowerCase());
  };

  const handleSendEmail = async () => {
    const trimmedEmail = email.trim();
    
    if (trimmedEmail === '') {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }
  
    if (!validateGmail(trimmedEmail)) {
      Alert.alert('Error', 'Please enter a valid Gmail address.');
      return;
    }
  
    setIsLoading(true);
    
    try {
      // Create FormData instead of JSON
      const formData = new FormData();
      formData.append('email', trimmedEmail);

      const response = await fetch('http://192.168.151.27/TechForum/backend/send_otp.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      
      // Add this for debugging
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Parse error:', responseText);
        throw new Error('Invalid server response');
      }
  
      if (result.status === 'success') {
        navigation.navigate('EmailVerification', { email: trimmedEmail });
      } else {
        Alert.alert('Error', result.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
};
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.topContainer}>
        <Text style={styles.header}>Forgot your password?</Text>
        <Text style={styles.subHeader}>Don't worry, we got you!</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter your Gmail"
          placeholderTextColor="#7a7a7a"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
        />
        
        <Text style={styles.note}>
          *If an account is associated with this email, you will receive a recovery code.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.button, (isLoading || !email.trim()) && styles.buttonDisabled]} 
        onPress={handleSendEmail}
        disabled={isLoading || !email.trim()}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Send Recovery Code</Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#33394F',
    padding: 20,
    justifyContent: 'space-between',
  },
  topContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 50,
  },
  header: {
    color: '#ffffff',
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subHeader: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#ffffff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  note: {
    color: '#7a7a7a',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8a2be2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#4A4A4A',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView } from 'react-native';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const validateGmail = (email) => {
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    return gmailRegex.test(email);
  };

  const handleSendEmail = () => {
    if (email.trim() === '') {
      Alert.alert('Error', 'Please enter your email.');
      return;
    }

    if (!validateGmail(email)) {
      Alert.alert('Error', 'Please enter a valid Gmail address.');
      return;
    }

    // Simulate email sending (API call can be added here)
    Alert.alert('Success', 'Verification code sent to your email.');

    // Navigate to the verification screen
    navigation.navigate('EmailVerification', { email });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.topContainer}>
        <Text style={styles.header}>Forgot your password? Don’t worry we got you!!!</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your Gmail"
          placeholderTextColor="#7a7a7a"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={styles.note}>
          *If an account is associated with this email, you will receive a recovery code.
        </Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSendEmail}>
        <Text style={styles.buttonText}>Send</Text>
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
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
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
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ForgotPassword;
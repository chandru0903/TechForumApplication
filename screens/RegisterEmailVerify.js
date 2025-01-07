import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const RegisterEmailVerify= ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState('');
  

  const handleVerify = () => {
    // Replace with your verification logic
    if (verificationCode === '123456') {
      navigation.navigate('Welcome');
    } else {
      Alert.alert('Invalid Code', 'The verification code you entered is incorrect.');
    }
  };

  const handleResendCode = () => {
    // Replace with your resend logic
    Alert.alert('Code Sent', `A new verification code has been sent to ${email}.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>Enter the code sent to your email:</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={verificationCode}
        onChangeText={setVerificationCode}
      />

      <Text style={styles.resendText} onPress={handleResendCode}>
        Resend verification code
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#33394F',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCC',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: '#FFF',
    marginBottom: 20,
  },
  resendText: {
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegisterEmailVerify;

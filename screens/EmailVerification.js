import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from './Context/Authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmailVerification = ({ navigation, route }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [timer, setTimer] = useState(60);
  const { email, password, isLogin } = route.params;
  const { login } = useAuth();

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const saveAuthData = async (loginResult) => {
    try {
      console.log('Login Result:', JSON.stringify(loginResult, null, 2));
  
      if (!loginResult || !loginResult.success) {
        throw new Error('Login failed or invalid response');
      }
  
      // Ensure we have the minimum required data
      const token = loginResult.token || `temp-token-${Date.now()}`;
      const userId = loginResult.userId;
  
      if (!userId) {
        throw new Error('Invalid login response data - missing userId');
      }
  
      const authData = [
        ['isLoggedIn', 'true'],
        ['authToken', token.toString()],
        ['userId', userId.toString()]
      ];
  
      await Promise.all(authData.map(([key, value]) => AsyncStorage.setItem(key, value)));
      
      // Clear temporary credentials
      await Promise.all([
        AsyncStorage.removeItem('tempEmail'),
        AsyncStorage.removeItem('tempPassword')
      ]);
  
      return true;
    } catch (error) {
      console.error('Error saving auth state:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  };
  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code.');
      return;
    }

    try {
      // First verify the OTP
      const formData = new FormData();
      formData.append('email', email);
      formData.append('otp', verificationCode.trim());

      const response = await fetch('http://192.168.151.27/TechForum/backend/verify_otp.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        if (isLogin) {
          // If it's a login verification, proceed with login
          console.log('Attempting login with:', { email, password });
          const loginResult = await login(email, password);
          console.log('Login result received:', loginResult);
          
         
            
            if (loginResult?.success) {
              try {
                await saveAuthData(loginResult);
                
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'HomeScreen' }],
                });
              } catch (error) {
                console.error('Complete error details:', error);
                Alert.alert('Error', 'Failed to complete login process. Please try again.');
              }
            } else {
              console.log('Login was not successful:', loginResult);
              Alert.alert('Error', loginResult?.message || 'Login failed. Please try again.');
            }
          
        } else if (route.params.isRegistration) {
          // Handle registration after OTP verification
          const registerFormData = new FormData();
          registerFormData.append('fullName', route.params.fullName.trim());
          registerFormData.append('email', email.trim().toLowerCase());
          registerFormData.append('password', password);

          const registerResponse = await fetch('http://192.168.151.27/TechForum/backend/register.php', {
            method: 'POST',
            headers: {
              'Accept': 'application/json'
            },
            body: registerFormData
          });

          const registerResult = await registerResponse.json();

          if (registerResult.status === 'success') {
            Alert.alert('Success', 'Registration successful! Please login.');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          } else {
            Alert.alert('Error', registerResult.message || 'Registration failed');
          }
        } else {
          // Existing forgot password flow
          Alert.alert('Success', 'OTP verified successfully.');
          navigation.navigate('ForgotPasswordChange', { email });
        }
      } else {
        Alert.alert('Error', result.message || 'Invalid OTP.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const handleResendCode = async () => {
    if (timer > 0) {
      Alert.alert('Please wait', `You can request a new code in ${timer} seconds.`);
      return;
    }

    try {
      const otpFormData = new FormData();
      otpFormData.append('email', email);
      otpFormData.append('type', route.params.isRegistration ? 'registration' : 'login');

      const response = await fetch('http://192.168.151.27/TechForum/backend/send_otp.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: otpFormData
      });

      const result = await response.json();
      
      if (result.status === 'success') {
        setTimer(60);
        Alert.alert('Success', `A new verification code has been sent to ${email}.`);
      } else {
        Alert.alert('Error', result.message || 'Failed to send new code.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>Enter the code sent to your email:</Text>
      <Text style={styles.emailText}>{email}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter verification code"
        placeholderTextColor="#777"
        keyboardType="numeric"
        value={verificationCode}
        onChangeText={setVerificationCode}
        maxLength={6}
        autoFocus={true}
      />

      <TouchableOpacity 
        onPress={handleResendCode}
        disabled={timer > 0}
      >
        <Text style={[styles.resendText, timer > 0 && styles.resendTextDisabled]}>
          {timer > 0 ? `Resend code in ${timer}s` : 'Resend verification code'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, !verificationCode.trim() && styles.buttonDisabled]} 
        onPress={handleVerify}
        disabled={!verificationCode.trim()}
      >
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
    marginBottom: 10,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 15,
    color: '#FFF',
    marginBottom: 20,
    fontSize: 16,
    textAlign: 'center',
  },
  resendText: {
    color: '#6C63FF',
    textAlign: 'center',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    color: '#4A4A4A',
    textDecorationLine: 'none',
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#4A4A4A',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EmailVerification;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Checkbox } from 'react-native-paper';
import { useAuth } from './Context/Authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Login = ({ navigation }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // First, modify the handleLogin function
  const handleLogin = async () => {
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }
  
    setLoading(true);
    try {
      // First send OTP
      const formData = new FormData();
      formData.append('email', email.trim());
  
      const response = await fetch('http://192.168.151.27/TechForum/backend/send_otp.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      
      const result = await response.json();
  
      if (result.status === 'success') {
        // Store credentials temporarily
        await AsyncStorage.setItem('tempEmail', email.trim());
        await AsyncStorage.setItem('tempPassword', password);
        
        // Navigate to verification screen
        navigation.navigate('EmailVerification', { 
          email: email.trim(),
          password: password,
          isLogin: true
        });
      } else {
        Alert.alert('Error', result.message || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email first');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', email.trim());

      const response = await fetch('http://192.168.151.27/TechForum/backend/send_otp.php', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: formData
      });
      
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error('Parse error:', responseText);
        throw new Error('Invalid server response');
      }

      if (result.status === 'success') {
        navigation.navigate('EmailVerification', { email: email.trim() });
      } else {
        Alert.alert('Error', result.message || 'Failed to send verification code.');
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>TechForum</Text>
      </View>
      <View style={styles.secondaryContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, emailError && styles.inputError]}
              placeholder="Enter your email"
              placeholderTextColor="#666"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError && styles.inputError]}
                placeholder="Enter your password"
                placeholderTextColor="#666"
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setPasswordVisible(!passwordVisible)}
                disabled={loading}
              >
                <Text>{passwordVisible ? '🙉' : '🙈'}</Text>
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rememberMeContainer}>
            <Checkbox
              status={isChecked ? 'checked' : 'unchecked'}
              onPress={() => !loading && setIsChecked(!isChecked)}
              color="#BEB4FF"
              disabled={loading}
            />
            <TouchableOpacity onPress={() => !loading && setIsChecked(!isChecked)} disabled={loading}>
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (loading || !email || !password) && styles.loginButtonDisabled
            ]}
            onPress={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.createAccountContainer}>
            <Text style={styles.dontHaveAccountText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text style={styles.createAccountText}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};




const styles = StyleSheet.create({
  // ... existing styles ...
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#D3D3D3',
    opacity: 0.7,
  },
  container: {
    flex: 1,
    backgroundColor: '#1E252B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  appName: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  secondaryContainer: {
    backgroundColor: '#fff',
    width: '100%',
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1E252B',
    borderColor: '#fff',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    color: '#fff',
    fontSize: 16,
    width: '100%',
    height: 50,
  },
  passwordInput: {
    paddingRight: 40,
  },
  visibilityToggle: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  visibilityToggleText: {
    color: '#fff',
    fontSize: 18,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#BEB4FF',
    fontSize: 14,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    justifyContent: 'flex-start',
  },
  checkbox: {
    marginRight: 10,
  },
  rememberMeText: {
    color: '#000',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#BEB4FF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  createAccountContainer: {
    marginTop: 15,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dontHaveAccountText: {
    color: '#000',
    fontSize: 16,
  },
  createAccountText: {
    color: '#BEB4FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
export default Login;

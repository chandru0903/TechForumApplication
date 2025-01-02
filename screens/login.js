import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';

const Login = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [animatedColor] = useState(new Animated.Value(0)); // Animated value for color transition

  const handleCheckboxPress = () => {
    setIsChecked(!isChecked);

    // Start the animation for the checkbox color
    Animated.timing(animatedColor, {
      toValue: isChecked ? 0 : 1, // Toggle between 0 (dark grey) and 1 (dark blue)
      duration: 300,
      useNativeDriver: false, // We need to update styles, so we can't use native driver
    }).start();
  };

  // Interpolating color values based on the animated value
  const checkboxColor = animatedColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2C2F36', '#1E252B'], // Dark grey to dark blue
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appName}>MyApp</Text>
      </View>
      <View style={styles.secondaryContainer}>
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#fff"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#fff"
              secureTextEntry
            />
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.rememberMeContainer}>
            <TouchableOpacity onPress={handleCheckboxPress}>
              <View style={styles.checkboxContainer}>
                <Animated.View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: checkboxColor,
                    },
                  ]}
                >
                  {isChecked && <View style={styles.checkboxCheckmark} />}
                </Animated.View>
                <Text style={styles.rememberMeText}>Remember Me</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.createAccountContainer}>
            <Text style={styles.dontHaveAccountText}>Don't have an account? </Text>
            <TouchableOpacity>
              <Text style={styles.createAccountText}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
    height: 50, // Adjusted height
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 5, // Adjust margin to place it correctly below the password input
  },
  forgotPasswordText: {
    color: '#BEB4FF', // Set the color to #BEB4FF
    fontSize: 14,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#2C2F36', // Slightly darker grey
  },
  checkboxCheckmark: {
    width: 12,
    height: 12,
    backgroundColor: '#1E252B',
    borderRadius: 3,
  },
  rememberMeText: {
    color: '#000',
    fontSize: 14, // Same size as Forgot Password
    marginLeft: 5,
  },
  loginButton: {
    backgroundColor: '#BEB4FF', // Set the color to #BEB4FF
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
    color: '#BEB4FF', // Set the color to #BEB4FF
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Login ;
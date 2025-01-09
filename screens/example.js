import React, { useState, useEffect } from 'react';
import { Text, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TestAsyncStorage = () => {
  const [storedValue, setStoredValue] = useState('');

  useEffect(() => {
    checkAsyncStorage();
  }, []);

  const checkAsyncStorage = async () => {
    try {
      await AsyncStorage.setItem('testKey', 'This is a test value');
      const testValue = await AsyncStorage.getItem('testKey');
      if (testValue !== null) {
        setStoredValue(testValue);  // Set the retrieved value to state
      } else {
        setStoredValue('No value found');
      }
    } catch (error) {
      setStoredValue('Error: ' + error.message);
    }
  };

  const clearStorage = async () => {
    await AsyncStorage.removeItem('testKey');
    setStoredValue('AsyncStorage Cleared');
  };

  return (
    <View>
      <Text>Stored Value: {storedValue}</Text>
      <Button title="Clear AsyncStorage" onPress={clearStorage} />
    </View>
  );
};

export default TestAsyncStorage;

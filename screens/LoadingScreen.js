import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const LoadingScreen = () => {
  const letters = 'TechForum'.split(''); // Split the string into individual letters

  // Create animation objects for each letter
  const animations = letters.map(() => ({
    opacity: new Animated.Value(0),
    scale: new Animated.Value(0),
  }));

  const [letterIndex, setLetterIndex] = useState(0); // Track the current letter to animate

  // Function to animate each letter in sequence
  const animateLetter = (index) => {
    Animated.sequence([
      // Fade in and scale up the letter
      Animated.timing(animations[index].opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index].scale, {
        toValue: 1.5, // Scale the letter
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index].scale, {
        toValue: 1, // Shrink back to original size
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animations[index].opacity, {
        toValue: 0, // Fade out the letter
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    // Create an interval to loop through the letters and animate them
    const interval = setInterval(() => {
      animateLetter(letterIndex); // Animate the current letter
      setLetterIndex((prevIndex) => (prevIndex + 1) % letters.length); // Move to the next letter
    }, 1500); // Run the animation every 1.5 seconds

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [letterIndex]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {letters.map((letter, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.letter,
              {
                opacity: animations[index].opacity,
                transform: [{ scale: animations[index].scale }],
              },
            ]}
          >
            {letter}
          </Animated.Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E252B', // Dark background
  },
  textContainer: {
    flexDirection: 'row', // Letters will be aligned in a row
  },
  letter: {
    fontSize: 40, // Letter size
    fontWeight: 'bold',
    color: '#007bff', // Blue text color
    marginHorizontal: 2, // Reduced margin for closer letters
  },
});

export default LoadingScreen;

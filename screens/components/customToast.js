import React, { useState, useEffect } from 'react';
import { View, Text, Image, Animated } from 'react-native';

const CustomToast = ({ message, icon, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Fade out after delay
    const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) {
            onHide();
          }
        });
      }, 1000);

    return () => clearTimeout(timer);
  }, [fadeAnim, onHide]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 50,
        left: '10%',
        right: '10%',
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        zIndex: 1000,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        opacity: fadeAnim,
      }}>
      {icon && (
        <Image 
          source={icon} 
          style={{ 
            width: 20, 
            height: 20, 
            marginRight: 10 
          }} 
        />
      )}
      <Text style={{ 
        color: '#fff', 
        fontSize: 14,
        flexShrink: 1
      }}>
        {message}
      </Text>
    </Animated.View>
  );
};

export default CustomToast;
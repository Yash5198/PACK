// screens/LoadingScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#7C3AED',
  surface: '#FFFFFF',
};

export default function LoadingScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create loading animation sequence
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        delay: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary, COLORS.secondary]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['white', '#F0F9FF']}
              style={styles.logoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialCommunityIcons 
                name="run-fast" 
                size={48} 
                color={COLORS.primary} 
              />
            </LinearGradient>
          </Animated.View>
          
          <View style={styles.textContainer}>
            <Text style={styles.appName}>PACK</Text>
            <Text style={styles.tagline}>Professional Run Management</Text>
          </View>
          
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDots}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: pulseAnim.interpolate({
                        inputRange: [1, 1.2],
                        outputRange: [0.3, 1]
                      }),
                      transform: [{
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.2],
                          outputRange: [1, 1.3]
                        })
                      }]
                    }
                  ]}
                />
              ))}
            </View>
            <Text style={styles.loadingText}>Checking authentication...</Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.version}>v1.0.0</Text>
            <Text style={styles.copyright}>© 2024 Pack Technologies</Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    letterSpacing: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'white',
    marginHorizontal: 6,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});